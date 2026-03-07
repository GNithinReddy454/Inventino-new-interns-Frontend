import apiClient from "@/lib/api";
import { CartResponse } from "@/lib/types";

/**
 * Cart Service - All cart operations
 *
 * Handles:
 * - Getting cart items
 * - Adding products to cart
 * - Updating cart quantities
 * - Removing cart items
 * - Clearing entire cart
 */
export const cartService = {
  /**
   * Get all items in user's cart
   */
  async getCart(): Promise<CartResponse> {
    const response = await apiClient.get("/cart");
    return response.data;
  },

  /**
   * Add product to cart
   * @param productId - Product ID to add
   * @param quantity - Quantity (default: 1)
   */
  async addToCart(productId: string, quantity: number = 1) {
    const response = await apiClient.post("/cart", { productId, quantity });
    return response.data;
  },

  /**
   * Update cart item quantity
   * @param productId - Product ID in cart
   * @param quantity - New quantity
   */
  async updateCartQuantity(productId: string, quantity: number) {
    const response = await apiClient.put(`/cart/${productId}`, {
      quantity,
    });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param productId - Product ID to remove
   */
  async removeFromCart(productId: string) {
    const response = await apiClient.delete(`/cart/${productId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   */
  async clearCart() {
    const response = await apiClient.delete("/cart");
    return response.data;
  },

  /**
   * Apply coupon/promo code to cart
   * @param code - Promo code
   */
  async applyPromoCode(code: string) {
    const response = await apiClient.post("/cart/promo", { code });
    return response.data;
  },
};
