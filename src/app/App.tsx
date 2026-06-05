import { useEffect } from 'react';
import { QueryProvider } from './providers/query/QueryProvider';
import { ThemeProvider } from './providers/theme';
import { AppRouter } from './providers/router';
import { useSessionStore } from '@/entities/session';
import '../index.css';

function App() {
  const initialize = useSessionStore((s) => s.initialize);
  const logout = useSessionStore((s) => s.logout);

  useEffect(() => {
    initialize();

    // Listen for global unauthorized events (e.g. from axios interceptor after failed refresh)
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [initialize, logout]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
