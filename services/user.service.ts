import apiClient from "@/lib/api";

/**
 * User Service
 * Handles all /api/users/* endpoints
 *
 * Routes (from backend docs):
 *   GET    /users/me         → Get current user profile (Auth token required)
 *   PUT    /users/me         → Update name & phone (Auth token required)
 *   DELETE /users/me         → Delete user account (Auth token required)
 */
export const userService = {
  /**
   * Fetch the currently logged-in user's profile.
   * GET /users/me  →  Bearer token auto-added by apiClient interceptor
   */
  async getProfile() {
    const response = await apiClient.get("/users/me");
    return response.data; // { statusCode, message, data: { _id, name, email, phone, role, ... } }
  },

  /**
   * Update name and/or phone of the logged-in user.
   * PUT /users/me
   * Body: { name?, phone? }
   */
  async updateProfile(data: { name?: string; phone?: string }) {
    const response = await apiClient.put("/users/me", data);
    return response.data; // { statusCode, message, data: { _id, name, email, phone, ... } }
  },

  /**
   * Permanently delete the logged-in user's account.
   * DELETE /users/me
   */
  async deleteAccount() {
    const response = await apiClient.delete("/users/me");
    return response.data; // { statusCode, message, data: null }
  },
};
