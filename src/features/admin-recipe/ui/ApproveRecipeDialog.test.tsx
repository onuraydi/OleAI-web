 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApproveRecipeDialog } from './ApproveRecipeDialog';
import { useApproveRecipe } from '@/entities/admin-recipe';
import { toast } from 'sonner';

// Mock the hook and toast
vi.mock('@/entities/admin-recipe', () => ({
  useApproveRecipe: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ApproveRecipeDialog', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApproveRecipe as unknown).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders trigger button correctly', () => {
    render(<ApproveRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    expect(screen.getByRole('button', { name: /onayla/i })).toBeInTheDocument();
  });

  it('opens dialog on click', async () => {
    render(<ApproveRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    fireEvent.click(screen.getByRole('button', { name: /onayla/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Tarifi Onayla')).toBeInTheDocument();
      expect(screen.getByText(/Test Recipe/i)).toBeInTheDocument();
    });
  });

  it('calls mutateAsync and shows success toast on approval', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<ApproveRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /onayla/i }));
    
    // Click approve button inside dialog
    const approveBtn = await screen.findByRole('button', { name: /evet, onayla/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Test Recipe başarıyla onaylandı.');
    });
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Test error'));
    render(<ApproveRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /onayla/i }));
    
    // Click approve button inside dialog
    const approveBtn = await screen.findByRole('button', { name: /evet, onayla/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('1');
      expect(toast.error).toHaveBeenCalledWith('Tarif onaylanırken bir hata oluştu.');
    });
  });
});
