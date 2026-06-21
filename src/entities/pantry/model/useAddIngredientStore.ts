import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeasurementUnit } from '@/shared/constants/measurement';
import type { IngredientSearchResultResponse } from '@/entities/pantry/api/pantryApi';

export interface StagedItem {
  id: string; // temp id
  ingredient: IngredientSearchResultResponse | null;
  aliasId?: string;
  customName?: string;
  categoryId?: string;
  categoryName?: string;
  quantity: number;
  unit: MeasurementUnit;
  expirationDate?: string;
  estimatedShelfLifeInDays?: number;
}

interface AddIngredientStore {
  pantryDrafts: StagedItem[];
  shoppingListDrafts: StagedItem[];
  setPantryDrafts: (items: StagedItem[]) => void;
  setShoppingListDrafts: (items: StagedItem[]) => void;
  clearPantryDrafts: () => void;
  clearShoppingListDrafts: () => void;
}

export const useAddIngredientStore = create<AddIngredientStore>()(
  persist(
    (set) => ({
      pantryDrafts: [],
      shoppingListDrafts: [],
      setPantryDrafts: (items) => set({ pantryDrafts: items }),
      setShoppingListDrafts: (items) => set({ shoppingListDrafts: items }),
      clearPantryDrafts: () => set({ pantryDrafts: [] }),
      clearShoppingListDrafts: () => set({ shoppingListDrafts: [] }),
    }),
    {
      name: 'add-ingredient-drafts',
    }
  )
);
