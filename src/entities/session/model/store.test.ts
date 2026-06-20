import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from './store';
import { sessionApi } from '@/entities/session/api/sessionApi';
import { userApi } from '@/entities/user/api/userApi';
import { queryClient } from '@/app/providers/query/QueryProvider';
import { toast } from 'sonner';

vi.mock('@/entities/session/api/sessionApi');
vi.mock('@/entities/user/api/userApi');
vi.mock('@/app/providers/query/QueryProvider', () => ({
  queryClient: { clear: vi.fn() }
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ isAuth: false, user: null, isInitialized: false });
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(false);
  });

  it('setAuth updates auth state and user', () => {
    const mockUser = { id: '1', email: 'test@test.com', role: 'User' };
    useSessionStore.getState().setAuth(true, mockUser);
    
    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.isInitialized).toBe(true);
  });

  it('initialize sets user data when API succeeds', async () => {
    const mockProfile = { id: '2', email: 'user@example.com', role: 'Admin', isOnboarded: true };
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(mockProfile as any);

    await useSessionStore.getState().initialize();

    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(true);
    expect(state.user?.email).toBe('user@example.com');
    expect(state.isInitialized).toBe(true);
  });

  it('initialize sets auth false when API fails', async () => {
    vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error('Unauthorized'));

    await useSessionStore.getState().initialize();

    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(true);
  });

  it('logout calls sessionApi.logout and clears state', async () => {
    vi.mocked(sessionApi.logout).mockResolvedValueOnce(undefined);
    useSessionStore.setState({ isAuth: true, user: { id: '1', email: 'test@test.com', role: 'User' } });

    await useSessionStore.getState().logout();

    expect(sessionApi.logout).toHaveBeenCalled();
    expect(queryClient.clear).toHaveBeenCalled();
    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(false);
    expect(state.user).toBeNull();
  });

  it('logout handles API failure gracefully', async () => {
    vi.mocked(sessionApi.logout).mockRejectedValueOnce(new Error('Network error'));
    useSessionStore.setState({ isAuth: true, user: { id: '1', email: 'test@test.com', role: 'User' } });

    await useSessionStore.getState().logout();

    expect(toast.error).toHaveBeenCalled();
    expect(queryClient.clear).toHaveBeenCalled();
    const state = useSessionStore.getState();
    expect(state.isAuth).toBe(false);
    expect(state.user).toBeNull();
  });
});
