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

export interface RecipeIngredientResponse {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unitId: number;
  unitFamily: number;
}

export interface RecipeStepResponse {
  stepNumber: number;
  instruction: string;
}

export interface RecipeImageResponse {
  imageUrl: string;
  isMain: boolean;
  stepId: string | null;
}

export interface RecipeStatisticsResponse {
  comments: number;
  likes: number;
  dislikes: number;
  saves: number;
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

export interface RecipeDetailResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  visibility: number;
  status: number;
  createdDate: string;
  updatedDate: string | null;
  ingredients: RecipeIngredientResponse[];
  steps: RecipeStepResponse[];
  images: RecipeImageResponse[];
  statistics: RecipeStatisticsResponse;
  userInteraction: UserInteractionResponse | null;
  author: BasicUserInfo | null;
}

export const recipeApi = {
  getPublishedRecipes: async (page = 0, size = 10, searchTerm = "") => {
    const response = await apiInstance.get<PaginatedResponse<RecipeListItem>>("/recipes", {
      params: { page, size, searchTerm }
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
  addComment: async (id: string, content: string, parentId?: string) => {
    const response = await apiInstance.post<{ message: string }>(`/recipes/${id}/comments`, { content, parentCommentId: parentId });
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
  }
};
