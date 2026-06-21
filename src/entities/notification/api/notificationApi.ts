import { apiInstance as api } from '@/shared/api/base';
import type { Notification, PaginatedResponse } from '../model/types';

export const notificationApi = {
  getMyNotifications: async (page = 0, size = 10, onlyUnread = false) => {
    const { data } = await api.get<PaginatedResponse<Notification>>('/Notifications', {
      params: { page, size, onlyUnread },
    });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<{ count: number }>('/Notifications/unread-count');
    return data.count;
  },

  markAsRead: async (id: string) => {
    await api.put(`/Notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.put('/Notifications/read-all');
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/Notifications/${id}`);
  },
};
