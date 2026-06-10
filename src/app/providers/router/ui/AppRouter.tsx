import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage, LoginPage, NotFoundPage, LandingPage, ForgotPasswordPage, RegisterPage, VerifyEmailPage, OnboardingPage, PreferencesPage, PantryPage, RecipeDetailPage, CreateRecipePage, RecipesPage, ShoppingListPage, AdminDashboardPage, AdminIngredientsPage, AdminCategoriesPage, AdminAllergiesPage, AdminDietsPage, AdminUsersPage, AdminRecipesPage, AdminRecipeDetailPage, AdminEditRecipePage, AdminRecipeTaxonomyPage, PrivacyPage, TermsPage, ContactPage, HelpPage, ProfilePage } from '@/pages';
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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/help',
    element: <HelpPage />,
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
        path: '/recipes',
        element: <RecipesPage />,
      },
      {
        path: '/recipes/create',
        element: <CreateRecipePage />,
      },
      {
        path: '/recipes/:id',
        element: <RecipeDetailPage />,
      },
      {
        path: '/shopping-list',
        element: <ShoppingListPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'ingredients',
        element: <AdminIngredientsPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'allergies',
        element: <AdminAllergiesPage />,
      },
      {
        path: 'diets',
        element: <AdminDietsPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'recipes',
        element: <AdminRecipesPage />,
      },
      {
        path: 'recipes/:id',
        element: <AdminRecipeDetailPage />,
      },
      {
        path: 'recipes/edit/:id',
        element: <AdminEditRecipePage />,
      },
      {
        path: 'recipe-taxonomy',
        element: <AdminRecipeTaxonomyPage />,
      },
    ],
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
