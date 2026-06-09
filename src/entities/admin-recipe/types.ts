export interface AdminRecipeDTO {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: string;
  visibility: string;
  createdDate: string;
}

export interface PaginatedAdminRecipesResponse {
  items: AdminRecipeDTO[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
