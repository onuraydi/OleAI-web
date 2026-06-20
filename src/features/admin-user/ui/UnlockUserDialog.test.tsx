 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnlockUserDialog } from './UnlockUserDialog';
import { useUnlockUser } from '@/entities/admin-user';
import { toast } from 'sonner';

// Mock the hook and toast
vi.mock('@/entities/admin-user', () => ({
  useUnlockUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UnlockUserDialog', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUnlockUser as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders trigger button correctly', () => {
    render(<UnlockUserDialog userId="1" userName="Test User" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens dialog on click', async () => {
    render(<UnlockUserDialog userId="1" userName="Test User" />);
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Kullanıcı Kilidini Aç')).toBeInTheDocument();
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });

  it('calls mutateAsync and shows success toast on unlock', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<UnlockUserDialog userId="1" userName="Test User" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    const unlockBtn = await screen.findByRole('button', { name: /Kilidi Aç/i });
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ userId: '1' });
      expect(toast.success).toHaveBeenCalledWith('Test User kullanıcısının kilidi başarıyla açıldı.');
    });
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Test error'));
    render(<UnlockUserDialog userId="1" userName="Test User" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    const unlockBtn = await screen.findByRole('button', { name: /Kilidi Aç/i });
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Kullanıcı kilidi açılırken bir hata oluştu.');
    });
  });
});
