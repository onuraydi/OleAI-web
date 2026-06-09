import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCategoryApi } from "./adminCategoryApi";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../model/types";
import { toast } from "sonner";

export const adminCategoryKeys = {
  all: ["admin-categories"] as const,
  lists: () => [...adminCategoryKeys.all, "list"] as const,
  details: () => [...adminCategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...adminCategoryKeys.details(), id] as const,
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: adminCategoryKeys.lists(),
    queryFn: adminCategoryApi.getCategories,
  });
};

export const useAdminCategoryById = (id: string) => {
  return useQuery({
    queryKey: adminCategoryKeys.detail(id),
    queryFn: () => adminCategoryApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => adminCategoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success("Kategori başarıyla eklendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Kategori eklenirken bir hata oluştu";
      toast.error(message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryDTO) => adminCategoryApi.updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success("Kategori başarıyla güncellendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Kategori güncellenirken bir hata oluştu";
      toast.error(message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success("Kategori başarıyla silindi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Kategori silinirken bir hata oluştu.";
      toast.error(message);
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryApi.restoreCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success("Kategori başarıyla geri yüklendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Kategori geri yüklenirken bir hata oluştu";
      toast.error(message);
    },
  });
};
