export interface Category {
  id: string;
  name: string;
  iconName: string;
  deletedDate?: string | null;
}

export interface CreateCategoryDTO {
  name: string;
  iconName: string;
}

export interface UpdateCategoryDTO {
  id: string;
  name: string;
  iconName: string;
}

export interface CategoryApiResponse {
  id: string;
  message?: string;
}
