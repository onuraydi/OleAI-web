import { apiInstance as api } from '@/shared/api/base';
import type { PaginatedAdminRecipesResponse } from '../types';

export interface GetAdminRecipesParams {
  page: number;
  size: number;
  status?: string;
  visibility?: string;
  searchTerm?: string;
}

export const adminRecipeApi = {
  getAllRecipes: async (params: GetAdminRecipesParams): Promise<PaginatedAdminRecipesResponse> => {
    // TanStack query uses 1-indexed for UI, backend might use 0-indexed. Let's pass what UI uses and let backend handle it.
    // Assuming backend receives 0-indexed. We decrement page by 1.
    const queryParams = new URLSearchParams({
      page: (params.page - 1).toString(),
      size: params.size.toString(),
    });

    if (params.status && params.status !== 'All') {
      queryParams.append('Status', params.status);
    }
    
    if (params.visibility && params.visibility !== 'All') {
      queryParams.append('Visibility', params.visibility);
    }
    
    if (params.searchTerm) {
      queryParams.append('SearchTerm', params.searchTerm);
    }

    const { data } = await api.get<PaginatedAdminRecipesResponse>(`/Recipes/admin/all?${queryParams.toString()}`);
    return data;
  },

  approveRecipe: async (id: string): Promise<void> => {
    await api.post(`/Recipes/${id}/approve`);
  },

  rejectRecipe: async (id: string, reason: string): Promise<void> => {
    await api.post(`/Recipes/${id}/reject`, { reason });
  },

  getDeletedRecipes: async (params: { page: number; size: number; searchTerm?: string }): Promise<PaginatedAdminRecipesResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page - 1).toString(),
      size: params.size.toString(),
    });
    if (params.searchTerm) {
      queryParams.append('SearchTerm', params.searchTerm);
    }
    const { data } = await api.get<PaginatedAdminRecipesResponse>(`/Recipes/admin/deleted?${queryParams.toString()}`);
    return data;
  },

  restoreRecipe: async (id: string): Promise<void> => {
    await api.post(`/Recipes/${id}/restore`);
  },

  hardDeleteRecipe: async (id: string): Promise<void> => {
    await api.delete(`/Recipes/${id}/hard`);
  },

  syncAllToAi: async (): Promise<void> => {
    await api.post('/Recipes/sync-all-to-ai');
  }
};
