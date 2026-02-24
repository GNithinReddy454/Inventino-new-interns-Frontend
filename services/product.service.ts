import apiClient from "@/lib/api";

/**
 * Product Service - All product operations
 * 
 * Handles:
 * - Fetching product lists
 * - Getting product details
 * - Searching products
 * - Filtering products
 * - Product CRUD (for admin)
 */
export const productService = {
  /**
   * Get all products with optional pagination/filters
   * @param params - Query parameters (page, limit, category, search, etc.)
   */
  async getAll(params?: any) {
    const response = await apiClient.get("/api/products", { params });
    return response.data;
  },

  /**
   * Get single product by ID
   * @param id - Product ID
   */
  async getById(id: string | number) {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Search products
   * @param query - Search query string
   */
  async search(query: string) {
    const response = await apiClient.get("/api/products/search", {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get products by category
   * @param category - Category name/ID
   */
  async getByCategory(category: string) {
    const response = await apiClient.get(`/api/products/category/${category}`);
    return response.data;
  },

  /**
   * Get featured/trending products
   */
  async getFeatured() {
    const response = await apiClient.get("/api/products/featured");
    return response.data;
  },

  /**
   * Get best sellers
   */
  async getBestSellers() {
    const response = await apiClient.get("/api/products/best-sellers");
    return response.data;
  },

  /**
   * Create new product (ADMIN)
   */
  async create(data: any) {
    const response = await apiClient.post("/api/products", data);
    return response.data;
  },

  /**
   * Update product (ADMIN) - Full update
   */
  async update(id: string | number, data: any) {
    const response = await apiClient.put(`/api/products/${id}`, data);
    return response.data;
  },

  /**
   * Partial update product (ADMIN)
   */
  async patch(id: string | number, data: any) {
    const response = await apiClient.patch(`/api/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product (ADMIN)
   */
  async delete(id: string | number) {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Get product reviews
   */
  async getReviews(id: string | number) {
    const response = await apiClient.get(`/api/products/${id}/reviews`);
    return response.data;
  },

  /**
   * Add product review
   */
  async addReview(id: string | number, review: any) {
    const response = await apiClient.post(`/api/products/${id}/reviews`, review);
    return response.data;
  },

  /**
   * Get product images
   */
  async getImages(id: string | number) {
    const response = await apiClient.get(`/api/products/${id}/images`);
    return response.data;
  },

  /**
   * Get product inventory/stock
   */
  async getInventory(id: string | number) {
    const response = await apiClient.get(`/api/products/${id}/inventory`);
    return response.data;
  },

  /**
   * Get related products
   */
  async getRelated(id: string | number) {
    const response = await apiClient.get(`/api/products/${id}/related`);
    return response.data;
  },
};
