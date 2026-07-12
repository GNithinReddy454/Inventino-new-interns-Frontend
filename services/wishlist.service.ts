import apiClient from "@/lib/api";

export const wishlistService = {
    // GET: Fetch wishlist
    getWishlist: async () => {
        const response = await apiClient.get("/wishlist");
        return response.data;
    },

    // POST: Create / Add to wishlist
    addToWishlist: async (productId: string, color?: string | null, size?: string | null, quantity: number = 1) => {
        const response = await apiClient.post("/wishlist", { 
            productId,
            color: color || null,
            size: size || null,
            quantity // Add quantity to the payload
        });
        return response.data;
    },

    // DELETE: Remove specific item by productId
    removeFromWishlist: async (productId: string) => {
        const response = await apiClient.delete(`/wishlist/${productId}`);
        return response.data;
    },

    // DELETE: Clear all items
    clearWishlist: async () => {
        const response = await apiClient.delete("/wishlist");
        return response.data;
    }
};