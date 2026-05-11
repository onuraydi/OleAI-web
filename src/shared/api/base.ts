import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Hardened Axios instance for OleAI Web.
 * Features:
 * - withCredentials: true for HttpOnly cookies.
 * - CSRF protection via X-XSRF-TOKEN.
 * - Centralized error handling.
 */
export const apiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF Interceptor
apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token from cookie manually if needed, but usually Axios handles XSRF-TOKEN if configured.
  // Standard backend implementations expect the token in 'X-XSRF-TOKEN' header.
  const xsrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken && config.headers) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

// Response Interceptor for Error Handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Global 401 (Unauthorized) handling - should trigger re-auth or logout
      if (status === 401) {
        // Handle 401 logic here or via a dedicated event bus/store
        console.error('[API] Unauthorized - 401');
      }
      
      // Global 403 (Forbidden)
      if (status === 403) {
        console.error('[API] Forbidden - 403');
      }
      
      // Global 500 (Server Error)
      if (status >= 500) {
        console.error('[API] Internal Server Error - 500+');
      }
    }
    
    return Promise.reject(error);
  }
);
