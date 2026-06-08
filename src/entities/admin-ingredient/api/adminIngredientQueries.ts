import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminIngredientApi } from "./adminIngredientApi";
import type { CreateIngredientRequest, ResolveIngredientRequestDto } from "../model/types";

// --- QUERY KEYS ---
export const adminIngredientKeys = {
  all: ['admin-ingredients'] as const,
  lists: () => [...adminIngredientKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...adminIngredientKeys.lists(), { page, size }] as const,
  aliases: () => [...adminIngredientKeys.all, 'aliases'] as const,
  ingredientAliases: (id: string) => [...adminIngredientKeys.aliases(), id] as const,
  categories: ['ingredient-categories'] as const,
  pendingRequests: ['admin-pantry-requests', 'pending'] as const,
  resolvedRequests: (page: number, size: number) => ['admin-pantry-requests', 'resolved', { page, size }] as const,
};

// --- QUERIES ---
export const useAdminIngredients = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: adminIngredientKeys.list(page, size),
    queryFn: () => adminIngredientApi.getIngredients(page, size),
    placeholderData: keepPreviousData,
  });
};

export const useAllAliases = () => {
  return useQuery({
    queryKey: adminIngredientKeys.aliases(),
    queryFn: () => adminIngredientApi.getAllAliases(),
  });
};

export const useIngredientAliases = (ingredientId: string) => {
  return useQuery({
    queryKey: adminIngredientKeys.ingredientAliases(ingredientId),
    queryFn: () => adminIngredientApi.getAliasesByIngredient(ingredientId),
    enabled: !!ingredientId,
  });
};

export const useIngredientCategories = () => {
  return useQuery({
    queryKey: adminIngredientKeys.categories,
    queryFn: () => adminIngredientApi.getCategories(),
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: adminIngredientKeys.pendingRequests,
    queryFn: () => adminIngredientApi.getPendingRequests(),
  });
};

export const useResolvedRequests = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: adminIngredientKeys.resolvedRequests(page, size),
    queryFn: () => adminIngredientApi.getResolvedRequests(page, size),
  });
};

// --- MUTATIONS ---
export const useCreateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIngredientRequest) => adminIngredientApi.createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.lists() });
    },
  });
};

export const useUpdateIngredientMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIngredientRequest) => adminIngredientApi.updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.lists() });
    },
  });
};

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminIngredientApi.deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.lists() });
    },
  });
};

export const useAddAliasMutation = (ingredientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aliasName: string) => adminIngredientApi.addAlias(ingredientId, aliasName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.ingredientAliases(ingredientId) });
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.aliases() });
    },
  });
};

export const useDeleteAliasMutation = (ingredientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aliasId: string) => adminIngredientApi.deleteAlias(aliasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.ingredientAliases(ingredientId) });
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.aliases() });
    },
  });
};

export const useRestoreAliasMutation = (ingredientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aliasId: string) => adminIngredientApi.restoreAlias(aliasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.ingredientAliases(ingredientId) });
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.aliases() });
    },
  });
};

export const useResolveRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResolveIngredientRequestDto) => adminIngredientApi.resolveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: adminIngredientKeys.lists() }); // If accepted as new ingredient
    },
  });
};
