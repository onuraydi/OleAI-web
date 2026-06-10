import { apiInstance } from '@/shared/api';
import type {
  RecipeCategory,
  CreateRecipeCategoryDto,
  UpdateRecipeCategoryDto,
  Tag,
  CreateTagDto,
  UpdateTagDto,
} from '../model/types';

export const adminRecipeTaxonomyApi = {
  // Categories
  getCategories: async (): Promise<RecipeCategory[]> => {
    const response = await apiInstance.get('/recipetaxonomy/categories');
    return response.data;
  },
  createCategory: async (data: CreateRecipeCategoryDto): Promise<string> => {
    const response = await apiInstance.post('/recipetaxonomy/categories', data);
    return response.data;
  },
  updateCategory: async (data: UpdateRecipeCategoryDto): Promise<string> => {
    const response = await apiInstance.put('/recipetaxonomy/categories', data);
    return response.data;
  },
  deleteCategory: async (id: number): Promise<string> => {
    const response = await apiInstance.delete(`/recipetaxonomy/categories/${id}`);
    return response.data;
  },

  // Tags
  getTags: async (): Promise<Tag[]> => {
    const response = await apiInstance.get('/recipetaxonomy/tags');
    return response.data;
  },
  createTag: async (data: CreateTagDto): Promise<string> => {
    const response = await apiInstance.post('/recipetaxonomy/tags', data);
    return response.data;
  },
  updateTag: async (data: UpdateTagDto): Promise<string> => {
    const response = await apiInstance.put('/recipetaxonomy/tags', data);
    return response.data;
  },
  deleteTag: async (id: number): Promise<string> => {
    const response = await apiInstance.delete(`/recipetaxonomy/tags/${id}`);
    return response.data;
  }
};
