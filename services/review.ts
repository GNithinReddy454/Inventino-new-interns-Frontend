
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

      // Backend may return HTTP 200 but with statusCode:404 in the body
      const body = response.data;
      const bodyStatus = body?.statusCode ?? body?.status;
      if (bodyStatus === 404 || body?.message?.toLowerCase().includes("not found")) {
        return { statusCode: 404, message: "No reviews found", data: { reviews: [] }, error: null };
      }

      return body;
    } catch (error: any) {
      const status = error.response?.status;

      // 404 via HTTP status — product has no reviews yet, not a real error
      if (status === 404) {
        return { statusCode: 404, message: "No reviews found", data: { reviews: [] }, error: null };
      }

      const isNetworkError = !error.response;
      const errorDetail = isNetworkError
        ? `Network error — ${String(error.message)}`
        : `HTTP ${status}: ${JSON.stringify(error.response.data)}`;

      console.error("Fetching reviews failed:", errorDetail);

      return {
        statusCode: isNetworkError ? 503 : (status || 500),
        message: isNetworkError
          ? "Unable to reach server. Please check your connection."
          : (error.response?.data?.message || "Failed to fetch reviews"),
        data: { reviews: [] },
        error: error.message
      };
    }
  },
};