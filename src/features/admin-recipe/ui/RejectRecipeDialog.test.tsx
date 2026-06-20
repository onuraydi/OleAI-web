 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RejectRecipeDialog } from './RejectRecipeDialog';
import { useRejectRecipe } from '@/entities/admin-recipe';
import { toast } from 'sonner';

// Mock the hook and toast
vi.mock('@/entities/admin-recipe', () => ({
  useRejectRecipe: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RejectRecipeDialog', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRejectRecipe as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders trigger button correctly', () => {
    render(<RejectRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    expect(screen.getByRole('button', { name: /reddet/i })).toBeInTheDocument();
  });

  it('opens dialog on click', async () => {
    render(<RejectRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    fireEvent.click(screen.getByRole('button', { name: /reddet/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Tarifi Reddet')).toBeInTheDocument();
      expect(screen.getByText(/Test Recipe/i)).toBeInTheDocument();
    });
  });

  it('disables reject button when reason is empty', async () => {
    render(<RejectRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    fireEvent.click(screen.getByRole('button', { name: /reddet/i }));
    
    const rejectBtn = await screen.findByRole('button', { name: 'Reddet' });
    expect(rejectBtn).toBeDisabled();
  });

  it('calls mutateAsync with reason and shows success toast on rejection', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<RejectRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /reddet/i }));
    
    // Enter reason
    const textarea = await screen.findByPlaceholderText(/Ret sebebi/i);
    fireEvent.change(textarea, { target: { value: 'Görsel uygunsuz' } });
    
    // Click reject button
    const rejectBtn = await screen.findByRole('button', { name: 'Reddet' });
    expect(rejectBtn).toBeEnabled();
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: '1', reason: 'Görsel uygunsuz' });
      expect(toast.success).toHaveBeenCalledWith('Test Recipe reddedildi.');
    });
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Test error'));
    render(<RejectRecipeDialog recipeId="1" recipeTitle="Test Recipe" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /reddet/i }));
    
    // Enter reason
    const textarea = await screen.findByPlaceholderText(/Ret sebebi/i);
    fireEvent.change(textarea, { target: { value: 'Görsel uygunsuz' } });
    
    // Click reject button
    const rejectBtn = await screen.findByRole('button', { name: 'Reddet' });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Tarif reddedilirken bir hata oluştu.');
    });
  });
});
