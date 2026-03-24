import apiClient from "@/lib/api";
import { Address, PaymentMethod } from "@/lib/types";

/**
 * Updated Order Service - Supports both MongoDB IDs and custom order IDs (ORD-001)
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
    promoCode?: string | null;
    code?: string | null;
    promo_code?: string | null;
    discount?: number;
    subtotal?: number;
    total?: number;
    payment: {
      method: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
  }) {
    const response = await apiClient.post("/orders", payload);
    return response.data;
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) {
    const response = await apiClient.post("/payments/verify", payload);
    return response.data;
  },

  async getOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async getOrderById(id: string) {
    // The backend will handle both types of IDs
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async cancelOrder(id: string) {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async reorder(id: string) {
    const response = await apiClient.post(`/orders/${id}/reorder`);
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async trackOrder(id: string) {
    const response = await apiClient.get(`/orders/${id}/tracking`);
    return response.data;
  },

  // UPDATED: Now accepts both MongoDB ID and custom order ID (ORD-001)
  async requestReturnExchange(id: string, payload: any) {
    const response = await apiClient.post(`/orders/${id}/request`, payload);
    return response.data;
  },

  // Helper function to determine if ID is MongoDB ID or custom ID
  isMongoDBId(id: string): boolean {
    // MongoDB IDs are 24 character hex strings
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  isCustomOrderId(id: string): boolean {
    // Custom order IDs like ORD-001, ORD-002
    return /^ORD-\d{3}$/i.test(id);
  }
};