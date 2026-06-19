import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/entities/user/api/userApi';
import { sessionApi } from '@/entities/session/api/sessionApi';
import { queryClient } from '@/app/providers/query/QueryProvider';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: string;
  username?: string;
  profileImageUrl?: string;
  isOnboarded?: boolean;
}

interface SessionState {
  isAuth: boolean;
  user: User | null;
  isInitialized: boolean;
  setAuth: (isAuth: boolean, user?: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      isAuth: false,
      user: null,
      isInitialized: false,
      setAuth: (isAuth, user = null) => set({ isAuth, user, isInitialized: true }),
      logout: async () => {
        try {
          await sessionApi.logout();
        } catch (error) {
          console.error("Logout failed", error);
          toast.error("Oturum kapatılırken sunucuyla iletişim kurulamadı. Güvenliğiniz için yerel veriler temizlendi.");
        } finally {
          set({ isAuth: false, user: null, isInitialized: true });
          queryClient.clear();
        }
      },
      initialize: async () => {
        try {
          const userData = await userApi.getProfile();
          const currentRole = get().user?.role || 'User';
          set({
            isAuth: true,
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role ?? currentRole,
              username: userData.username,
              profileImageUrl: userData.profileImageUrl ?? undefined,
              isOnboarded: userData.isOnboarded,
            },
            isInitialized: true,
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
