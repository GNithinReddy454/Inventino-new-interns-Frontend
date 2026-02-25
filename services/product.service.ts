import apiClient from "@/lib/api";
import {
  GetAllProductsParams,
  ProductListResponse,
  ProductDetailResponse,
} from "@/types/products.type";

export const productService = {
  async getAll(params?: GetAllProductsParams): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>("/products", {
      params: {
        ...(params?.page     && { page:     params.page }),
        ...(params?.limit    && { limit:    params.limit }),
        ...(params?.sort     && { sort:     params.sort }),
        ...(params?.category && { category: params.category }),
        ...(params?.search   && { search:   params.search }),
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<ProductDetailResponse> {
    const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
    return response.data;
  },

  async search(query: string) {
    const response = await apiClient.get("/products/search", {
      params: { q: query },
    });
    return response.data;
  },

  async getByCategory(category: string) {
    const response = await apiClient.get(`/products/category/${category}`);
    return response.data;
  },

  async getFeatured() {
    const response = await apiClient.get("/products/featured");
    return response.data;
  },

  async getBestSellers() {
    const response = await apiClient.get("/products/best-sellers");
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  async patch(id: string, data: any) {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async getReviews(id: string) {
    const response = await apiClient.get(`/products/${id}/reviews`);
    return response.data;
  },

  async addReview(id: string, review: any) {
    const response = await apiClient.post(`/products/${id}/reviews`, review);
    return response.data;
  },

  async getImages(id: string) {
    const response = await apiClient.get(`/products/${id}/images`);
    return response.data;
  },

  async getInventory(id: string) {
    const response = await apiClient.get(`/products/${id}/inventory`);
    return response.data;
  },

  async getRelated(id: string) {
    const response = await apiClient.get(`/products/${id}/related`);
    return response.data;
  },
};