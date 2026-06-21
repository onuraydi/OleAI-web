import { apiInstance } from "@/shared/api";
import type { RecipeListItem } from "@/entities/recipe/api/recipeApi";

export enum RecommendationMode {
  Default = 0,
  Ultimate = 1,
  Strict = 2,
  ForYou = 3,
  Quick = 4,
  Explore = 5,
  MinimalShopping = 6
}

export interface RecipeRecommendationDto {
  recipe: RecipeListItem;
  matchScore: number;
  isFallback?: boolean;
}

export interface DietaryPreferenceItem {
  id: string;
  name: string;
}

export interface AllergyItem {
  id: string;
  name: string;
}

export interface DislikedIngredientItem {
  id: string;
  name: string;
}

export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  birthDate?: string | null;
  profileImageUrl?: string | null;
  isOnboarded: boolean;
  isEmailVerified: boolean;
  createdDate: string;
  role?: string;
  dietaryPreferences: DietaryPreferenceItem[];
  allergies: AllergyItem[];
  dislikedIngredients: DislikedIngredientItem[];
}

export interface UserStatisticsResponse {
  totalRecipesCreated: number;
  totalRecipesSaved: number;
  totalPantryItems: number;
  totalRecipesLiked: number;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  birthDate?: string | null;
  profileImage?: File | null;
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
  getStatistics: async (): Promise<UserStatisticsResponse> => {
    const response = await apiInstance.get<UserStatisticsResponse>("/users/me/statistics");
    return response.data;
  },
  updateProfile: async (request: UpdateUserProfileRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    if (request.firstName !== undefined) formData.append("FirstName", request.firstName);
    if (request.lastName !== undefined) formData.append("LastName", request.lastName);
    if (request.username !== undefined) formData.append("Username", request.username);
    if (request.birthDate !== undefined && request.birthDate !== null)
      formData.append("BirthDate", request.birthDate);
    if (request.profileImage) formData.append("ProfileImage", request.profileImage);
    // Always preserve onboarded state — backend defaults IsOnboarded to false if not sent
    formData.append("IsOnboarded", "true");
    const response = await apiInstance.put<{ message: string }>("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
  getRecommendations: async (
    mode: RecommendationMode, 
    useZeroWaste: boolean = false, 
    useAllergyFilters: boolean = true,
    useDietFilters: boolean = true,
    useDislikedFilters: boolean = true
  ): Promise<RecipeRecommendationDto[]> => {
    const response = await apiInstance.get<RecipeRecommendationDto[]>("/users/me/recommendations", {
      params: { 
        mode, 
        useZeroWaste, 
        useAllergyFilters, 
        useDietFilters, 
        useDislikedFilters 
      }
    });
    return response.data;
  },
};
