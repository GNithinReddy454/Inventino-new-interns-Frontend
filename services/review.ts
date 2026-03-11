import apiClient from "@/lib/api";

/**
 * Review Service - All review operations
 * Matches the pattern used in order.ts
 */
export const reviewService = {
  /**
   * Submit a product review
   * POST http://localhost:8080/api/reviews/product/:productId
   */
  async submitReview(
    productId: string,
    payload: {
      rating: number;
      comment: string;
      images?: string[];
    }
  ) {
    try {
      const response = await apiClient.post(`/reviews/product/${productId}`, payload);
      return response.data;
    } catch (error: any) {
      console.error("Review submission failed:", error.response?.data);
      // Returns a structured error object similar to placeOrder fallback
      return {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Failed to submit review",
        data: null,
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Get reviews for a specific product
   * GET http://localhost:8080/api/reviews/product/:productId
   */
  async getReviews(productId: string) {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error("Fetching reviews failed:", error.response?.data);
      return {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Failed to fetch reviews",
        data: { reviews: [] },
        error: error.message
      };
    }
  },
};