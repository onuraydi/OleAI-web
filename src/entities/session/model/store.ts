import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/entities/user/api/userApi';

interface User {
  id: string;
  email: string;
  role: string;
}

interface SessionState {
  isAuth: boolean;
  user: User | null;
  isInitialized: boolean;
  setAuth: (isAuth: boolean, user?: User | null) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      isAuth: false,
      user: null,
      isInitialized: false,
      setAuth: (isAuth, user = null) => set({ isAuth, user, isInitialized: true }),
      logout: () => {
        // Clear cookies should be handled by backend or manual call
        set({ isAuth: false, user: null, isInitialized: true });
      },
      initialize: async () => {
        try {
          const userData = await userApi.getProfile();
          const currentRole = get().user?.role || 'User';
          set({ 
            isAuth: true, 
            user: { ...userData, role: currentRole }, 
            isInitialized: true 
          });
        } catch (error) {
          set({ isAuth: false, user: null, isInitialized: true });
        }
      },
    }),
    {
      name: 'session-storage',
      // Only persist the user object to keep the role. isAuth and isInitialized shouldn't be blindly trusted on load.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
