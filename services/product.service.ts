import apiClient from "@/lib/api";
import axios, { AxiosResponse } from "axios";
import {
  GetAllProductsParams,
  ProductDetailResponse,
  ProductListMeta,
} from "@/types/products.type";

/**
 * Product type used across frontend (SAFE + FLEXIBLE)
 */
export interface ProductApiItem {
  _id: string;
  productId?: string;
  productName?: string;
  name?: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  category?: string;
  stock?: number;
  material?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  trendy?: boolean;
  bestSeller?: boolean;
  hashtags?: string[];
  story?: string;
  sku?: string;
  mainImage?: string;
  imageUrl?: string;
  galleryImages?: { _id?: string; id?: string; url?: string }[];
  images?: Array<{ url?: string } | string>;
  createdAt?: string;
  updatedAt?: string;
  ratingsAverage?: number;
  ratingsCount?: number;
  variants?: any[];
  color?: string;
  size?: string;
  [key: string]: any;
}

export interface ProductListApiResponse {
  statusCode: number;
  message: string;
  data: {
    items: ProductApiItem[];
    meta?: ProductListMeta;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export const productService = {
  // ─── PRODUCT LIST ───────────────────────────────────────
  async getAll(
    params?: GetAllProductsParams
  ): Promise<AxiosResponse<ProductListApiResponse>> {
    return apiClient.get("/products", { params });
  },

  async searchProducts(
    query: string,
    page = 1,
    limit = 9
  ): Promise<AxiosResponse<ProductListApiResponse>> {
    return apiClient.get("/products/search", {
      params: { q: query, page, limit },
    });
  },

  async getFeatured(page = 1, limit = 9) {
    return apiClient.get("/products/featured", {
      params: { page, limit },
    });
  },

  async getBestSellers(page = 1, limit = 9) {
    return apiClient.get("/products/best-sellers", {
      params: { page, limit },
    });
  },

  async getByCategory(category: string, page = 1, limit = 9) {
    return apiClient.get("/products", {
      params: { category, page, limit },
    });
  },

  // ─── PRODUCT DETAILS ─────────────────────────────────────
  async getById(
    id: string | number,
    params?: Record<string, string | number>
  ): Promise<ProductDetailResponse | null> {
    try {
      const res = await apiClient.get(`/products/${id}`, {
        params,
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      return res.data;
    } catch (error) {
      console.error(`[Product Details] fetch failed for ID: ${id}`, error);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<ProductDetailResponse | null> {
    try {
      const res = await apiClient.get(`/products/${slug}`);
      return res.data;
    } catch (error) {
      console.error(`[Product Details] fetch failed for slug: ${slug}`, error);
      return null;
    }
  },

  // ─── EXTRA FEATURES ─────────────────────────────────────
  async getSimilar(
    productId: string,
    params?: Record<string, string | number>
  ) {
    try {
      const res = await apiClient.get(`/products/${productId}/similar`, {
        params,
      });
      return res.data;
    } catch (error) {
      console.error(`[Similar Products] fetch failed for ID: ${productId}`, error);
      return { data: [] };
    }
  },

  async getStory(
    productId: string,
    params?: Record<string, string | number>
  ) {
    try {
      const res = await apiClient.get(`/products/${productId}/story`, {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 400 || status === 500) {
          return null;
        }
      }
      console.error(`[Product Story] fetch failed for ID: ${productId}`, error);
      return null;
    }
  },

  async getReviews(productId: string, page = 1, limit = 10) {
    const res = await apiClient.get(`/reviews/product/${productId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  async getVariants(productId: string) {
    const res = await apiClient.get(`/products/${productId}/variants`);
    return res.data;
  },
};