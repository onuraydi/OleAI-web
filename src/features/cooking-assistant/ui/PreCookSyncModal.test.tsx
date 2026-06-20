 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { PreCookSyncModal } from './PreCookSyncModal';
import { shoppingListApi } from '@/entities/shopping-list/api/shoppingListApi';
import { pantryApi } from '@/entities/pantry/api/pantryApi';
import type { IngredientResponse, RecipeIngredientResponse } from '@/entities/recipe/api/recipeApi';
import { toast } from 'sonner';

vi.mock('@/entities/shopping-list/api/shoppingListApi', () => ({
  shoppingListApi: {
    bulkAddItems: vi.fn(),
  },
}));

vi.mock('@/entities/pantry/api/pantryApi', () => ({
  pantryApi: {
    addMultipleIngredients: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PreCookSyncModal', () => {
  const mockOnClose = vi.fn();
  const mockOnContinue = vi.fn();

  const missingIngredients = [
    { id: '1', name: 'Salt' },
    { id: '2', name: 'Pepper' },
  ] as unknown as IngredientResponse[];

  const recipeIngredients = [
    { ingredientId: '1', amount: 2, unitId: 1 },
    { ingredientId: '2', amount: 5, unitId: 2 },
  ] as unknown as RecipeIngredientResponse[];

  beforeEach(() => {
    vi.clearAllMocks();
    (shoppingListApi.bulkAddItems as Mock).mockResolvedValue({});
    (pantryApi.addMultipleIngredients as Mock).mockResolvedValue({});
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <PreCookSyncModal
        isOpen={isOpen}
        onClose={mockOnClose}
        missingIngredients={missingIngredients}
        recipeIngredients={recipeIngredients}
        onContinue={mockOnContinue}
      />
    );
  };

  it('does not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Eksik Malzemeler')).not.toBeInTheDocument();
  });

  it('renders all missing ingredients', () => {
    renderComponent();
    expect(screen.getByText('Eksik Malzemeler')).toBeInTheDocument();
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Pepper')).toBeInTheDocument();
  });

  it('allows changing actions and syncs correctly', async () => {
    renderComponent();

    // Default is ignore.
    // Change Salt to shopping
    const saltShoppingBtn = screen.getAllByRole('button', { name: /Listeye Al/i })[0];
    fireEvent.click(saltShoppingBtn);

    // Change Pepper to pantry
    const pepperPantryBtn = screen.getAllByRole('button', { name: /Dolaba Ekle/i })[1];
    fireEvent.click(pepperPantryBtn);

    // Continue
    const continueBtn = screen.getByRole('button', { name: /Devam Et/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(shoppingListApi.bulkAddItems).toHaveBeenCalledWith({
        items: [{ ingredientId: '1', quantity: 2, unit: 1 }],
      });
      expect(pantryApi.addMultipleIngredients).toHaveBeenCalledWith({
        ingredients: [{ ingredientId: '2', quantity: 5, unit: 2 }],
      });
      expect(toast.success).toHaveBeenCalledTimes(2);
      // Salt is shopping (so ignored for deduction), Pepper is pantry (so not ignored)
      expect(mockOnContinue).toHaveBeenCalledWith(['1']);
    });
  });

  it('handles error gracefully and calls onContinue anyway', async () => {
    (shoppingListApi.bulkAddItems as Mock).mockRejectedValue(new Error('Network Error'));

    renderComponent();

    const saltShoppingBtn = screen.getAllByRole('button', { name: /Listeye Al/i })[0];
    fireEvent.click(saltShoppingBtn);

    const continueBtn = screen.getByRole('button', { name: /Devam Et/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('İşlem sırasında bir hata oluştu.');
      expect(mockOnContinue).toHaveBeenCalledWith([]);
    });
  });

  it('supports changing quantity', async () => {
    renderComponent();

    // Change Salt to shopping to see quantity input
    const saltShoppingBtn = screen.getAllByRole('button', { name: /Listeye Al/i })[0];
    fireEvent.click(saltShoppingBtn);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(1);
    
    fireEvent.change(inputs[0], { target: { value: '10' } });

    const continueBtn = screen.getByRole('button', { name: /Devam Et/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(shoppingListApi.bulkAddItems).toHaveBeenCalledWith({
        items: [{ ingredientId: '1', quantity: 10, unit: 1 }],
      });
      expect(mockOnContinue).toHaveBeenCalledWith(['1', '2']); // Pepper is ignored by default
    });
  });
});
