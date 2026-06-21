import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { apiInstance } from '@/shared/api/base';
import { toast } from 'sonner';

export const useMyNotifications = (page = 0, size = 10, onlyUnread = false) => {
  return useQuery({
    queryKey: ['notifications', page, size, onlyUnread],
    queryFn: () => notificationApi.getMyNotifications(page, size, onlyUnread),
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiInstance.delete(`/Notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Bildirim başarıyla silindi.');
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
      toast.error('Bildirim silinirken bir hata oluştu.');
    },
  });
};

export const useSendGlobalNotification = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await apiInstance.post('/Notifications/send-global', `"${message}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Global bildirim başarıyla gönderildi.');
    },
    onError: (error) => {
      console.error('Failed to send global notification:', error);
      toast.error('Global bildirim gönderilirken bir hata oluştu.');
    },
  });
};
