export interface AllergyRestriction {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  excludedIngredientCount: number;
  excludedCategoryCount: number;
  deletedDate?: string | null;
  iconName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excludedIngredients?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
