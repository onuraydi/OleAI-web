import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const isInitialized = useSessionStore((state) => state.isInitialized);
  const user = useSessionStore((state) => state.user);
  const location = useLocation();

  if (!isInitialized) {
    return null; // Return null to avoid flickering before session check is done
  }

  if (!isAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  // If user hasn't completed onboarding and isn't already on onboarding/preferences pages,
  // redirect them to the onboarding introduction page first
  const onboardingPaths = ['/preferences', '/onboarding'];
  const isOnOnboardingPage = onboardingPaths.some((path) => location.pathname.startsWith(path));

  if (user && !user.isOnboardingCompleted && !isOnOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
