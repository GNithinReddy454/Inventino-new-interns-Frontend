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

  // 3. Get Order By ID (Custom ORD-072 or Mongo _id)
  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // 4. Track Order (History / Timeline)
  async trackOrder(id: string) {
    const response = await apiClient.get(`/orders/${id}/tracking`);
    return response.data;
  },

  // 5, 6, 7. Cancel Specific Item(s)
  // PATCH /api/orders/ORD-072/cancel-items
  async cancelItems(id: string, payload: {
    items: Array<{ productId: string, action: 'cancel' | 'replace', replacementProductId?: string }>,
    reason: string
  }) {
    const response = await apiClient.patch(`/orders/${id}/cancel-items`, payload);
    return response.data;
  },

  // 8. Cancel Whole Order (Bulk)
  // PATCH /api/orders/ORD-075/cancel
  async cancelOrder(id: string, reason?: string) {
    const response = await apiClient.patch(`/orders/${id}/cancel`, { reason: reason || "User requested cancellation" });
    return response.data;
  },

  // 9. Reorder
  // POST /api/orders/ORD-072/reorder
  async reorder(id: string) {
    const response = await apiClient.post(`/orders/${id}/reorder`);
    return response.data;
  },

  // 10, 11. Return Item(s)
  // POST /api/orders/ORD-072/returns
  async requestReturn(id: string, payload: {
    items?: Array<{ productId: string, action: 'return' }>,
    reason: string
  }) {
    const response = await apiClient.post(`/orders/${id}/returns`, payload);
    return response.data;
  },

  // 12. Exchange Request
  // POST /api/orders/ORD-072/exchanges
  async requestExchange(id: string, payload: {
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
    proofImages?: string[];
  }) {
    const response = await apiClient.post(`/orders/${id}/exchanges`, payload);
    return response.data;
  },

  // Helper functions
  isMongoDBId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  isCustomOrderId(id: string): boolean {
    return /^ORD-\d{3}$/i.test(id);
  }
};