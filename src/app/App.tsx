import { useEffect } from 'react';
import { QueryProvider } from './providers/query/QueryProvider';
import { ThemeProvider } from './providers/theme';
import { AppRouter } from './providers/router';
import { useSessionStore } from '@/entities/session';
import { useForegroundNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { Toaster } from '@/shared/ui/sonner';
import '../index.css';

function InnerApp() {
  const initialize = useSessionStore((s) => s.initialize);
  const logout = useSessionStore((s) => s.logout);
  const isAuth = useSessionStore((s) => s.isAuth);

  useForegroundNotifications(isAuth);

  useEffect(() => {
    initialize();

    // Listen for global unauthorized events (e.g. from axios interceptor after failed refresh)
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [initialize, logout]);

  return <AppRouter />;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <InnerApp />
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
