import { apiInstance } from "@/shared/api";

export interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  mainImageUrl: string;
  statusName: string;
}

/**
 * Matches backend's Paginate<T> response structure.
 * Backend uses: pageNumber, pageSize, totalItems, totalPages, hasPreviousPage, hasNextPage
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const recipeApi = {
  getPublishedRecipes: async (page = 0, size = 10, searchTerm = "") => {
    const response = await apiInstance.get<PaginatedResponse<RecipeListItem>>("/recipes", {
      params: { page, size, searchTerm }
    });
    return response.data;
  }
};
