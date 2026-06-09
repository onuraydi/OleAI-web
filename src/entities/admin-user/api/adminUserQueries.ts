import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from './adminUserApi';
import type { AdminUserDTO, AssignRoleRequest, BanUserRequest, UnlockUserRequest, PaginatedAdminUsersResponse } from '../types';

export const ADMIN_USERS_KEY = ['admin-users'] as const;

export const useAdminUsers = (page: number = 1, size: number = 10) => {
  return useQuery<PaginatedAdminUsersResponse, Error>({
    queryKey: [...ADMIN_USERS_KEY, page, size],
    queryFn: () => adminUserApi.getUsers(page, size),
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

export const useAssignAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignRoleRequest) => adminUserApi.assignAdminRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UnlockUserRequest) => adminUserApi.unlockUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BanUserRequest) => adminUserApi.banUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
};
