 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AiModerationPanel } from './AiModerationPanel';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API and toast
vi.mock('@/entities/recipe/api/recipeApi', () => ({
  recipeApi: {
    analyzeWithAi: vi.fn(),
    approveRecipe: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: 0 } },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('AiModerationPanel', () => {
  const defaultProps = {
    recipeId: '1',
    originalDescription: 'Test Desc',
    originalSteps: [{ stepNumber: 1, instruction: 'Test Step' }],
    status: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when no llm result is present', () => {
    renderWithClient(<AiModerationPanel {...defaultProps} />);
    expect(screen.getByText('Yapay Zeka Analizi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analiz et/i })).toBeInTheDocument();
  });

  it('calls analyzeWithAi when analyze button is clicked', async () => {
    (recipeApi.analyzeWithAi as Mock).mockResolvedValueOnce({});
    
    renderWithClient(<AiModerationPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analiz et/i }));

    await waitFor(() => {
      expect(recipeApi.analyzeWithAi).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Yapay zeka analizi başarıyla tamamlandı.');
    });
  });

  it('renders toxic result correctly', () => {
    const llmJson = JSON.stringify({
      isApproved: false,
      isToxic: true,
      rejectionReason: 'Toxic content detected',
    });
    
    renderWithClient(<AiModerationPanel {...defaultProps} llmReviewResultJson={llmJson} />);
    expect(screen.getByText(/Zararlı İçerik: Toxic content detected/i)).toBeInTheDocument();
  });

  it('renders approved result correctly and calls onApplyToForm', async () => {
    const llmJson = JSON.stringify({
      isApproved: true,
      isToxic: false,
      correctedDescription: 'Corrected Desc',
      correctedSteps: ['Corrected Step 1'],
    });
    
    const mockOnApply = vi.fn();
    renderWithClient(<AiModerationPanel {...defaultProps} llmReviewResultJson={llmJson} onApplyToForm={mockOnApply} />);
    
    expect(screen.getByText(/Analiz Tamamlandı/i)).toBeInTheDocument();
    
    const applyBtn = screen.getByRole('button', { name: 'Önerileri İncele' });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalledWith('Corrected Desc', ['Corrected Step 1']);
    });
  });
});
