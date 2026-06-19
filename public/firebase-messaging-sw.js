importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Config should match the one in .env
// Service workers cannot use import.meta.env, so they are embedded directly. 
// Or better, we can inject them via Vite, but for simplicity we can hardcode here or inject at build time. 
// For this tutorial/implementation, we hardcode the config matching the user provided one.

const firebaseConfig = {
  apiKey: "AIzaSyACUQAG9qm7XPz7VJrWzuOBHB77HG3hUVY",
  authDomain: "oleai-a8a5b.firebaseapp.com",
  projectId: "oleai-a8a5b",
  storageBucket: "oleai-a8a5b.firebasestorage.app",
  messagingSenderId: "1022229133223",
  appId: "1:1022229133223:web:e7213bddd1cf5cfa46a882",
  measurementId: "G-DYZ8SB5J46"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
