import apiClient from "@/lib/api";
import axios from "axios";

/** PATCH client (for auth + proxy routing) */
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

function getMultipartHeaders(data: any) {
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  return isFormData
    ? {
        "Content-Type": "multipart/form-data",
      }
    : undefined;
}

function handleAxiosError(error: unknown, label: string): never {
  if (axios.isAxiosError(error)) {
    console.error(`${label}:`, {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: (error.response?.data as any)?.message || error.message,
      data: error.response?.data,
    });

    throw new Error(
      (error.response?.data as any)?.message || `${label} failed`
    );
  }

  console.error(`${label} UNKNOWN ERROR:`, error);
  throw error;
}

export interface AdminProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
  minPrice?: number;
  maxPrice?: number;
}

export const adminProductService = {
  // ─── LIST PRODUCTS ──────────────────────────────────────
  async getAll(params: AdminProductListParams = {}) {
    try {
      const cleanedParams: Record<string, any> = {};

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanedParams[key] = value;
        }
      });

      const res = await apiClient.get("/products", {
        params: cleanedParams,
      });

      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET PRODUCTS ERROR");
    }
  },

  // ─── SEARCH PRODUCTS ────────────────────────────────────
  async search(query: string) {
    try {
      const res = await apiClient.get("/products/search", {
        params: { q: query },
      });

      return res.data;
    } catch (error) {
      handleAxiosError(error, "SEARCH PRODUCTS ERROR");
    }
  },

  // ─── GET PRODUCT BY ID ──────────────────────────────────
  async getById(id: string | number) {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET PRODUCT BY ID ERROR");
    }
  },

  // ─── CREATE PRODUCT ─────────────────────────────────────
  async create(data: any) {
    try {
      const res = await apiClient.post("/products", data, {
        headers: getMultipartHeaders(data),
      });

      return res.data;
    } catch (error) {
      handleAxiosError(error, "CREATE PRODUCT ERROR");
    }
  },

  // ─── UPDATE PRODUCT ─────────────────────────────────────
  async update(id: string | number, data: any) {
    try {
      const res = await patchClient.patch(`/products/${id}`, data, {
        headers: getMultipartHeaders(data),
      });

      return res.data;
    } catch (error) {
      handleAxiosError(error, "UPDATE PRODUCT ERROR");
    }
  },

  // ─── DELETE PRODUCT ─────────────────────────────────────
  async delete(id: string | number) {
    try {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "DELETE PRODUCT ERROR");
    }
  },

  // ─── STATUS TOGGLE ──────────────────────────────────────
  async updateStatus(id: string | number, data: { isActive?: boolean; status?: string }) {
    try {
      const res = await patchClient.patch(`/products/${id}/status`, data);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "UPDATE PRODUCT STATUS ERROR");
    }
  },

  // ─── IMAGE MANAGEMENT ───────────────────────────────────
  async addImages(id: string | number, data: any) {
    try {
      const res = await apiClient.post(`/products/${id}/images`, data, {
        headers: getMultipartHeaders(data),
      });

      return res.data;
    } catch (error) {
      handleAxiosError(error, "ADD PRODUCT IMAGES ERROR");
    }
  },

  async deleteImage(productId: string | number, imageId: string) {
    try {
      const res = await apiClient.delete(
        `/products/${productId}/images/${imageId}`
      );

      return res.data;
    } catch (error) {
      handleAxiosError(error, "DELETE PRODUCT IMAGE ERROR");
    }
  },

  // ─── FEATURED / BEST SELLERS / STORY / SIMILAR / RATING ─
  async getFeatured() {
    try {
      const res = await apiClient.get("/products/featured");
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET FEATURED PRODUCTS ERROR");
    }
  },

  async getBestSellers() {
    try {
      const res = await apiClient.get("/products/best-sellers");
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET BEST SELLERS ERROR");
    }
  },

  async getStory(productId: string | number) {
    try {
      const res = await apiClient.get(`/products/${productId}/story`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET PRODUCT STORY ERROR");
    }
  },

  async getSimilar(productId: string | number) {
    try {
      const res = await apiClient.get(`/products/${productId}/similar`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET SIMILAR PRODUCTS ERROR");
    }
  },

  async submitRating(
    productId: string | number,
    data: { rating: number; review?: string }
  ) {
    try {
      const res = await apiClient.post(`/products/${productId}/rating`, data);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "SUBMIT PRODUCT RATING ERROR");
    }
  },
};