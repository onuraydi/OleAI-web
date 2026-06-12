import { apiInstance } from "@/shared/api/base";
import { MeasurementCategory, MeasurementUnit } from "@/shared/constants/measurement";

export interface PantryItemResponse {
  id: string;
  masterIngredientId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unit: string;
  expirationDate: string | null;
  isPendingApproval: boolean;
}

export interface IngredientSearchResultResponse {
  masterIngredientId: string;
  displayName: string;
  isAlias: boolean;
  unitFamily: MeasurementCategory;
  categoryId: string;
  categoryName: string;
  estimatedShelfLifeInDays?: number | null;
  defaultExpirationMode?: number; // 1: Auto, 2: ShelfLife, 3: ExactDate
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface PopularCategoryResponse {
  categoryId: string;
  categoryName: string;
  iconName: string;
  ingredients: IngredientSearchResultResponse[];
}

export interface AddUserIngredientRequest {
  ingredientId?: string;
  requestedName?: string;
  suggestedCategoryId?: string;
  quantity: number;
  unit: MeasurementUnit;
  expirationDate?: string;
  estimatedShelfLifeInDays?: number;
}

export interface PopularDislikedIngredientResponse {
  id: string;
  name: string;
  categoryName: string;
}

export interface AddMultipleUserIngredientsRequest {
  ingredients: AddUserIngredientRequest[];
}

export const pantryApi = {
  getMyPantry: async (): Promise<PantryItemResponse[]> => {
    const response = await apiInstance.get<PantryItemResponse[]>("/Pantry");
    return response.data;
  },

  searchIngredients: async (keyword: string): Promise<IngredientSearchResultResponse[]> => {
    const response = await apiInstance.get<IngredientSearchResultResponse[]>("/Pantry/search", {
      params: { keyword }
    });
    return response.data;
  },

  getPopularDislikes: async (): Promise<PopularDislikedIngredientResponse[]> => {
    const response = await apiInstance.get<PopularDislikedIngredientResponse[]>("/Pantry/popular-dislikes");
    return response.data;
  },

  getPopularByCategory: async (): Promise<PopularCategoryResponse[]> => {
    const response = await apiInstance.get<PopularCategoryResponse[]>("/Pantry/popular-by-category");
    return response.data;
  },

  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiInstance.get<CategoryResponse[]>("/IngredientCategories");
    return response.data;
  },

  addIngredient: async (request: AddUserIngredientRequest): Promise<void> => {
    await apiInstance.post("/Pantry", { request });
  },

  addMultipleIngredients: async (request: AddMultipleUserIngredientsRequest): Promise<void> => {
    await apiInstance.post("/Pantry/bulk", { request });
  },

  updateIngredientQuantity: async (id: string, newQuantity: number, expirationDate?: string): Promise<void> => {
    const payload = {
      newQuantity: newQuantity,
      expirationDate: expirationDate
    };
    await apiInstance.put(`/Pantry/${id}`, payload, {
      headers: { "Content-Type": "application/json" }
    });
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await apiInstance.delete(`/Pantry/${id}`);
  }
};

