/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useForegroundNotifications, useRequestPushPermission } from './usePushNotifications';
import { requestForToken, onMessageListener } from '@/shared/lib/firebase/config';
import { registerDeviceToken } from '../api/registerDevice';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

vi.mock('@/shared/lib/firebase/config', () => ({
  requestForToken: vi.fn(),
  onMessageListener: vi.fn(),
}));

vi.mock('../api/registerDevice', () => ({
  registerDeviceToken: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useForegroundNotifications', () => {
    it('does not listen if isAuth is false', () => {
      renderHook(() => useForegroundNotifications(false));
      expect(onMessageListener).not.toHaveBeenCalled();
    });

    it('listens for foreground messages if isAuth is true', async () => {
      const mockPayload = { notification: { title: 'Test Title', body: 'Test Body' } };
      (onMessageListener as any).mockResolvedValue(mockPayload);

      renderHook(() => useForegroundNotifications(true));
      expect(onMessageListener).toHaveBeenCalled();

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Test Title', { description: 'Test Body' });
      });
    });

    it('uses fallback title if payload has no title', async () => {
      const mockPayload = { notification: { body: 'Test Body' } };
      (onMessageListener as any).mockResolvedValue(mockPayload);

      renderHook(() => useForegroundNotifications(true));
      expect(onMessageListener).toHaveBeenCalled();

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Yeni Bildirim', { description: 'Test Body' });
      });
    });
  });

  describe('useRequestPushPermission', () => {
    let mockMutate: any;

    beforeEach(() => {
      mockMutate = vi.fn();
      (useMutation as any).mockImplementation(({ mutationFn, onSuccess, onError }: any) => ({
        mutate: (vars: any) => {
          mockMutate(vars);
          mutationFn(vars).then(onSuccess).catch(onError);
        },
        isPending: false,
      }));
    });

    it('requests token and registers device if successful', async () => {
      const mockToken = 'mock-device-token';
      (requestForToken as any).mockResolvedValue(mockToken);
      (registerDeviceToken as any).mockResolvedValue({});

      const { result } = renderHook(() => useRequestPushPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(requestForToken).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith({
        deviceToken: mockToken,
        platform: 'Web',
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Bildirim izni başarıyla alındı ve cihaz kaydedildi.');
      });
    });

    it('shows error toast if requestForToken fails', async () => {
      (requestForToken as any).mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useRequestPushPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(toast.error).toHaveBeenCalledWith('Bildirim izni verilmedi veya desteklenmiyor.');
    });

    it('shows error toast if registerDevice fails', async () => {
      const mockToken = 'mock-device-token';
      (requestForToken as any).mockResolvedValue(mockToken);
      (registerDeviceToken as any).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useRequestPushPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Bildirim izni kaydedilirken bir hata oluştu.');
      });
    });
  });
});
