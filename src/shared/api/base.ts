import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Hardened Axios instance for OleAI Web.
 * Features:
 * - withCredentials: true for HttpOnly cookies.
 * - CSRF protection via X-XSRF-TOKEN.
 * - Automatic Token Refresh on 401.
 * - Request Queue for concurrent failures.
 */
export const apiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// CSRF Interceptor
apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const xsrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken && config.headers) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

// Response Interceptor for Autonomous Re-Auth
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If it's a refresh-token request failing, logout and reject
      if (originalRequest.url?.includes('refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using HttpOnly cookies
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
        
        processQueue(null);
        return apiInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Dispatch a custom event or let the store handle logout
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
