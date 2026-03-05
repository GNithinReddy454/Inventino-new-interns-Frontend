import apiClient from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/lib/types";

export const authService = {
  async loginUser(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    const { token } = response.data.data;
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data;
  },

  async registerUser(userData: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  async logoutUser(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
    }
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/verify-email", { email, otp });
    const { token } = response.data.data;
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data;
  },

  async resendOtp(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/resend-otp", { email });
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", data);
    return response.data;
  },

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>("/auth/change-password", data);
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get("/users/me");
    return response.data.data;
  },
};