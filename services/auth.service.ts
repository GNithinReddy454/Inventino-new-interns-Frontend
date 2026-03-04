import apiClient from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";

export const authService = {
  // Uses User interface for credentials to avoid 'any'
  async loginUser(
    credentials: Partial<User> & { password?: string },
  ): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", credentials);
    // Standard Practice: Pick JWT and store in localStorage for interceptors
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  async registerUser(
    userData: Partial<User> & { password?: string },
  ): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/register", userData);
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  async logoutUser(): Promise<void> {
    localStorage.removeItem("token");
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Logic continues even if backend logout fails
    }
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/verify-email", { email, otp });
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<any> {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<any> {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  async resendOtp(email: string): Promise<any> {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  },

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<any> {
    const response = await apiClient.put("/auth/change-password", data);
    return response.data;
  },
};
