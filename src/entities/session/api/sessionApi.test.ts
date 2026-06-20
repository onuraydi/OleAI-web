import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionApi } from './sessionApi';
import { apiInstance } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  apiInstance: {
    post: vi.fn(),
  }
}));

describe('sessionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls /auth/login with correct data', async () => {
    const mockData = { request: { email: 'test@test.com', password: 'password' } };
    const mockResponse = { accessToken: { token: '123', expiration: 'now' } };
    vi.mocked(apiInstance.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await sessionApi.login(mockData);

    expect(apiInstance.post).toHaveBeenCalledWith('/auth/login', mockData);
    expect(result).toEqual(mockResponse);
  });

  it('logout calls /auth/logout', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    await sessionApi.logout();
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/logout', {});
  });

  it('forgotPassword calls /auth/forgot-password', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    await sessionApi.forgotPassword('test@test.com');
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/forgot-password', { request: { email: 'test@test.com' } });
  });

  it('resetPassword calls /auth/reset-password', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    const req = { email: 't', otpCode: '1', newPassword: 'p' };
    await sessionApi.resetPassword(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/reset-password', { request: req });
  });

  it('register calls /auth/register', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    const req = { firstName: 'a', lastName: 'b', email: 'c', password: 'p', acceptTerms: true };
    await sessionApi.register(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/register', { request: req });
  });

  it('verifyEmail calls /auth/verify-email', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    const req = { email: 't', otpCode: '1' };
    await sessionApi.verifyEmail(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/verify-email', { request: req });
  });

  it('resendOtp calls /auth/resend-otp', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    await sessionApi.resendOtp('test@test.com');
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/resend-otp', { request: { email: 'test@test.com' } });
  });

  it('changePassword calls /auth/change-password', async () => {
    const mockRes = { message: 'success' };
    vi.mocked(apiInstance.post).mockResolvedValueOnce({ data: mockRes });
    const req = { oldPassword: 'o', newPassword: 'n' };
    const result = await sessionApi.changePassword(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/change-password', req);
    expect(result).toEqual(mockRes);
  });
});
