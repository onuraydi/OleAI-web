import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { sessionApi, useSessionStore } from '@/entities/session';
import { userApi } from '@/entities/user/api/userApi';
import * as jwtHelpers from '@/shared/lib/jwt';
import { AxiosError } from 'axios';

// Mock dependencies
vi.mock('@/entities/session', () => ({
  sessionApi: {
    login: vi.fn(),
    resendOtp: vi.fn(),
  },
  useSessionStore: vi.fn(),
}));

vi.mock('@/entities/user/api/userApi', () => ({
  userApi: {
    getProfile: vi.fn(),
  },
}));

vi.mock('@/shared/lib/jwt', () => ({
  decodeRoleFromToken: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSessionStore as unknown as unknown).mockImplementation((selector: unknown) =>
      selector({ setAuth: mockSetAuth })
    );
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/e-posta adresi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi giriniz/i)).toBeInTheDocument();
      expect(screen.getByText(/şifre en az 6 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderComponent();
    const passwordInput = screen.getByLabelText(/şifre/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: '' }); // The button wrapping the Eye icon
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles successful login and redirects regular user to onboarding if not onboarded', async () => {
    const mockToken = 'mock-token';
    const mockRole = 'User';
    const mockProfile = { id: '1', email: 'test@example.com', username: 'test', isOnboarded: false };

    (sessionApi.login as unknown).mockResolvedValue({ accessToken: { token: mockToken } });
    (jwtHelpers.decodeRoleFromToken as unknown).mockReturnValue(mockRole);
    (userApi.getProfile as unknown).mockResolvedValue(mockProfile);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(sessionApi.login).toHaveBeenCalledWith({
        request: { email: 'test@example.com', password: 'password123' }
      });
      expect(jwtHelpers.decodeRoleFromToken).toHaveBeenCalledWith(mockToken);
      expect(userApi.getProfile).toHaveBeenCalled();
      expect(mockSetAuth).toHaveBeenCalledWith(true, {
        id: mockProfile.id,
        email: mockProfile.email,
        role: mockRole,
        username: mockProfile.username,
        profileImageUrl: undefined,
        isOnboarded: mockProfile.isOnboarded,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('handles successful login and redirects admin to dashboard', async () => {
    const mockToken = 'mock-token';
    const mockRole = 'Admin';
    const mockProfile = { id: '1', email: 'admin@example.com', username: 'admin', isOnboarded: true };

    (sessionApi.login as unknown).mockResolvedValue({ accessToken: { token: mockToken } });
    (jwtHelpers.decodeRoleFromToken as unknown).mockReturnValue(mockRole);
    (userApi.getProfile as unknown).mockResolvedValue(mockProfile);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('handles successful login and redirects user to home if onboarded', async () => {
    const mockToken = 'mock-token';
    const mockRole = 'User';
    const mockProfile = { id: '1', email: 'user@example.com', username: 'user', isOnboarded: true };

    (sessionApi.login as unknown).mockResolvedValue({ accessToken: { token: mockToken } });
    (jwtHelpers.decodeRoleFromToken as unknown).mockReturnValue(mockRole);
    (userApi.getProfile as unknown).mockResolvedValue(mockProfile);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('handles EMAIL_NOT_VERIFIED error and redirects to verify email', async () => {
    const axiosError = new AxiosError('Error');
    axiosError.response = {
      data: { errorCode: 'EMAIL_NOT_VERIFIED' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown,
    };
    (sessionApi.login as unknown).mockRejectedValue(axiosError);
    (sessionApi.resendOtp as unknown).mockResolvedValue({});

    renderComponent();

    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(sessionApi.resendOtp).toHaveBeenCalledWith('test@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email?email=test%40example.com');
    });
  });

  it('handles general API error gracefully', async () => {
    const axiosError = new AxiosError('Error');
    axiosError.response = {
      data: { detail: 'Invalid credentials' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as unknown,
    };
    (sessionApi.login as unknown).mockRejectedValue(axiosError);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/e-posta adresi/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
