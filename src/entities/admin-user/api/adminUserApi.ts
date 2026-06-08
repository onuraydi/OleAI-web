import { apiInstance as api } from '@/shared/api/base';
import type { AdminUserDTO, AssignRoleRequest, UnlockUserRequest, BanUserRequest, AuthActionResponse, PaginatedAdminUsersResponse } from '../types';

export const adminUserApi = {
  getUsers: async (page = 1, size = 10): Promise<PaginatedAdminUsersResponse> => {
    const { data } = await api.get<PaginatedAdminUsersResponse>(`/users/all?page=${page}&size=${size}`);
    return data;
  },

  assignAdminRole: async (payload: AssignRoleRequest): Promise<AuthActionResponse> => {
    const { data } = await api.post<AuthActionResponse>('/Auth/assign-role', payload);
    return data;
  },

  unlockUser: async (payload: UnlockUserRequest): Promise<AuthActionResponse> => {
    const { data } = await api.post<AuthActionResponse>('/Auth/unlock-user', payload);
    return data;
  },

  banUser: async (payload: BanUserRequest): Promise<AuthActionResponse> => {
    const { data } = await api.post<AuthActionResponse>('/Auth/ban-user', payload);
    return data;
  }
};
