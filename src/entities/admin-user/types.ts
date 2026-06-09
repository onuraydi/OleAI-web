export interface AdminUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  lockoutEnd: string | null;
  roles: string[];
}

export interface PaginatedAdminUsersResponse {
  items: AdminUserDTO[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AssignRoleRequest {
  userId: string;
}

export interface UnlockUserRequest {
  userId: string;
}

export interface BanUserRequest {
  userId: string;
}

export interface AuthActionResponse {
  message: string;
}
