/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';
import { sessionApi } from '@/entities/session';
import { AxiosError } from 'axios';

vi.mock('@/entities/session', () => ({
  sessionApi: {
    register: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  };

  it('renders all form fields correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/ad/i, { selector: 'input#firstName' })).toBeInTheDocument();
    expect(screen.getByLabelText(/soyad/i, { selector: 'input#lastName' })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta adresi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifreyi onayla/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kaydol/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /kaydol/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/ad en az 2 karakter olmalıdır/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/soyad en az 2 karakter olmalıdır/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/geçerli bir e-posta adresi giriniz/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/şifre en az 8 karakter olmalıdır/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/şartları kabul etmelisiniz/i)[0]).toBeInTheDocument();
    });
  });

  it('validates password mismatch', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/^şifre$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/şifreyi onayla/i), { target: { value: 'password124' } });
    fireEvent.click(screen.getByRole('button', { name: /kaydol/i }));

    await waitFor(() => {
      expect(screen.getByText(/şifreler eşleşmiyor/i)).toBeInTheDocument();
    });
  });

  it('handles successful registration and redirects', async () => {
    (sessionApi.register as any).mockResolvedValue({});

    renderComponent();

    fireEvent.change(screen.getByLabelText(/ad/i, { selector: 'input#firstName' }), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/soyad/i, { selector: 'input#lastName' }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^şifre$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/şifreyi onayla/i), { target: { value: 'password123' } });
    
    // Check the terms checkbox
    const termsCheckbox = screen.getByRole('checkbox', { name: /kullanım şartları/i });
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /kaydol/i }));

    await waitFor(() => {
      expect(sessionApi.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        acceptTerms: true,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email?email=john%40example.com');
    });
  });

  it('handles API error on registration', async () => {
    const axiosError = new AxiosError('Error');
    axiosError.response = {
      data: { message: 'Email already exists' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };
    (sessionApi.register as any).mockRejectedValue(axiosError);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/ad/i, { selector: 'input#firstName' }), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/soyad/i, { selector: 'input#lastName' }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^şifre$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/şifreyi onayla/i), { target: { value: 'password123' } });
    
    const termsCheckbox = screen.getByRole('checkbox', { name: /kullanım şartları/i });
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /kaydol/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
});
