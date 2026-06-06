import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage, LoginPage, NotFoundPage, LandingPage, ForgotPasswordPage, RegisterPage, VerifyEmailPage, OnboardingPage, PreferencesPage, PantryPage, RecipeDetailPage } from '@/pages';
import { ProtectedRoute } from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/home',
        element: <HomePage />,
      },
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '/preferences',
        element: <PreferencesPage />,
      },
      {
        path: '/pantry',
        element: <PantryPage />,
      },
      {
        path: '/recipes/:id',
        element: <RecipeDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
