import { apiInstance as apiClient } from "@/shared/api/base";
import type { AllergyRestriction, CreateAllergyDTO, UpdateAllergyDTO, AllergyApiResponse } from "../model/types";

export const adminAllergyApi = {
  getAllergies: async () => {
    const response = await apiClient.get<AllergyRestriction[]>("/allergy-restrictions");
    return response.data;
  },

  getAllergyById: async (id: string) => {
    const response = await apiClient.get<AllergyRestriction>(`/allergy-restrictions/${id}`);
    return response.data;
  },

  createAllergy: async (data: CreateAllergyDTO) => {
    const response = await apiClient.post<AllergyApiResponse>("/allergy-restrictions", data);
    return response.data;
  },

  updateAllergy: async (data: UpdateAllergyDTO) => {
    const response = await apiClient.put<AllergyApiResponse>("/allergy-restrictions", data);
    return response.data;
  },

  deleteAllergy: async (id: string) => {
    const response = await apiClient.delete<AllergyApiResponse>(`/allergy-restrictions/${id}`);
    return response.data;
  },

  restoreAllergy: async (id: string) => {
    const response = await apiClient.put<AllergyApiResponse>(`/allergy-restrictions/restore/${id}`);
    return response.data;
  },
};
