import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isInitialized = useSessionStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null; // Return null to avoid flickering before session check is done
  }

  if (!isAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
