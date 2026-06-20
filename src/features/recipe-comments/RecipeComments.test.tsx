/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipeComments } from './RecipeComments';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { useSessionStore } from '@/entities/session/model/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock API
vi.mock('@/entities/recipe/api/recipeApi', () => ({
  recipeApi: {
    getRecipeComments: vi.fn(),
    addComment: vi.fn(),
    deleteComment: vi.fn(),
    updateComment: vi.fn(),
  },
}));

// Mock Store
vi.mock('@/entities/session/model/store', () => ({
  useSessionStore: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('RecipeComments', () => {
  const mockUser = {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSessionStore as unknown).mockReturnValue({ user: mockUser });
    
    // Default API mock
    (recipeApi.getRecipeComments as unknown).mockResolvedValue({
      items: [
        {
          id: 'comment-1',
          content: 'Great recipe!',
          rating: 5,
          userId: 'user-1',
          userFullName: 'Test User',
          createdAt: new Date().toISOString(),
          replies: [],
        }
      ],
      totalCount: 1,
      pageNumber: 0,
      pageSize: 10,
      hasNextPage: false,
    });
  });

  it('renders correctly and shows total comments count', () => {
    renderWithProviders(<RecipeComments recipeId="1" totalComments={5} />);
    expect(screen.getByText(/Yorumlar/i)).toBeInTheDocument();
    expect(screen.getByText(/5 yorum yapıldı/i)).toBeInTheDocument();
  });

  it('opens accordion and fetches comments', async () => {
    renderWithProviders(<RecipeComments recipeId="1" totalComments={1} />);
    
    // Open accordion
    const toggleBtn = screen.getByRole('button', { name: /Yorumlar/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(recipeApi.getRecipeComments).toHaveBeenCalledWith('1', 0, 10);
      expect(screen.getByText('Great recipe!')).toBeInTheDocument();
    });
  });

  it('allows adding a new comment', async () => {
    (recipeApi.addComment as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<RecipeComments recipeId="1" totalComments={0} />);
    
    // Open accordion
    fireEvent.click(screen.getByRole('button', { name: /Yorumlar/i }));
    
    // Type in comment textarea
    const textarea = await screen.findByPlaceholderText(/Düşüncelerini paylaş/i);
    fireEvent.change(textarea, { target: { value: 'New comment text' } });
    
    // Select rating (5 stars)
    const starButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('hover:scale-110 transition-transform'));
    fireEvent.click(starButtons[4]);
    
    // Submit
    const form = textarea.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(recipeApi.addComment).toHaveBeenCalledWith('1', 'New comment text', undefined, 5);
    });
  });

  it('allows editing an own comment', async () => {
    (recipeApi.updateComment as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<RecipeComments recipeId="1" totalComments={1} />);
    fireEvent.click(screen.getByRole('button', { name: /Yorumlar/i }));
    
    // Wait for comment to load
    await screen.findByText('Great recipe!');
    
    // Click edit
    const editBtns = screen.getAllByTitle('Düzenle');
    fireEvent.click(editBtns[0]);
    
    // Find edit textarea and submit button
    const editInput = await screen.findByDisplayValue('Great recipe!');
    fireEvent.change(editInput, { target: { value: 'Edited text' } });
    
    // Since there are two forms (new comment and edit comment), find by title or closest
    const submitEditBtn = screen.getAllByText('Kaydet')[0];
    fireEvent.click(submitEditBtn);

    await waitFor(() => {
      expect(recipeApi.updateComment).toHaveBeenCalledWith('comment-1', 'Edited text');
    });
  });

  it('allows deleting an own comment', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    (recipeApi.deleteComment as unknown).mockResolvedValueOnce({});
    
    renderWithProviders(<RecipeComments recipeId="1" totalComments={1} />);
    fireEvent.click(screen.getByRole('button', { name: /Yorumlar/i }));
    
    // Wait for comment to load
    await screen.findByText('Great recipe!');
    
    // Click delete
    const deleteBtns = screen.getAllByTitle('Sil');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(recipeApi.deleteComment).toHaveBeenCalledWith('comment-1');
    });
  });
});
