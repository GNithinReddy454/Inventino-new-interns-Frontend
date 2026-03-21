import apiClient from "@/lib/api";
import axios, { AxiosRequestConfig } from "axios";

const patchClient = axios.create({
  baseURL: "/api",
});

patchClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function getMultipartHeaders(data: unknown) {
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
      message:
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message,
      data: error.response?.data,
    });

    throw new Error(
      (error.response?.data as { message?: string } | undefined)?.message ||
        `${label} failed`
    );
  }

  console.error(`${label} UNKNOWN ERROR:`, error);
  throw error;
}

function cleanParams<T extends object>(params: T = {} as T) {
  const cleaned: Record<string, unknown> = {};

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

export interface AdminProductListParams {
  id?: string;
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  category?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  bestSeller?: boolean;
  trendy?: boolean;
}

export interface ProductRatingPayload {
  rating: number;
  review?: string;
}

export interface ProductStatusPayload {
  isActive?: boolean;
  status?: string;
}

export const adminProductService = {
  async getAll(params: AdminProductListParams = {}) {
    try {
      const res = await apiClient.get("/products", {
        params: cleanParams(params),
      });
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET PRODUCTS ERROR");
    }
  },

  async search(query: string, params: Omit<AdminProductListParams, "q"> = {}) {
    try {
      const res = await apiClient.get("/products/search", {
        params: cleanParams({
          q: query,
          ...params,
        }),
      });
      return res.data;
    } catch (error) {
      handleAxiosError(error, "SEARCH PRODUCTS ERROR");
    }
  },

  async getById(id: string | number) {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "GET PRODUCT BY ID ERROR");
    }
  },

  async create(data: FormData | Record<string, unknown>) {
    try {
      const config: AxiosRequestConfig = {
        headers: getMultipartHeaders(data),
      };

      const res = await apiClient.post("/products", data, config);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "CREATE PRODUCT ERROR");
    }
  },

  async update(id: string | number, data: FormData | Record<string, unknown>) {
    try {
      const config: AxiosRequestConfig = {
        headers: getMultipartHeaders(data),
      };

      const res = await patchClient.patch(`/products/${id}`, data, config);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "UPDATE PRODUCT ERROR");
    }
  },

  async delete(id: string | number) {
    try {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "DELETE PRODUCT ERROR");
    }
  },

  async updateStatus(id: string | number, data: ProductStatusPayload) {
    const productId = String(id);
    const isActive =
      typeof data?.isActive === "boolean"
        ? data.isActive
        : String(data?.status || "").toLowerCase() === "active";

    const attempts = [
      { isActive },
      { status: isActive ? "Active" : "Inactive" },
      { isActive, status: isActive ? "Active" : "Inactive" },
      { active: isActive },
      { enabled: isActive },
    ];

    let lastError: unknown = null;

    for (const body of attempts) {
      try {
        const res = await apiClient.patch(`/products/${productId}/status`, body);
        return res.data;
      } catch (error) {
        lastError = error;
      }
    }

    handleAxiosError(lastError, "UPDATE PRODUCT STATUS ERROR");
  },

  async addImages(productId: string | number, data: FormData) {
    try {
      const res = await patchClient.post(`/products/${productId}/images`, data, {
        headers: getMultipartHeaders(data),
      });
      return res.data;
    } catch (error) {
      handleAxiosError(error, "ADD PRODUCT IMAGES ERROR");
    }
  },

  async deleteImage(productId: string | number, imageId: string) {
    try {
      const res = await patchClient.delete(
        `/products/${productId}/images/${imageId}`
      );
      return res.data;
    } catch (error) {
      handleAxiosError(error, "DELETE PRODUCT IMAGE ERROR");
    }
  },

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
    data: ProductRatingPayload
  ) {
    try {
      const res = await apiClient.post(`/products/${productId}/rating`, data);
      return res.data;
    } catch (error) {
      handleAxiosError(error, "SUBMIT PRODUCT RATING ERROR");
    }
  },
};