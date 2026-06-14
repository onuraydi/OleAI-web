import { apiInstance } from "@/shared/api";

export interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  mainImageUrl: string;
  statusName: string;
  visibility: number;
  visibilityName: string;
  averageRating: number;
  totalRatings: number;
  prepTime: number;
  cookTime: number;
  difficulty: number;
  isLiked?: boolean;
  isSaved?: boolean;
  tags?: TagDto[];
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

export interface RecipeIngredientResponse {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unitId: number;
  unitFamily: number;
}

export interface RecipeStepResponse {
  id: string;
  stepNumber: number;
  instruction: string;
}

export interface RecipeImageResponse {
  imageUrl: string;
  isMain: boolean;
  stepId: string | null;
}

export interface RecipeStatisticsResponse {
  totalComments: number;
  totalLikes: number;
  totalDislikes: number;
  totalSaves: number;
  averageRating: number;
  totalRatings: number;
}

export interface UserInteractionResponse {
  isLiked: boolean;
  isDisliked: boolean;
  isSaved: boolean;
}

export interface BasicUserInfo {
  userId: string;
  username: string;
  profileImageUrl: string | null;
}

export interface RecipeCommentResponse {
  id: string;
  userId: string;
  username: string;
  profileImageUrl: string | null;
  content: string;
  parentCommentId: string | null;
  rating: number | null;
  createdDate: string;
  replies?: RecipeCommentResponse[];
}

export interface Paginate<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RecipeCategoryDto {
  id: number;
  name: string;
  iconName: string;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface RecipeDetailResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  visibility: number;
  status: number;
  createdDate: string;
  updatedDate: string | null;
  difficulty: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: RecipeIngredientResponse[];
  steps: RecipeStepResponse[];
  images: RecipeImageResponse[];
  categories: RecipeCategoryDto[];
  tags: TagDto[];
  statistics: RecipeStatisticsResponse;
  userInteraction: UserInteractionResponse | null;
  author: BasicUserInfo | null;
}

export interface MyComment {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeImageUrl?: string;
  content: string;
  rating?: number;
  createdDate: string;
  parentCommentId?: string;
  parentCommentContent?: string;
}

export const recipeApi = {
  getPublishedRecipes: async (page = 0, size = 10, searchTerm = "", categoryId?: number, difficulty?: number, maxTotalTime?: number, tagId?: number, sortBy?: string, isForYou?: boolean): Promise<Paginate<RecipeListItem>> => {
    const response = await apiInstance.get<Paginate<RecipeListItem>>("/recipes", {
      params: { page, size, searchTerm, categoryId, difficulty, maxTotalTime, tagId, sortBy, isForYou }
    });
    return response.data;
  },
  getRecipeById: async (id: string): Promise<RecipeDetailResponse> => {
    const response = await apiInstance.get<RecipeDetailResponse>(`/recipes/${id}`);
    return response.data;
  },
  getRecipeComments: async (id: string, page: number = 0, size: number = 10): Promise<Paginate<RecipeCommentResponse>> => {
    const response = await apiInstance.get<Paginate<RecipeCommentResponse>>(`/recipes/${id}/comments`, {
      params: { page, size }
    });
    return response.data;
  },
  toggleLike: async (id: string) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/like`);
    return response.data;
  },
  toggleDislike: async (id: string) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/dislike`);
    return response.data;
  },
  toggleSave: async (id: string) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/save`);
    return response.data;
  },
  addComment: async (id: string, content: string, parentId?: string, rating?: number) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/comments`, { content, parentCommentId: parentId, rating });
    return response.data;
  },
  updateComment: async (commentId: string, content: string, rating?: number) => {
    const response = await apiInstance.put<{ message: string }>(`/recipes/comments/${commentId}`, { newContent: content, rating });
    return response.data;
  },
  deleteComment: async (commentId: string) => {
    const response = await apiInstance.delete<{ message: string }>(`/recipes/comments/${commentId}`);
    return response.data;
  },
  startCooking: async (id: string) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/start-cooking`);
    return response.data;
  },
  createRecipe: async (formData: FormData) => {
    const response = await apiInstance.post<{ message: string; id: string }>('/recipes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteRecipe: async (id: string) => {
    const response = await apiInstance.delete<{ message: string }>(`/recipes/${id}`);
    return response.data;
  },
  updateRecipe: async (id: string, formData: FormData) => {
    const response = await apiInstance.put<{ message: string }>(`/recipes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  changeVisibility: async (id: string, visibility: number) => {
    const response = await apiInstance.patch<{ message: string }>(`/recipes/${id}/visibility`, { visibility });
    return response.data;
  },
  getRecipeCategories: async (): Promise<RecipeCategoryDto[]> => {
    const response = await apiInstance.get<RecipeCategoryDto[]>("/recipetaxonomy/categories");
    return response.data;
  },
  getRecipeTags: async (): Promise<TagDto[]> => {
    const response = await apiInstance.get<TagDto[]>("/recipetaxonomy/tags");
    return response.data;
  },
  getMyRecipes: async (page = 1, size = 10, searchTerm = "", categoryId?: number, difficulty?: number, maxTotalTime?: number, tagId?: number, visibility?: number, sortBy?: string): Promise<Paginate<RecipeListItem>> => {
    const response = await apiInstance.get<Paginate<RecipeListItem>>("/recipes/my-recipes", { 
      params: { page, size, searchTerm, categoryId, difficulty, maxTotalTime, tagId, visibility, sortBy } 
    });
    return response.data;
  },
  getMySavedRecipes: async (page = 1, size = 10, searchTerm = "", categoryId?: number, difficulty?: number, maxTotalTime?: number, tagId?: number, sortBy?: string): Promise<Paginate<RecipeListItem>> => {
    const response = await apiInstance.get<Paginate<RecipeListItem>>("/recipes/me/saved-recipes", { 
      params: { page, size, searchTerm, categoryId, difficulty, maxTotalTime, tagId, sortBy } 
    });
    return response.data;
  },
  getMyLikedRecipes: async (page = 1, size = 10, searchTerm = "", categoryId?: number, difficulty?: number, maxTotalTime?: number, tagId?: number, sortBy?: string): Promise<Paginate<RecipeListItem>> => {
    const response = await apiInstance.get<Paginate<RecipeListItem>>("/recipes/me/liked-recipes", { 
      params: { page, size, searchTerm, categoryId, difficulty, maxTotalTime, tagId, sortBy } 
    });
    return response.data;
  },
  getMyDislikedRecipes: async (page = 1, size = 10, searchTerm = ""): Promise<Paginate<RecipeListItem>> => {
    const response = await apiInstance.get<Paginate<RecipeListItem>>("/recipes/me/disliked-recipes", { params: { page, size, searchTerm } });
    return response.data;
  },
  getMyComments: async (page = 0, size = 10, searchTerm = "", sortBy?: string): Promise<Paginate<MyComment>> => {
    const response = await apiInstance.get<Paginate<MyComment>>("/recipes/my-comments", {
      params: { page, size, searchTerm, sortBy }
    });
    return response.data;
  },
};
