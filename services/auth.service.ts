import apiClient from "@/lib/api";

/**
 * Auth Service - All authentication operations
 * 
 * Handles:
 * - User login
 * - User registration
 * - User logout
 * - Token refresh
 * - Password reset
 * - Email verification
 */
export const authService = {
  /**
   * Login user with email/password
   * Stores token in localStorage
   */
  async loginUser(credentials: any) {
    const response = await apiClient.post("/api/auth/login", credentials);
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Register new user
   * Stores token in localStorage
   */
  async registerUser(userData: any) {
    const response = await apiClient.post("/api/auth/register", userData);
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   * Clears local storage
   */
  async logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optional: Notify backend
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      // Logout from frontend even if backend fails
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const response = await apiClient.post("/api/auth/refresh");
    if (response.data?.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  /**
   * Verify email with OTP
   */
  async verifyEmail(email: string, otp: string) {
    const response = await apiClient.post("/api/auth/verify-email", { email, otp });
    return response.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const response = await apiClient.post("/api/auth/reset-password-request", { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const response = await apiClient.post("/api/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userData: any) {
    const response = await apiClient.put("/api/auth/profile", userData);
    if (response.data?.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
};
