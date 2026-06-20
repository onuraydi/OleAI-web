 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CookingAssistantModal } from './CookingAssistantModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@/entities/recipe/api/recipeApi', () => ({
  recipeApi: {
    startCooking: vi.fn(),
  },
}));

describe('CookingAssistantModal', () => {
  const mockOnClose = vi.fn();
  const mockOnFinishCooking = vi.fn();
  const mockInvalidateQueries = vi.fn();

  const mockRecipe: any = {
    id: 'recipe-1',
    title: 'Test Recipe',
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Step 1 instruction' },
      { id: 's2', stepNumber: 2, instruction: 'Step 2 instruction' },
    ],
    images: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as any).mockImplementation(({ mutationFn, onSuccess }: any) => ({
      mutate: () => {
        mutationFn().then(onSuccess);
      },
      isPending: false,
    }));
    (recipeApi.startCooking as any).mockResolvedValue([{ id: 'ing-1', name: 'Salt' }]);
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <CookingAssistantModal
        isOpen={isOpen}
        onClose={mockOnClose}
        recipe={mockRecipe}
        ignoredIngredientIds={[]}
        onFinishCooking={mockOnFinishCooking}
      />
    );
  };

  it('does not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Pişirme Asistanı')).not.toBeInTheDocument();
  });

  it('renders recipe title and first step', () => {
    renderComponent();
    expect(screen.getByText('Pişirme Asistanı')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Adım 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Step 1 instruction')).toBeInTheDocument();
  });

  it('navigates to next and previous steps', async () => {
    renderComponent();
    
    // Go to next step
    const nextButton = screen.getByText(/İleri/i);
    fireEvent.click(nextButton);
    await waitFor(() => expect(screen.getByText('Adım 2 / 2')).toBeInTheDocument());
    expect(screen.getByText('Step 2 instruction')).toBeInTheDocument();
    
    // Go to prev step
    const prevButton = screen.getByText(/Geri/i);
    fireEvent.click(prevButton);
    await waitFor(() => expect(screen.getByText('Adım 1 / 2')).toBeInTheDocument());
    expect(screen.getByText('Step 1 instruction')).toBeInTheDocument();
  });

  it('finishes cooking and calls required functions', async () => {
    renderComponent();
    
    // Go to next step
    const nextButton = screen.getByText(/İleri/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => expect(screen.getByText('Adım 2 / 2')).toBeInTheDocument());

    // Finish cooking
    const finishButton = screen.getByText(/Pişirmeyi Tamamla/i);
    fireEvent.click(finishButton);
    
    expect(recipeApi.startCooking).toHaveBeenCalledWith('recipe-1', []);
    
    await waitFor(() => {
      expect(screen.getByText('Afiyet Olsun!')).toBeInTheDocument();
    });

    // Wait for the simulated backend call and invalidation
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['pantry'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['recipe-detail', 'recipe-1'] });
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnFinishCooking).toHaveBeenCalledWith([{ id: 'ing-1', name: 'Salt' }]);
    }, { timeout: 2500 });
  });
});
