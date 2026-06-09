import { apiInstance } from "@/shared/api/base";
import { MeasurementCategory, MeasurementUnit } from "@/shared/constants/measurement";

export interface PantryItemResponse {
  id: string;
  ingredientId: string;
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
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface AddUserIngredientRequest {
  ingredientId?: string;
  requestedName?: string;
  suggestedCategoryId?: string;
  quantity: number;
  unit: MeasurementUnit;
  expirationDate?: string;
}

export interface PopularDislikedIngredientResponse {
  id: string;
  name: string;
  categoryName: string;
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

  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiInstance.get<CategoryResponse[]>("/IngredientCategories");
    return response.data;
  },

  addIngredient: async (request: AddUserIngredientRequest): Promise<void> => {
    await apiInstance.post("/Pantry", { request });
  }
};

