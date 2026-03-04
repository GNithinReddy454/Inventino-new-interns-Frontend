import apiClient from "@/lib/api";

/**
 * Product Service
 * Fully supports:
 * - Filter
 * - Pagination
 * - Sorting
 * - Search
 * - CRUD
 * - Reviews
 * - Images
 * - Inventory
 * - Related Products
 */

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: "newest" | "LOW to HIGH" | "HIGH to LOW";
}

export const productService = {
  /**
   * Get all products with filters
   * Example:
   * /products?category=Women Watches&page=1&limit=5&sort=priceAsc
   */
  async getAll(params?: GetProductsParams) {
    const response = await apiClient.get("/products", {
      params,
    });
    return response.data;
  },

  /**
   * Get single product
   */
  async getById(id: string | number) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Search products
   */
  async search(query: string) {
    const response = await apiClient.get("/products", {
      params: { search: query },
    });
    return response.data;
  },

  /**
   * Filter by category
   */
  async getByCategory(category: string, page = 1, limit = 9) {
    const response = await apiClient.get("/products", {
      params: { category, page, limit },
    });
    return response.data;
  },

  /**
   * Get featured products
   * (If backend supports ?featured=true)
   */
  async getFeatured() {
    const response = await apiClient.get("/products", {
      params: { featured: true },
    });
    return response.data;
  },

  /**
   *

  /**
   * Create product (ADMIN)
   */
  async create(data: any) {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  /**
   * Full update
   */
  async update(id: string | number, data: any) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Partial update
   */
  async patch(id: string | number, data: any) {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product
   */
  async delete(id: string | number) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Get product reviews
   */
  async getReviews(id: string | number) {
    const response = await apiClient.get(`/products/${id}/reviews`);
    return response.data;
  },

  /**
   * Add review
   */
  async addReview(id: string | number, review: any) {
    const response = await apiClient.post(
      `/products/${id}/reviews`,
      review
    );
    return response.data;
  },

  /**
   * Get product images
   */
  async getImages(id: string | number) {
    const response = await apiClient.get(`/products/${id}/images`);
    return response.data;
  },

  /**
   * Get inventory / stock
   */
  async getInventory(id: string | number) {
    const response = await apiClient.get(`/products/${id}/inventory`);
    return response.data;
  },

  /**
   * Get related products
   */
  async getRelated(id: string | number) {
    const response = await apiClient.get(`/products/${id}/related`);
    return response.data;
  },
};