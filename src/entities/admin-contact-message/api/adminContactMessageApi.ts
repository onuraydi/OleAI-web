import { apiInstance as apiClient } from "@/shared/api/base";
import type { ContactMessage, PaginatedResponse, ContactMessageApiResponse } from "../model/types";

export const adminContactMessageApi = {
  getMessages: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get<PaginatedResponse<ContactMessage>>("/admin/contact-messages", {
      params: { page, size }
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch<ContactMessageApiResponse>(`/admin/contact-messages/${id}/read`);
    return response.data;
  },

  deleteMessage: async (id: string) => {
    const response = await apiClient.delete<ContactMessageApiResponse>(`/admin/contact-messages/${id}`);
    return response.data;
  },
};
