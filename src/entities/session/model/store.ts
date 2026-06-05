import { create } from 'zustand';
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

export const useSessionStore = create<SessionState>((set) => ({
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
      // Attempt to get profile (this will trigger silent refresh if 401)
      const userData = await userApi.getProfile();
      set({ isAuth: true, user: userData, isInitialized: true });
    } catch (error) {
      set({ isAuth: false, user: null, isInitialized: true });
    }
  },
}));
