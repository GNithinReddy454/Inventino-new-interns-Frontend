import apiClient from "@/lib/api";
import { Address, PaymentMethod } from "@/lib/types";

/**
 * Updated Order Service - Strictly follows Backend Team Documentation
 * 
 * Authorization: Bearer token is handled by apiClient interceptors
 */
export const orderService = {
  /**
   * 1. Place a new order
   * POST /api/orders
   * 
   * Backend expects: {
   *   addressId: string,
   *   items: Array<{ productId: string, quantity: number, color?: string, size?: string }>,
   *   payment: { method: string }
   * }
   */
  async placeOrder(payload: {
    addressId: string;
    items: Array<{
      productId: string;
      quantity: number;
      color?: string | null;
      size?: string;
    }>;
    payment: {
      method: string;
    };
  }) {
    const response = await apiClient.post("/orders", payload);
    return response.data;
  },

  // ... rest of your functions remain the same
  async getOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string) {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  async reorder(id: string) {
    const response = await apiClient.post(`/orders/${id}/reorder`);
    return response.data;
  },

  async trackOrder(id: string) {
    const response = await apiClient.get(`/orders/${id}/tracking`);
    return response.data;
  },

  async requestReturnExchange(id: string, payload: any) {
    const response = await apiClient.post(`/orders/${id}/request`, payload);
    return response.data;
  }
};