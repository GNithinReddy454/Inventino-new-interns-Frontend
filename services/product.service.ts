import apiClient from "@/lib/api";
import {
  GetAllProductsParams,
  ProductListResponse,
  ProductDetailResponse,
} from "@/types/products.type";

export const productService = {
  // GET /products — category + sort + pagination
  async getAll(params?: GetAllProductsParams) {
    const response = await apiClient.get<ProductListResponse>("/products", { params });
    return response;
  },

  // GET /products/search?q=
  async searchProducts(query: string, page = 1, limit = 9) {
    const response = await apiClient.get<ProductListResponse>("/products/search", {
      params: { q: query, page, limit },
    });
    return response;
  },

  // GET /products/featured
  async getFeatured(page = 1, limit = 9) {
    const response = await apiClient.get("/products/featured", {
      params: { page, limit },
    });
    return response;
  },

  // GET /products/best-sellers
  async getBestSellers(page = 1, limit = 9) {
    const response = await apiClient.get("/products/best-sellers", {
      params: { page, limit },
    });
    return response;
  },

  async getById(id: string | number) {
    const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiClient.get<ProductDetailResponse>(`/products/${slug}`);
    return response.data;
  },

  async getByCategory(category: string, page = 1, limit = 9) {
    const response = await apiClient.get<ProductListResponse>("/products", {
      params: { category, page, limit },
    });
    return response;
  },

  async create(data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const response = await apiClient.post("/products", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  async update(id: string | number, data: any) {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  async addImages(id: string | number, data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const response = await apiClient.post(`/products/${id}/images`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  async deleteImage(productId: string | number, imageId: string) {
    const response = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async updateStatus(id: string | number, data: any) {
    const response = await apiClient.patch(`/products/${id}/status`, data);
    return response.data;
  },

  // GET /products/:productId/similar
  async getSimilar(productId: string) {
    const response = await apiClient.get(`/products/${productId}/similar`);
    return response.data;
  },

  // GET /products/:productId/story
  // NOTE: productId here must be the PRD-xxx format ID, not the MongoDB _id
  async getStory(productId: string) {
    const response = await apiClient.get(`/products/${productId}/story`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data;
  },
};