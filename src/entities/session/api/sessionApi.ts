import { apiInstance } from "@/shared/api";

export interface LoginRequest {
  request: {
    email: string;
    password: string;
  };
}

/**
 * Backend login response — tokens are set via HttpOnly cookies.
 * The response body contains token metadata but we don't consume it;
 * session state is established via initialize() → GET /users/me.
 */
export interface LoginResponse {
  accessToken: {
    token: string;
    expiration: string;
  };
  refreshToken: {
    token: string;
    expiration: string;
  };
}

export const sessionApi = {
  login: async (data: LoginRequest): Promise<void> => {
    // We don't need the response body — cookies are set by the server.
    // Session state is established via store.initialize() after login.
    await apiInstance.post("/auth/login", data);
  },
  logout: async (): Promise<void> => {
    await apiInstance.post("/auth/logout");
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiInstance.post("/auth/forgot-password", {
      request: { email },
    });
  },
  resetPassword: async (data: { email: string; otpCode: string; newPassword: string }): Promise<void> => {
    await apiInstance.post("/auth/reset-password", {
      request: data,
    });
  },
  register: async (data: { firstName: string; lastName: string; email: string; password: string }): Promise<void> => {
    await apiInstance.post("/auth/register", {
      request: data,
    });
  },
  verifyEmail: async (data: { email: string; otpCode: string }): Promise<void> => {
    await apiInstance.post("/auth/verify-email", {
      request: data,
    });
  },
  resendOtp: async (email: string): Promise<void> => {
    await apiInstance.post("/auth/resend-otp", {
      request: { email },
    });
  },
};
