import { apiInstance } from "@/shared/api";

/**
 * Backend MeasurementCategory enum — serialized as string via JsonStringEnumConverter.
 */
type MeasurementCategory = 'Weight' | 'Volume' | 'Count' | 'Other';

export interface IngredientSearchResult {
  masterIngredientId: string;
  displayName: string;
  isAlias: boolean;
  unitFamily: MeasurementCategory;
  categoryId: string;
  categoryName: string;
}

export const pantryApi = {
  searchIngredients: async (keyword: string): Promise<IngredientSearchResult[]> => {
    if (keyword.length < 2) return [];
    const response = await apiInstance.get<IngredientSearchResult[]>('/pantry/search', { params: { keyword } });
    return response.data;
  },
};
