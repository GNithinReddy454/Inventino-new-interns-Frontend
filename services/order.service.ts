import apiClient from "@/lib/api";
import { Address, OrderResponse, PaymentMethod } from "@/lib/types";

/**
 * Order Service - All order operations
 *
 * Handles:
 * - Placing orders
 * - Getting order history
 * - Getting order details
 * - Cancelling orders
 * - Tracking orders
 * - Order summary calculations
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
   */
  async getOrders() {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  /**
   * Get single order details
   */
  async getOrderDetails(orderId: string) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string) {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  /**
   * Track order status
   */
  async trackOrder(orderId: string) {
    const response = await apiClient.get(`/orders/${orderId}/tracking`);
    return response.data;
  },

  /**
   * Get order summary (subtotal, tax, shipping, etc.)
   * Called before placing order to show final amounts
   */
  async getOrderSummary() {
    const response = await apiClient.get("/orders/summary");
    return response.data;
  },

  /**
   * Apply coupon/discount to order
   */
  async applyDiscount(discountCode: string) {
    const response = await apiClient.post("/orders/discount", {
      code: discountCode,
    });
    return response.data;
  },

  /**
   * Get return/refund history
   */
  async getReturns() {
    const response = await apiClient.get("/orders/returns");
    return response.data;
  },

  /**
   * Request return for order item
   */
  async requestReturn(orderId: string, itemId: string, reason?: string) {
    const response = await apiClient.post(`/orders/${orderId}/returns`, {
      itemId,
      reason,
    });
    return response.data;
  },
};
