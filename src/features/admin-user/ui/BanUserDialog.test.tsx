 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BanUserDialog } from './BanUserDialog';
import { useBanUser } from '@/entities/admin-user';
import { toast } from 'sonner';

// Mock the hook and toast
vi.mock('@/entities/admin-user', () => ({
  useBanUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BanUserDialog', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useBanUser as unknown).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders trigger button correctly', () => {
    render(<BanUserDialog userId="1" userName="Test User" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens dialog on click', async () => {
    render(<BanUserDialog userId="1" userName="Test User" />);
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Kullanıcıyı Banla')).toBeInTheDocument();
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });

  it('calls mutateAsync and shows success toast on ban', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<BanUserDialog userId="1" userName="Test User" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    const banBtn = await screen.findByRole('button', { name: /Banla/i });
    fireEvent.click(banBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ userId: '1' });
      expect(toast.success).toHaveBeenCalledWith('Test User kullanıcısı başarıyla banlandı.');
    });
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Test error'));
    render(<BanUserDialog userId="1" userName="Test User" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    const banBtn = await screen.findByRole('button', { name: /Banla/i });
    fireEvent.click(banBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Kullanıcı banlanırken bir hata oluştu.');
    });
  });
});
