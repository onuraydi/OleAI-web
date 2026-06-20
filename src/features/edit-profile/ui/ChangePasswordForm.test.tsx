import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';
import { sessionApi } from '@/entities/session';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/entities/session', () => ({
  sessionApi: {
    changePassword: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockImplementation(({ mutationFn, onSuccess, onError }: any) => ({
      mutate: (variables: any) => {
        mutationFn(variables).then(onSuccess).catch(onError);
      },
      isPending: false,
    }));
  });

  const renderComponent = () => render(<ChangePasswordForm />);

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Mevcut şifreni gir')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Yeni şifreni gir')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Yeni şifreni tekrar gir')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /şifreyi güncelle/i })).toBeDisabled();
  });

  it('validates password mismatch', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Mevcut şifreni gir'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni gir'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni tekrar gir'), { target: { value: 'newpass2' } });

    const submitBtn = screen.getByRole('button', { name: /şifreyi güncelle/i });
    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith('Yeni şifreler eşleşmiyor.');
  });

  it('validates minimum length', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Mevcut şifreni gir'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni gir'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni tekrar gir'), { target: { value: '123' } });

    const submitBtn = screen.getByRole('button', { name: /şifreyi güncelle/i });
    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith('Yeni şifre en az 6 karakter olmalıdır.');
  });

  it('handles successful password change', async () => {
    (sessionApi.changePassword as any).mockResolvedValue({});

    renderComponent();

    const oldInput = screen.getByPlaceholderText('Mevcut şifreni gir');
    const newInput = screen.getByPlaceholderText('Yeni şifreni gir');
    const confirmInput = screen.getByPlaceholderText('Yeni şifreni tekrar gir');

    fireEvent.change(oldInput, { target: { value: 'oldpass' } });
    fireEvent.change(newInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpass123' } });

    const submitBtn = screen.getByRole('button', { name: /şifreyi güncelle/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(sessionApi.changePassword).toHaveBeenCalledWith({
        oldPassword: 'oldpass',
        newPassword: 'newpass123',
      });
      expect(toast.success).toHaveBeenCalledWith('Şifren başarıyla güncellendi.');
    });

    // Inputs should be cleared
    expect(oldInput).toHaveValue('');
    expect(newInput).toHaveValue('');
    expect(confirmInput).toHaveValue('');
  });

  it('handles API error on password change', async () => {
    const axiosError = new AxiosError('Error');
    axiosError.response = {
      data: { message: 'Mevcut şifre yanlış' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };
    (sessionApi.changePassword as any).mockRejectedValue(axiosError);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Mevcut şifreni gir'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni gir'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Yeni şifreni tekrar gir'), { target: { value: 'newpass123' } });

    const submitBtn = screen.getByRole('button', { name: /şifreyi güncelle/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Mevcut şifre yanlış');
    });
  });
});
