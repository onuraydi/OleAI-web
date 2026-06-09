import { apiInstance as api } from '@/shared/api/base';
import type { CreateDietDTO, DietDetailDTO, DietDTO, UpdateDietDTO } from '../model/types';

export const adminDietApi = {
  getAll: async () => {
    const response = await api.get<DietDTO[]>('/dietary-preferences');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<DietDetailDTO>(`/dietary-preferences/${id}`);
    return response.data;
  },

  create: async (data: CreateDietDTO) => {
    const response = await api.post<{ message: string }>('/dietary-preferences', data);
    return response.data;
  },

  update: async (data: UpdateDietDTO) => {
    const response = await api.put<{ message: string }>('/dietary-preferences', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/dietary-preferences/${id}`);
    return response.data;
  },

  restore: async (id: string) => {
    const response = await api.put<{ message: string }>(`/dietary-preferences/${id}/restore`);
    return response.data;
  },
};
