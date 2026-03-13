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
   * POST /orders
   */
  async placeOrder(payload: {
    addressId: string;
    paymentMethod: string;
  }) {
    const response = await apiClient.post("/orders", payload);
    return response.data;
  },

  /**
   * 2. Get my orders
   * GET /orders
   */
  async getOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  /**
   * 3. Get order by id
   * GET /orders/:id
   */
  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * 4. Update order status (Admin)
   * PUT /orders/:id/status
   */
  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * 5. Cancel order
   * PATCH /orders/:id/cancel
   */
  async cancelOrder(id: string) {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * 6. Reorder
   * POST /orders/:id/reorder
   */
  async reorder(id: string) {
    const response = await apiClient.post(`/orders/${id}/reorder`);
    return response.data;
  },

  /**
   * 7. Tracking order
   * GET /orders/:id/tracking
   */
  async trackOrder(id: string) {
    const response = await apiClient.get(`/orders/${id}/tracking`);
    return response.data;
  },

  /**
   * 8. Return order
   * POST /orders/:id/returns
   */
  async returnOrder(id: string, payload: {
    reason: string;
    items: Array<{ productId: string; quantity: number }>;
    resolution: string;
  }) {
    const response = await apiClient.post(`/orders/${id}/returns`, payload);
    return response.data;
  },

  /**
   * 9. Exchange order
   * POST /orders/:id/exchanges
   */
  async exchangeOrder(id: string, payload: {
    productId: string;
    quantity: number;
    reasonForExchange: string;
    condition: string;
    exchangeDetails: {
      newSize?: string | null;
      newColor?: string | null;
      newProductId?: string | null;
    };
    comments?: string;
  }) {
    const response = await apiClient.post(`/orders/${id}/exchanges`, payload);
    return response.data;
  }
};