import { apiInstance } from "@/shared/api";

/**
 * Matches backend's UserProfileResponse exactly.
 * Note: Backend does NOT include 'role' in the profile response.
 */
export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  createdDate: string;
  dietaryPreferences: DietaryPreferenceItemResponse[];
  allergies: AllergyRestrictionItemResponse[];
  dislikedIngredients: DislikedIngredientItemResponse[];
}

export interface DietaryPreferenceItemResponse {
  id: string;
  name: string;
}

export interface AllergyRestrictionItemResponse {
  id: string;
  name: string;
}

export interface DislikedIngredientItemResponse {
  ingredientId: string;
  displayName: string;
}

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
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiInstance.get<UserProfileResponse>("/users/me");
    return response.data;
  },
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
