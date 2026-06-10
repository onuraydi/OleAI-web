import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRecipeTaxonomyApi } from './adminRecipeTaxonomyApi';
import type { CreateRecipeCategoryDto, UpdateRecipeCategoryDto, CreateTagDto, UpdateTagDto } from '../model/types';
import { toast } from 'sonner';

export const ADMIN_RECIPE_TAXONOMY_KEYS = {
  categories: ['admin', 'recipe-categories'] as const,
  tags: ['admin', 'tags'] as const,
};

// Categories Hooks
export const useAdminRecipeCategories = () => {
  return useQuery({
    queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.categories,
    queryFn: adminRecipeTaxonomyApi.getCategories,
  });
};

export const useCreateRecipeCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipeCategoryDto) => adminRecipeTaxonomyApi.createCategory(data),
    onSuccess: (message) => {
      toast.success(message || 'Kategori başarıyla eklendi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.categories });
    },
    onError: () => toast.error('Kategori eklenirken bir hata oluştu.'),
  });
};

export const useUpdateRecipeCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRecipeCategoryDto) => adminRecipeTaxonomyApi.updateCategory(data),
    onSuccess: (message) => {
      toast.success(message || 'Kategori başarıyla güncellendi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.categories });
    },
    onError: () => toast.error('Kategori güncellenirken bir hata oluştu.'),
  });
};

export const useDeleteRecipeCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminRecipeTaxonomyApi.deleteCategory(id),
    onSuccess: (message) => {
      toast.success(message || 'Kategori başarıyla silindi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.categories });
    },
    onError: () => toast.error('Kategori silinirken bir hata oluştu.'),
  });
};

// Tags Hooks
export const useAdminTags = () => {
  return useQuery({
    queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.tags,
    queryFn: adminRecipeTaxonomyApi.getTags,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagDto) => adminRecipeTaxonomyApi.createTag(data),
    onSuccess: (message) => {
      toast.success(message || 'Etiket başarıyla eklendi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.tags });
    },
    onError: () => toast.error('Etiket eklenirken bir hata oluştu.'),
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTagDto) => adminRecipeTaxonomyApi.updateTag(data),
    onSuccess: (message) => {
      toast.success(message || 'Etiket başarıyla güncellendi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.tags });
    },
    onError: () => toast.error('Etiket güncellenirken bir hata oluştu.'),
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminRecipeTaxonomyApi.deleteTag(id),
    onSuccess: (message) => {
      toast.success(message || 'Etiket başarıyla silindi.');
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPE_TAXONOMY_KEYS.tags });
    },
    onError: () => toast.error('Etiket silinirken bir hata oluştu.'),
  });
};
