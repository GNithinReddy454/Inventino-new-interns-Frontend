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

export const adminProductService = {
  // ─── CREATE PRODUCT ─────────────────────────────────────
  async create(data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const res = await apiClient.post("/products", data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return res.data;
  },

  // ─── UPDATE PRODUCT ─────────────────────────────────────
  async update(id: string | number, data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const res = await patchClient.patch(`/products/${id}`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return res.data;
  },

  // ─── DELETE PRODUCT ─────────────────────────────────────
  async delete(id: string | number) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // ─── STATUS TOGGLE ──────────────────────────────────────
  async updateStatus(id: string | number, data: { isActive: boolean }) {
    const res = await patchClient.patch(`/products/${id}/status`, data);
    return res.data;
  },

  // ─── IMAGE MANAGEMENT ───────────────────────────────────
  async addImages(id: string | number, data: any) {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const res = await apiClient.post(`/products/${id}/images`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return res.data;
  },

  async deleteImage(productId: string | number, imageId: string) {
    const res = await apiClient.delete(
      `/products/${productId}/images/${imageId}`
    );
    return res.data;
  },
};