import apiClient from "@/lib/api";
import { Address, OrderResponse, PaymentMethod } from "@/lib/types";

/**
 * Order Service - All order operations
 *
 * Base URL is already: http://localhost:8080/api
 * So all paths here start with /orders (no /api prefix)
 */
export const orderService = {
  /**
   * Place a new order
   * Formats address and handles payment processing
   */
  async placeOrder(
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
    cardDetails?: any,
  ): Promise<OrderResponse> {
    const formattedAddress = {
      fullName:
        shippingAddress.fullName ||
        `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      phone: shippingAddress.phone,
      street: shippingAddress.street || shippingAddress.streetAddress,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode || shippingAddress.zipCode,
      country: shippingAddress.country || "India",
      isDefault: true,
    };

    try {
      const response = await apiClient.post("/orders", {
        shippingAddress: formattedAddress,
        paymentMethod,
        cardDetails,
      });

      return {
        status: "success",
        orderId: response.data?.data?._id || "ORD-NEW",
        orderNumber: response.data?.data?.orderId || "INV-001",
        orderDate: new Date().toISOString(),
        totalAmount: response.data?.data?.totalAmount || 0,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        estimatedDelivery: "5-7 Days",
      };
    } catch (error: any) {
      console.error("Order placement failed:", error.response?.data);
      return {
        status: "failed",
        orderId: "",
        orderNumber: "",
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        errorCode: error.response?.status?.toString() || "500",
        errorMessage:
          error.response?.data?.message || "Failed to connect to backend",
      };
    }
  },

  /**
   * Get user's order history
   * GET http://localhost:8080/api/orders
   */
  async getOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  /**
   * Get single order details
   * GET http://localhost:8080/api/orders/:id
   */
  async getOrderDetails(orderId: string) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order
   * PATCH http://localhost:8080/api/orders/:id/cancel
   */
  async cancelOrder(orderId: string, reason?: string) {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  /**
   * Track order status
   * GET http://localhost:8080/api/orders/:id/tracking
   */
  async trackOrder(orderId: string) {
    const response = await apiClient.get(`/orders/${orderId}/tracking`);
    return response.data;
  },

  /**
   * Get order summary (subtotal, tax, shipping, etc.)
   * GET http://localhost:8080/api/orders/summary
   */
  async getOrderSummary() {
    const response = await apiClient.get("/orders/summary");
    return response.data;
  },

  /**
   * Apply coupon/discount to order
   * POST http://localhost:8080/api/orders/discount
   */
  async applyDiscount(discountCode: string) {
    const response = await apiClient.post("/orders/discount", {
      code: discountCode,
    });
    return response.data;
  },

  /**
   * Get return/refund history
   * GET http://localhost:8080/api/orders/returns
   */
  async getReturns() {
    const response = await apiClient.get("/orders/returns");
    return response.data;
  },

  /**
   * Request return for order item
   * POST http://localhost:8080/api/orders/:id/returns
   */
  async requestReturn(orderId: string, itemId: string, reason?: string) {
    const response = await apiClient.post(`/orders/${orderId}/returns`, {
      itemId,
      reason,
    });
    return response.data;
  },
};