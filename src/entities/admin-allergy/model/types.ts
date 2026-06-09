export interface AllergyRestriction {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  excludedIngredientCount: number;
  excludedCategoryCount: number;
  deletedDate?: string | null;
  iconName?: string;
  excludedIngredients?: any[];
  excludedCategories?: any[];
}

export interface CreateAllergyDTO {
  name: string;
  description?: string | null;
  iconName: string;
  excludedIngredientIds: string[];
  excludedCategoryIds: string[];
}

export interface UpdateAllergyDTO {
  id: string;
  name: string;
  description?: string | null;
  iconName: string;
  isActive: boolean;
  excludedIngredientIds: string[];
  excludedCategoryIds: string[];
}

export interface AllergyApiResponse {
  id: string;
  message?: string;
}
