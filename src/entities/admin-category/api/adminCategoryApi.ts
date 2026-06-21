import { apiInstance } from "@/shared/api";
import type { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryApiResponse } from "../model/types";

export const adminCategoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiInstance.get<Category[]>("/admin/categories");
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiInstance.get<Category>(`/admin/categories/${id}`);
    return response.data;
  },

  // Create new category
  createCategory: async (data: CreateCategoryDTO): Promise<CategoryApiResponse> => {
    // Backend expects { request: { name, iconName } }
    const response = await apiInstance.post<CategoryApiResponse>("/admin/categories", { request: data });
    return response.data;
  },

  // Update category
  updateCategory: async (data: UpdateCategoryDTO): Promise<CategoryApiResponse> => {
    const { id, ...updateData } = data;
    const response = await apiInstance.put<CategoryApiResponse>(`/admin/categories/${id}`, { request: { id, ...updateData } });
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<CategoryApiResponse> => {
    const response = await apiInstance.delete<CategoryApiResponse>(`/admin/categories/${id}`);
    return response.data;
  },

  restoreCategory: async (id: string): Promise<CategoryApiResponse> => {
    const response = await apiInstance.patch<CategoryApiResponse>(`/admin/categories/${id}/restore`);
    return response.data;
  },
};
