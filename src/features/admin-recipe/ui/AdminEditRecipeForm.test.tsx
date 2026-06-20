 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminEditRecipeForm } from './AdminEditRecipeForm';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock the API and toast
vi.mock('@/entities/recipe/api/recipeApi', () => ({
  recipeApi: {
    updateRecipe: vi.fn(),
    approveRecipe: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock RecipeEditorForm so we don't have to deal with its complex internal state
vi.mock('@/widgets/recipe-editor/ui/RecipeEditorForm', () => ({
  RecipeEditorForm: ({ onSubmit, onCancel, headerTitle, extraActions }: unknown) => (
    <div data-testid="recipe-editor-form">
      <h1>{headerTitle}</h1>
      <button onClick={() => onSubmit(new FormData())}>Submit Form</button>
      <button onClick={onCancel}>Cancel Form</button>
      <div>{extraActions}</div>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as unknown,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AdminEditRecipeForm', () => {
  const mockInitialData: unknown = {
    id: '1',
    title: 'Test Recipe',
    description: 'Desc',
    difficulty: 1,
    preparationTimeInMinutes: 10,
    servings: 2,
    ingredients: [],
    steps: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders RecipeEditorForm with correct header', () => {
    renderWithProviders(<AdminEditRecipeForm initialData={mockInitialData} />);
    expect(screen.getByTestId('recipe-editor-form')).toBeInTheDocument();
    expect(screen.getByText('Tarifi Düzenle')).toBeInTheDocument();
  });

  it('calls updateRecipe and navigates on successful update (not review mode)', async () => {
    (recipeApi.updateRecipe as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<AdminEditRecipeForm initialData={mockInitialData} />);
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(recipeApi.updateRecipe).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Tarif başarıyla güncellendi!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/recipes/1');
    });
  });

  it('calls updateRecipe then approveRecipe in review mode', async () => {
    (recipeApi.updateRecipe as unknown).mockResolvedValueOnce({});
    (recipeApi.approveRecipe as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<AdminEditRecipeForm initialData={mockInitialData} isReviewMode={true} />);
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(recipeApi.updateRecipe).toHaveBeenCalled();
      expect(recipeApi.approveRecipe).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Tarif başarıyla onaylandı!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/recipes');
    });
  });

  it('shows direct approve button in review mode and calls approveRecipe', async () => {
    (recipeApi.approveRecipe as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<AdminEditRecipeForm initialData={mockInitialData} isReviewMode={true} />);
    
    const directApproveBtn = screen.getByText(/Direkt Onayla/i);
    expect(directApproveBtn).toBeInTheDocument();
    
    fireEvent.click(directApproveBtn);

    await waitFor(() => {
      expect(recipeApi.approveRecipe).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Tarif başarıyla onaylandı!');
    });
  });

  it('handles cancel properly', () => {
    const mockCancel = vi.fn();
    renderWithProviders(<AdminEditRecipeForm initialData={mockInitialData} onCancel={mockCancel} />);
    fireEvent.click(screen.getByText('Cancel Form'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
