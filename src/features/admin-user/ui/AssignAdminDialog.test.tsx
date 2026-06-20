 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignAdminDialog } from './AssignAdminDialog';
import { useAssignAdminRole } from '@/entities/admin-user';
import { toast } from 'sonner';

// Mock the hook and toast
vi.mock('@/entities/admin-user', () => ({
  useAssignAdminRole: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AssignAdminDialog', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAssignAdminRole as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders trigger button correctly', () => {
    render(<AssignAdminDialog userId="1" userName="Test User" />);
    // The button has an icon, so we can query by role button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens dialog on click', async () => {
    render(<AssignAdminDialog userId="1" userName="Test User" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Yetkisi Ver')).toBeInTheDocument();
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });

  it('calls mutateAsync and shows success toast on assignment', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AssignAdminDialog userId="1" userName="Test User" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button'));
    
    // Click assign button inside dialog
    const assignBtn = await screen.findByRole('button', { name: /Yetki Ver/i });
    fireEvent.click(assignBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ userId: '1' });
      expect(toast.success).toHaveBeenCalledWith('Test User kullanıcısına Admin yetkisi başarıyla verildi.');
    });
  });

  it('shows error toast on failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Test error'));
    render(<AssignAdminDialog userId="1" userName="Test User" />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button'));
    
    // Click assign button inside dialog
    const assignBtn = await screen.findByRole('button', { name: /Yetki Ver/i });
    fireEvent.click(assignBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Admin yetkisi verilirken bir hata oluştu.');
    });
  });
});
