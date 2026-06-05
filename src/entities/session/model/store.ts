import { create } from 'zustand';
import { apiInstance } from '@/shared/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isOnboardingCompleted: boolean;
}

/**
 * Matches backend's UserProfileResponse exactly.
 * Note: Backend does NOT include 'role' in the profile response.
 */
interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  createdDate: string;
  dietaryPreferences: unknown[];
  allergies: unknown[];
  dislikedIngredients: unknown[];
}

interface SessionState {
  isAuth: boolean;
  user: User | null;
  isInitialized: boolean;
  setAuth: (isAuth: boolean, user?: User | null) => void;
  setOnboardingCompleted: () => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

/**
 * Determines onboarding completion based on whether the user has set
 * at least one dietary preference, allergy, or disliked ingredient,
 * OR has explicitly completed onboarding on this device.
 */
const deriveOnboardingStatus = (profile: ProfileResponse): boolean => {
  const localCompleted = localStorage.getItem(`onboarding_completed_${profile.id}`) === 'true';
  return (
    localCompleted ||
    profile.dietaryPreferences.length > 0 ||
    profile.allergies.length > 0 ||
    profile.dislikedIngredients.length > 0
  );
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuth: false,
  user: null,
  isInitialized: false,
  setAuth: (isAuth, user = null) => set({ isAuth, user, isInitialized: true }),
  setOnboardingCompleted: () =>
    set((state) => {
      if (state.user) {
        localStorage.setItem(`onboarding_completed_${state.user.id}`, 'true');
        return {
          user: { ...state.user, isOnboardingCompleted: true },
        };
      }
      return {};
    }),
  logout: () => {
    // Invalidate server-side session (fire-and-forget)
    apiInstance.post('/auth/logout').catch(() => {});
    set({ isAuth: false, user: null, isInitialized: true });
  },
  initialize: async () => {
    try {
      // Silent session check — triggers automatic refresh via interceptor on 401
      const response = await apiInstance.get<ProfileResponse>('/users/me');
      const profile = response.data;

      const user: User = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        isOnboardingCompleted: deriveOnboardingStatus(profile),
      };

      set({ isAuth: true, user, isInitialized: true });
    } catch {
      set({ isAuth: false, user: null, isInitialized: true });
    }
  },
}));
