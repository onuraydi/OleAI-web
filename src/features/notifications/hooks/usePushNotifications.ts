import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestForToken, onMessageListener } from '@/shared/lib/firebase/config';
import { registerDeviceToken } from '../api/registerDevice';
import { toast } from 'sonner';

export const useForegroundNotifications = (isAuth: boolean) => {
  useEffect(() => {
    if (!isAuth) return;
    // Listen for foreground messages
    const listen = onMessageListener();
    listen
      .then((payload: any) => {
        toast(payload?.notification?.title || 'Yeni Bildirim', {
          description: payload?.notification?.body,
        });
      })
      .catch((err) => console.log('failed: ', err));
  }, [isAuth]);
};

export const useRequestPushPermission = () => {
  const registerMutation = useMutation({
    mutationFn: registerDeviceToken,
    onSuccess: () => {
      toast.success('Bildirim izni başarıyla alındı ve cihaz kaydedildi.');
    },
    onError: (error) => {
      console.error('Cihaz kaydedilirken hata oluştu:', error);
      toast.error('Bildirim izni kaydedilirken bir hata oluştu.');
    }
  });

  const requestPermission = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        registerMutation.mutate({
          deviceToken: token,
          platform: 'Web'
        });
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata oluştu:', error);
      toast.error('Bildirim izni verilmedi veya desteklenmiyor.');
    }
  };

  return { requestPermission, isPending: registerMutation.isPending };
};
