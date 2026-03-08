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
  async cancelOrder(orderId: string) {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Track order status
   * GET http://localhost:8080/api/orders/:id/tracking
   */
  async trackOrder(orderId: string) {
    const response = await apiClient.get(`/orders/tracking/${orderId}`);
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
   * Get return history
   * GET http://localhost:8080/api/orders/returns
   */
  async getReturns() {
    const response = await apiClient.get("/orders/returns");
    return response.data;
  },

  /**
   * Get exchange history
   * GET http://localhost:8080/api/orders/exchanges
   */
  async getExchanges() {
    const response = await apiClient.get("/orders/exchanges");
    return response.data;
  },

  /**
   * Request return for a delivered order
   * POST http://localhost:8080/api/orders/:id/returns
   * :id      → orderId (from URL params, e.g. "ORD-004")
   * productId → the actual product's ID (from order item)
   * Body: { reason, items: [{ productId, quantity }], resolution }
   */
  async requestReturn(
    orderId: string,
    payload: {
      reason: string;
      items: { productId: string; quantity: number }[];
      resolution: "refund" | "store_credit";
    },
  ) {
    const response = await apiClient.post(`/orders/${orderId}/returns`, payload);
    return response.data;
  },

  /**
   * Request exchange for a delivered order
   * POST http://localhost:8080/api/orders/:id/exchanges
   * :id      → orderId (from URL params, e.g. "ORD-004")
   * productId → the actual product's ID (from order item)
   * Body: { productId, quantity, reasonForExchange, condition, exchangeDetails, comments }
   */
  async requestExchange(
    orderId: string,
    payload: {
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
    },
  ) {
    const response = await apiClient.post(`/orders/${orderId}/exchanges`, payload);
    return response.data;
  },
};