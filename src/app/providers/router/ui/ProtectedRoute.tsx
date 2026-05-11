import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isLoading = useSessionStore((state) => state.isLoading);

  if (isLoading) {
    return <div>Loading session...</div>; // TODO: Replace with a proper skeleton/spinner
  }

  if (!isAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
