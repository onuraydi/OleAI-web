import { apiInstance as api } from "@/shared/api";
import type { 
  Ingredient, 
  IngredientAlias, 
  PendingRequest, 
  ResolvedRequest, 
  PaginatedResponse, 
  CreateIngredientRequest, 
  ResolveIngredientRequestDto,
  IngredientCategory
} from "../model/types";

export const adminIngredientApi = {
  // --- INGREDIENTS ---
  getIngredients: async (page: number = 0, size: number = 10) => {
    const { data } = await api.get<PaginatedResponse<Ingredient>>("/admin/Ingredients", {
      params: { page, size }
    });
    return data;
  },

  createIngredient: async (request: CreateIngredientRequest) => {
    const { data } = await api.post<{ id: string, message: string }>("/admin/Ingredients", { request });
    return data;
  },

  updateIngredient: async (id: string, request: CreateIngredientRequest) => {
    const { data } = await api.put<{ message: string }>(`/admin/Ingredients/${id}`, { request });
    return data;
  },

  deleteIngredient: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/admin/Ingredients/${id}`);
    return data;
  },

  getIngredientById: async (id: string) => {
    const { data } = await api.get<Ingredient>(`/admin/Ingredients/${id}`);
    return data;
  },

  // --- ALIASES ---
  getAliasesByIngredient: async (ingredientId: string) => {
    const { data } = await api.get<IngredientAlias[]>(`/admin/Ingredients/${ingredientId}/aliases`);
    return data;
  },

  getAllAliases: async () => {
    const { data } = await api.get<IngredientAlias[]>("/admin/Ingredients/aliases");
    return data;
  },

  addAlias: async (ingredientId: string, aliasName: string) => {
    // API expects just a string in the body
    const { data } = await api.post<{ id: string, message: string }>(
      `/admin/Ingredients/${ingredientId}/aliases`, 
      `"${aliasName}"`, 
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  },

  deleteAlias: async (aliasId: string) => {
    const { data } = await api.delete<{ message: string }>(`/admin/Ingredients/aliases/${aliasId}`);
    return data;
  },

  restoreAlias: async (aliasId: string) => {
    const { data } = await api.patch<{ message: string }>(`/admin/Ingredients/aliases/${aliasId}/restore`);
    return data;
  },

  // --- PANTRY REQUESTS ---
  getPendingRequests: async () => {
    const { data } = await api.get<PendingRequest[]>("/admin/pantry-requests/pending");
    return data;
  },

  resolveRequest: async (request: ResolveIngredientRequestDto) => {
    const { data } = await api.post<{ message: string }>("/admin/pantry-requests/resolve", { request });
    return data;
  },

  getResolvedRequests: async (page: number = 0, size: number = 20) => {
    const { data } = await api.get<PaginatedResponse<ResolvedRequest>>("/admin/pantry-requests/resolved", {
      params: { page, size }
    });
    return data;
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    const { data } = await api.get<IngredientCategory[]>("/IngredientCategories");
    return data;
  }
};
