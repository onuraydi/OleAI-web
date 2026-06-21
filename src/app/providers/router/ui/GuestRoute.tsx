import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface GuestRouteProps {
  redirectPath?: string;
}

export const GuestRoute = ({ redirectPath = '/home' }: GuestRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isInitialized = useSessionStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null;
  }

  if (isAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
