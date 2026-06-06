import { apiInstance } from "@/shared/api/base";

export interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  excludedIngredientCount: number;
  excludedCategoryCount: number;
}

export const dietaryPreferenceApi = {
  getList: async (): Promise<DietaryPreference[]> => {
    const response = await apiInstance.get<DietaryPreference[]>("/dietary-preferences");
    return response.data;
  },
};
