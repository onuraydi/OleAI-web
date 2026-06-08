import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDietApi } from './adminDietApi';
import type { CreateDietDTO, UpdateDietDTO } from '../model/types';

export const ADMIN_DIETS_QUERY_KEY = ['admin-diets'];

export const useAdminDiets = () => {
  return useQuery({
    queryKey: ADMIN_DIETS_QUERY_KEY,
    queryFn: adminDietApi.getAll,
  });
};

export const useAdminDietById = (id: string) => {
  return useQuery({
    queryKey: [...ADMIN_DIETS_QUERY_KEY, id],
    queryFn: () => adminDietApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDiet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDietDTO) => adminDietApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DIETS_QUERY_KEY });
    },
  });
};

export const useUpdateDiet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDietDTO) => adminDietApi.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DIETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_DIETS_QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteDiet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDietApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DIETS_QUERY_KEY });
    },
  });
};

export const useRestoreDiet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDietApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DIETS_QUERY_KEY });
    },
  });
};
