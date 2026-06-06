import { apiInstance } from "@/shared/api";

export interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  mainImageUrl: string;
  statusName: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const recipeApi = {
  getPublishedRecipes: async (page = 0, size = 10, searchTerm = "") => {
    const response = await apiInstance.get<PaginatedResponse<RecipeListItem>>("/recipes", {
      params: { page, size, searchTerm }
    });
    return response.data;
  }
};
