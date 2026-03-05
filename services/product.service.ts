import apiClient from "@/lib/api";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  async getAll(params?: GetProductsParams) {
    const response = await apiClient.get("/products", { params });
    return response;
  },

  async getById(id: string | number) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async search(query: string) {
    const response = await apiClient.get("/products", {
      params: { search: query },
    });
    return response.data;
  },

  async getByCategory(category: string, page = 1, limit = 9) {
    const response = await apiClient.get("/products", {
      params: { category, page, limit },
    });
    return response.data;
  },

  async getFeatured() {
    const response = await apiClient.get("/products", {
      params: { featured: true },
    });
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  async update(id: string | number, data: any) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  async patch(id: string | number, data: any) {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async getReviews(id: string | number) {
    const response = await apiClient.get(`/products/${id}/reviews`);
    return response.data;
  },

  async addReview(id: string | number, review: any) {
    const response = await apiClient.post(`/products/${id}/reviews`, review);
    return response.data;
  },

  async getImages(id: string | number) {
    const response = await apiClient.get(`/products/${id}/images`);
    return response.data;
  },

  async getInventory(id: string | number) {
    const response = await apiClient.get(`/products/${id}/inventory`);
    return response.data;
  },

  async getRelated(id: string | number) {
    const response = await apiClient.get(`/products/${id}/related`);
    return response.data;
  },
};