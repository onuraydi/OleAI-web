export interface RecipeCategory {
  id: number;
  name: string;
  iconName: string;
}

export interface CreateRecipeCategoryDto {
  name: string;
  iconName: string;
}

export interface UpdateRecipeCategoryDto {
  id: number;
  name: string;
  iconName: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  id: number;
  name: string;
}
