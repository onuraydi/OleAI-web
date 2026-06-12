export enum MeasurementCategory {
  Weight = "Weight",
  Volume = "Volume",
  Count = "Count",
  Other = "Other"
}

export enum ResolutionAction {
  ApproveAsNew = 1,
  MergeAsAlias = 2,
  Reject = 3
}

export enum ExpirationMode {
  Auto = 1,
  ShelfLife = 2,
  ExactDate = 3
}

export interface IngredientCategory {
  id: string;
  name: string;
  iconName: string;
}

export interface Ingredient {
  id: string;
  name: string;
  categoryName: string;
  categoryIconName: string;
  unitFamily: MeasurementCategory;
  isPolarizing: boolean;
  estimatedShelfLifeInDays?: number | null;
  defaultExpirationMode: ExpirationMode;
  deletedDate: string | null;
}

export interface IngredientAlias {
  id: string;
  ingredientId: string;
  aliasName: string;
  deletedDate?: string | null;
}

export interface PendingRequest {
  id: string;
  userId: string;
  requestedName: string;
  estimatedShelfLifeInDays?: number | null;
  llmAnalysisResult: string | null;
  createdDate: string;
}

export interface ResolvedRequest {
  id: string;
  userId: string;
  requestedName: string;
  status: string;
  adminNote: string | null;
  llmAnalysisResult: string | null;
  createdDate: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateIngredientRequest {
  name: string;
  categoryId: string;
  unitFamily: MeasurementCategory;
  isPolarizing: boolean;
  estimatedShelfLifeInDays?: number | null;
  defaultExpirationMode: ExpirationMode;
}

export interface UpdateIngredientRequest {
  name: string;
  categoryId: string;
  unitFamily: MeasurementCategory;
  isPolarizing: boolean;
  estimatedShelfLifeInDays?: number | null;
  defaultExpirationMode: ExpirationMode;
}

export interface ResolveIngredientRequestDto {
  requestId: string;
  action: ResolutionAction;
  newCategoryId?: string | null;
  newUnitFamily?: MeasurementCategory | null;
  estimatedShelfLifeInDays?: number | null;
  masterIngredientId?: string | null;
  adminNote?: string | null;
}
