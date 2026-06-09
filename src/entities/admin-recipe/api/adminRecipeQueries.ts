import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRecipeApi } from './adminRecipeApi';
import type { GetAdminRecipesParams } from './adminRecipeApi';

export const ADMIN_RECIPES_KEYS = {
  all: ['admin-recipes'] as const,
  list: (params: GetAdminRecipesParams) => [...ADMIN_RECIPES_KEYS.all, 'list', params] as const,
};

export const useAdminRecipes = (params: GetAdminRecipesParams) => {
  return useQuery({
    queryKey: ADMIN_RECIPES_KEYS.list(params),
    queryFn: () => adminRecipeApi.getAllRecipes(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });
};

export const useApproveRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRecipeApi.approveRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['recipe-detail', id] });
    },
  });
};

export const useRejectRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminRecipeApi.rejectRecipe(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['recipe-detail', id] });
    },
  });
};

export const ADMIN_DELETED_RECIPES_KEYS = {
  all: ['admin-deleted-recipes'] as const,
  list: (params: { page: number; size: number; searchTerm?: string }) => [...ADMIN_DELETED_RECIPES_KEYS.all, 'list', params] as const,
};

export const useDeletedRecipes = (params: { page: number; size: number; searchTerm?: string }) => {
  return useQuery({
    queryKey: ADMIN_DELETED_RECIPES_KEYS.list(params),
    queryFn: () => adminRecipeApi.getDeletedRecipes(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useRestoreRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRecipeApi.restoreRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DELETED_RECIPES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMIN_RECIPES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['recipe-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useHardDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRecipeApi.hardDeleteRecipe(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DELETED_RECIPES_KEYS.all });
    },
  });
};
