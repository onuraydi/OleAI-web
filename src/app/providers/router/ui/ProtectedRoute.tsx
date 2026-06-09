import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface ProtectedRouteProps {
  redirectPath?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ redirectPath = '/login', allowedRoles }: ProtectedRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isInitialized = useSessionStore((state) => state.isInitialized);
  const user = useSessionStore((state) => state.user);

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

  // Check onboarding completion for non-admin users
  if (user.role !== 'Admin') {
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_${user.id}`);
    const currentPath = window.location.pathname;
    const isAllowedPaths = currentPath === '/onboarding' || currentPath === '/preferences';

    if (!hasCompletedOnboarding && !isAllowedPaths) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <Outlet />;
};
