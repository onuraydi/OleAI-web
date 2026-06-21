import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface ProtectedRouteProps {
  redirectPath?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ redirectPath = '/login', allowedRoles }: ProtectedRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isInitialized = useSessionStore((state) => state.isInitialized);
  const user = useSessionStore((state) => state.user);
  const location = useLocation();

  if (!isInitialized) {
    return null; // Return null to avoid flickering before session check is done
  }

  if (!isAuth || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }

  // Check onboarding completion for all users
  const hasCompletedOnboarding = user.isOnboarded;
  const currentPath = location.pathname;
  const isAllowedPaths = currentPath === '/onboarding' || currentPath === '/preferences';

  if (!hasCompletedOnboarding && !isAllowedPaths) {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasCompletedOnboarding && isAllowedPaths) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
