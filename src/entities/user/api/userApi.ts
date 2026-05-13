import { apiInstance } from "@/shared/api/base";

export interface UpdateUserPreferencesRequest {
  dietaryPreferenceIds: string[];
}

export interface UpdateUserAllergiesRequest {
  allergyRestrictionIds: string[];
}

export interface UpdateUserDislikedIngredientsRequest {
  ingredientIds: string[];
}

export const userApi = {
  updateDietaryPreferences: async (request: UpdateUserPreferencesRequest): Promise<{ message: string }> => {
    const response = await apiInstance.put<{ message: string }>("/users/me/dietary-preferences", request);
    return response.data;
  },
  updateAllergies: async (request: UpdateUserAllergiesRequest): Promise<{ message: string }> => {
    const response = await apiInstance.put<{ message: string }>("/users/me/allergies", request);
    return response.data;
  },
  updateDislikedIngredients: async (request: UpdateUserDislikedIngredientsRequest): Promise<{ message: string }> => {
    const response = await apiInstance.put<{ message: string }>("/users/me/disliked-ingredients", request);
    return response.data;
  },
};
