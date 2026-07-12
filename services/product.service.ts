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

function unwrapPayload(payload: any): any {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function getListItemsAndMeta(payload: any) {
  const root = unwrapPayload(payload);

  if (Array.isArray(root)) {
    return {
      items: root,
      meta: {
        total: root.length,
        page: 1,
        limit: root.length,
        totalPages: 1,
      },
    };
  }

  if (root && typeof root === "object") {
    const directItems = Array.isArray(root.items)
      ? root.items
      : Array.isArray(root.data)
      ? root.data
      : [];

    const sourceMeta = root.meta ?? {};
    const total = Number(root.total ?? sourceMeta.total ?? directItems.length ?? 0);
    const page = Number(root.page ?? sourceMeta.page ?? 1);
    const limit = Number(root.limit ?? sourceMeta.limit ?? Math.max(directItems.length, 1));
    const totalPages = Number(
      root.totalPages ?? sourceMeta.totalPages ?? Math.ceil(total / Math.max(limit, 1))
    );

    return {
      items: directItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  return {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: 1,
      totalPages: 1,
    },
  };
}

function normalizeListResponse(payload: any, page = 1, limit = 9): ProductListApiResponse {
  const { items, meta } = getListItemsAndMeta(payload);

  return {
    statusCode: Number(payload?.statusCode ?? 200),
    message: String(payload?.message ?? "Products fetched"),
    data: {
      items,
      meta: {
        total: Number(meta.total ?? items.length ?? 0),
        page: Number(meta.page ?? page),
        limit: Number(meta.limit ?? limit),
        totalPages: Number(meta.totalPages ?? 1),
      },
    },
  };
}

function normalizeSingleResponse(payload: any): ProductDetailResponse {
  const root = unwrapPayload(payload);

  const data =
    root && typeof root === "object" && Array.isArray(root.items)
      ? root.items[0] ?? null
      : root;

  return {
    statusCode: Number(payload?.statusCode ?? 200),
    message: String(payload?.message ?? "Product fetched"),
    data,
  };
}

function normalizeArrayData(payload: any): any[] {
  const root = unwrapPayload(payload);

  if (Array.isArray(root)) return root;
  if (root && typeof root === "object") {
    if (Array.isArray(root.items)) return root.items;
    if (Array.isArray(root.data)) return root.data;
  }

  return [];
}

export const productService = {
  // ─── PRODUCT LIST ───────────────────────────────────────
  async getAll(
    params?: GetAllProductsParams
  ): Promise<AxiosResponse<ProductListApiResponse>> {
    const response = await apiClient.get("/products", { params });
    response.data = normalizeListResponse(
      response.data,
      Number(params?.page ?? 1),
      Number(params?.limit ?? 9)
    );
    return response as AxiosResponse<ProductListApiResponse>;
  },

  async searchProducts(
    query: string,
    page = 1,
    limit = 9
  ): Promise<AxiosResponse<ProductListApiResponse>> {
    const response = await apiClient.get("/products/search", {
      params: { q: query, page, limit },
    });
    response.data = normalizeListResponse(response.data, page, limit);
    return response as AxiosResponse<ProductListApiResponse>;
  },

  async getFeatured(page = 1, limit = 9) {
    const response = await apiClient.get("/products/featured", {
      params: { page, limit },
    });
    response.data = normalizeListResponse(response.data, page, limit);
    return response;
  },

  async getBestSellers(page = 1, limit = 9) {
    const response = await apiClient.get("/products/best-sellers", {
      params: { page, limit },
    });
    response.data = normalizeListResponse(response.data, page, limit);
    return response;
  },

  async getByCategory(category: string, page = 1, limit = 9) {
    const response = await apiClient.get("/products", {
      params: { category, page, limit },
    });
    response.data = normalizeListResponse(response.data, page, limit);
    return response;
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
      return normalizeSingleResponse(res.data);
    } catch (error) {
      console.error(`[Product Details] fetch failed for ID: ${id}`, error);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<ProductDetailResponse | null> {
    try {
      const res = await apiClient.get(`/products/${slug}`);
      return normalizeSingleResponse(res.data);
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
      return { data: normalizeArrayData(res.data) };
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
      const storyData = unwrapPayload(res.data);
      return { data: storyData };
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

  async getStories(page = 1, limit = 10) {
    try {
      const response = await apiClient.get("/products/stories", {
        params: { page, limit },
      });

      response.data = normalizeListResponse(response.data, page, limit);
      return response;
    } catch (error) {
      console.error("[Product Stories] fetch failed", error);
      return {
        data: normalizeListResponse(null, page, limit),
      };
    }
  },

  async addVideos(_productId: string | number, _payload?: unknown) {
    return {
      statusCode: 501,
      message: "Product video upload endpoint is not available on backend yet",
      data: null,
    };
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