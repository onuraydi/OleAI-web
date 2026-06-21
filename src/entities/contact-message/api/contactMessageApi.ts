import { useMutation } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import { toast } from "sonner";

export interface CreateContactMessageCommand {
  name: string;
  email: string;
  department: string;
  message: string;
}

export const useCreateContactMessage = () => {
  return useMutation({
    mutationFn: async (data: CreateContactMessageCommand) => {
      const response = await apiInstance.post("/contactmessages", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mesajınız Gönderildi", {
        description: "Mesajınızı aldık, en kısa sürede size dönüş yapacağız."
      });
    },
    onError: () => {
      toast.error("Hata", {
        description: "Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      });
    },
  });
};
