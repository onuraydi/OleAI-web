export interface ExcludedIngredient {
  id: string;
  name: string;
}

export interface ExcludedCategory {
  id: string;
  name: string;
  iconName?: string;
}

export interface DietDTO {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  isActive: boolean;
  excludedIngredientCount: number;
  excludedCategoryCount: number;
  deletedDate?: string | null;
}

export interface DietDetailDTO {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  isActive: boolean;
  excludedIngredients: ExcludedIngredient[];
  excludedCategories: ExcludedCategory[];
}

export interface CreateDietDTO {
  name: string;
  description?: string;
  iconName: string;
  excludedIngredientIds: string[];
  excludedCategoryIds: string[];
}

export interface UpdateDietDTO {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  isActive: boolean;
  excludedIngredientIds: string[];
  excludedCategoryIds: string[];
}
