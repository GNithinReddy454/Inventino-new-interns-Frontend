import apiClient from "@/lib/api";
import axios from "axios";
import {
  GetAllProductsParams,
  ProductDetailResponse,
} from "@/types/products.type";

/** Proxy-aware client for PATCH requests (routes through Next.js rewrite to bypass CORS) */
const patchClient = axios.create({ baseURL: "/api" });

patchClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Real backend list response shape from Postman:
 * {
 *   statusCode: 200,
 *   message: "Products fetched",
 *   data: {
 *     items: [...]
 *   }
 * }
 */
export interface ProductApiItem {
  _id: string;
  productId?: string;
  productName?: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discountPrice?: number;
  category?: string;
  stock?: number;
  material?: string;
  isActive?: boolean;
  trendy?: boolean;
  bestSeller?: boolean;
  hashtags?: string[];
  story?: string;
  sku?: string;
  mainImage?: string;
  imageUrl?: string;
  galleryImages?: { _id?: string; id?: string; url?: string }[];
  images?: any[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ProductListApiResponse {
  statusCode: number;
  message: string;
  data: {
    items: ProductApiItem[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export const productService = {
  // GET /products — category + sort + pagination
  async getAll(params?: GetAllProductsParams) {
    const response = await apiClient.get<ProductListApiResponse>("/products", {
      params,
    });
    return response;
  },

  // GET /products/search?q=
  async searchProducts(query: string, page = 1, limit = 9) {
    const response = await apiClient.get<ProductListApiResponse>("/products/search", {
      params: { q: query, page, limit },
    });
    return response;
  },

  // GET /products/featured
  async getFeatured(page = 1, limit = 9) {
    const response = await apiClient.get<ProductListApiResponse>("/products/featured", {
      params: { page, limit },
    });
    return response;
  },

  // GET /products/best-sellers
  async getBestSellers(page = 1, limit = 9) {
    const response = await apiClient.get<ProductListApiResponse>("/products/best-sellers", {
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
    const response = await apiClient.get<ProductListApiResponse>("/products", {
      params: { category, page, limit },
    });
    return response;
  },

  async create(data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const response = await apiClient.post("/products", data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return response.data;
  },

  async update(id: string | number, data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const response = await patchClient.patch(`/products/${id}`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return response.data;
  },

  async addImages(id: string | number, data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const response = await apiClient.post(`/products/${id}/images`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
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
    const response = await patchClient.patch(`/products/${id}/status`, data);
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
    try {
      const response = await apiClient.get(`/products/${productId}/story`, {
        headers: { "Cache-Control": "no-cache" },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Story not found for product ID: ${productId}`);
        return null;
      }
      throw error;
    }
  },

  // GET /reviews/product/:productId
  async getReviews(productId: string, page = 1, limit = 10) {
    const response = await apiClient.get(`/reviews/product/${productId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // GET /products/:productId/variants
  async getVariants(productId: string) {
    const response = await apiClient.get(`/products/${productId}/variants`);
    return response.data;
  },
};