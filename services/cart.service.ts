import apiClient from "@/lib/api";
import { CartResponse } from "@/lib/types";

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await apiClient.get("/cart");
    return response.data;
  },

  async addToCart(productId: string, quantity: number = 1, color?: string | null, size?: string | null) {
    const response = await apiClient.post("/cart", { 
      productId, 
      quantity,
      color: color || null,
      size: size || null
    });
    return response.data;
  },

  async updateCartQuantity(productId: string, quantity: number) {
    const response = await apiClient.put(`/cart/${productId}`, {
      quantity,
    });
    return response.data;
  },

  async removeFromCart(productId: string) {
    const response = await apiClient.delete(`/cart/${productId}`);
    return response.data;
  },

  async clearCart() {
    const response = await apiClient.delete("/cart");
    return response.data;
  },

  async applyPromoCode(code: string) {
    const response = await apiClient.post("/cart/promo", { code });
    return response.data;
  },
};