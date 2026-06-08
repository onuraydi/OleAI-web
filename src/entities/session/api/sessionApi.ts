import { apiInstance } from "@/shared/api";

export interface LoginRequest {
  request: {
    email: string;
    password: string;
  };
}

export interface LoginResponse {
  accessToken?: {
    token: string;
    expiration: string;
  };
  refreshToken?: {
    token: string;
    expiration: string;
  };
  AccessToken?: {
    Token: string;
    Expiration: string;
  };
  RefreshToken?: {
    Token: string;
    Expiration: string;
  };
}

export const sessionApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiInstance.post<LoginResponse>("/auth/login", data);
    return response.data;
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
