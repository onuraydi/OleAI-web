import { describe, it, expect, beforeEach } from 'vitest';
import { useAddIngredientStore } from './useAddIngredientStore';
import { MeasurementUnit } from '@/shared/constants/measurement';

describe('useAddIngredientStore', () => {
  beforeEach(() => {
    useAddIngredientStore.setState({ pantryDrafts: [], shoppingListDrafts: [] });
  });

  it('initializes with empty drafts', () => {
    const state = useAddIngredientStore.getState();
    expect(state.pantryDrafts).toEqual([]);
    expect(state.shoppingListDrafts).toEqual([]);
  });

  it('setPantryDrafts updates the pantry drafts', () => {
    const mockDraft = { id: '1', ingredient: null, quantity: 1, unit: MeasurementUnit.Piece };
    useAddIngredientStore.getState().setPantryDrafts([mockDraft]);
    expect(useAddIngredientStore.getState().pantryDrafts).toHaveLength(1);
    expect(useAddIngredientStore.getState().pantryDrafts[0]).toEqual(mockDraft);
  });

  it('setShoppingListDrafts updates the shopping list drafts', () => {
    const mockDraft = { id: '2', ingredient: null, quantity: 2, unit: MeasurementUnit.Gram };
    useAddIngredientStore.getState().setShoppingListDrafts([mockDraft]);
    expect(useAddIngredientStore.getState().shoppingListDrafts).toHaveLength(1);
    expect(useAddIngredientStore.getState().shoppingListDrafts[0]).toEqual(mockDraft);
  });

  it('clearPantryDrafts resets the pantry drafts to empty', () => {
    useAddIngredientStore.getState().setPantryDrafts([{ id: '1', ingredient: null, quantity: 1, unit: MeasurementUnit.Piece }]);
    useAddIngredientStore.getState().clearPantryDrafts();
    expect(useAddIngredientStore.getState().pantryDrafts).toEqual([]);
  });

  it('clearShoppingListDrafts resets the shopping list drafts to empty', () => {
    useAddIngredientStore.getState().setShoppingListDrafts([{ id: '1', ingredient: null, quantity: 1, unit: MeasurementUnit.Piece }]);
    useAddIngredientStore.getState().clearShoppingListDrafts();
    expect(useAddIngredientStore.getState().shoppingListDrafts).toEqual([]);
  });
});
