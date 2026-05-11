import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
}

interface SessionState {
  isAuth: boolean;
  user: User | null;
  isLoading: boolean;
  setAuth: (isAuth: boolean, user?: User | null) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuth: false,
      user: null,
      isLoading: true,
      setAuth: (isAuth, user = null) => set({ isAuth, user, isLoading: false }),
      logout: () => set({ isAuth: false, user: null, isLoading: false }),
    }),
    {
      name: 'oleai-session',
      partialize: (state) => ({ isAuth: state.isAuth, user: state.user }),
    }
  )
);
