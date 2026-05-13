import { apiInstance } from "@/shared/api/base";

export interface IngredientSearchResult {
  masterIngredientId: string;
  displayName: string;
  isAlias: boolean;
  unitFamily: number;
  categoryId: string;
  categoryName: string;
}

export const pantryApi = {
  searchIngredients: async (keyword: string): Promise<IngredientSearchResult[]> => {
    if (keyword.length < 2) return [];
    const response = await apiInstance.get<IngredientSearchResult[]>(`/pantry/search?keyword=${keyword}`);
    return response.data;
  },
};
