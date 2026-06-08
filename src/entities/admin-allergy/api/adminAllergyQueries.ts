import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAllergyApi } from "./adminAllergyApi";
import type { CreateAllergyDTO, UpdateAllergyDTO } from "../model/types";
import { toast } from "sonner";

export const adminAllergyKeys = {
  all: ["admin-allergies"] as const,
  lists: () => [...adminAllergyKeys.all, "list"] as const,
  details: () => [...adminAllergyKeys.all, "detail"] as const,
  detail: (id: string) => [...adminAllergyKeys.details(), id] as const,
};

export const useAdminAllergies = () => {
  return useQuery({
    queryKey: adminAllergyKeys.lists(),
    queryFn: adminAllergyApi.getAllergies,
  });
};

export const useAdminAllergyById = (id: string) => {
  return useQuery({
    queryKey: adminAllergyKeys.detail(id),
    queryFn: () => adminAllergyApi.getAllergyById(id),
    enabled: !!id,
  });
};

export const useCreateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllergyDTO) => adminAllergyApi.createAllergy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAllergyKeys.lists() });
      toast.success("Alerji başarıyla eklendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Alerji eklenirken bir hata oluştu";
      toast.error(message);
    },
  });
};

export const useUpdateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAllergyDTO) => adminAllergyApi.updateAllergy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAllergyKeys.lists() });
      toast.success("Alerji başarıyla güncellendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Alerji güncellenirken bir hata oluştu";
      toast.error(message);
    },
  });
};

export const useDeleteAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAllergyApi.deleteAllergy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAllergyKeys.lists() });
      toast.success("Alerji başarıyla silindi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Alerji silinirken bir hata oluştu.";
      toast.error(message);
    },
  });
};

export const useRestoreAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAllergyApi.restoreAllergy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAllergyKeys.lists() });
      toast.success("Alerji başarıyla geri yüklendi");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.message || "Alerji geri yüklenirken bir hata oluştu.";
      toast.error(message);
    },
  });
};
