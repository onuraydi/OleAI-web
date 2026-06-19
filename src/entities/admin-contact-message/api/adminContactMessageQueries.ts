import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminContactMessageApi } from "./adminContactMessageApi";
import { toast } from "sonner";

export const adminContactMessageKeys = {
  all: ["admin-contact-messages"] as const,
  lists: () => [...adminContactMessageKeys.all, "list"] as const,
  list: (page: number, size: number) => [...adminContactMessageKeys.lists(), page, size] as const,
};

export const useAdminContactMessages = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: adminContactMessageKeys.list(page, size),
    queryFn: () => adminContactMessageApi.getMessages(page, size),
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminContactMessageApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminContactMessageKeys.lists() });
      toast.success("Mesaj okundu olarak işaretlendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "İşlem sırasında bir hata oluştu";
      toast.error(message);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminContactMessageApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminContactMessageKeys.lists() });
      toast.success("Mesaj başarıyla silindi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Mesaj silinirken bir hata oluştu.";
      toast.error(message);
    },
  });
};
