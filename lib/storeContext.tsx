"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem, fetchWishlist } from "@/redux/wishlistslice";

// shape of whatever the calling code passes when toggling a wishlist item
// allow both strings and numbers since some pages use numeric ids
interface WishlistProduct {
  mongoId?: string | number;
  _id?: string | number;
  id?: string | number;
  product?: {
    _id?: string | number;
  };
  color?: string | null;
  size?: string | null;
  name?: string;
  price?: number;
  image?: string;
  images?: string[];
}

interface WishlistItem {
  product?: {
    _id?: string;
  };
  _id?: string;
  color?: string | null;
  size?: string | null;
  quantity?: number; // Add quantity to WishlistItem interface
}

interface StoreContextType {
  savedItems: WishlistItem[];
  handleSaved: (product: WishlistProduct, color?: string | null, size?: string | null, quantity?: number) => void; // Add quantity parameter
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    // Admin users don't have wishlists — skip the fetch to avoid
    // hitting the user-only /wishlist endpoint with an admin token.
    try {
      const stored = localStorage.getItem("inventino_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.permissions)) return;
      }
    } catch { /* ignore parse errors */ }
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleSaved = (product: WishlistProduct, color?: string | null, size?: string | null, quantity: number = 1) => { // Add quantity parameter with default 1
    const productIdRaw = product.mongoId || product._id || product.id;
    if (!productIdRaw) return;
    const productId = String(productIdRaw);

    // Check if exists with same color and size combination
    const exists = items.some((i: WishlistItem) => 
      (i.product?._id === productId || i._id === productId) && 
      i.color === color && 
      i.size === size
    );

    if (exists) {
      dispatch(removeWishlistItem(productId));
    } else {
      // Pass full product data so guest localStorage has name, price, image for display
      dispatch(addWishlistItem({
        productId,
        color,
        size,
        quantity,
        name: product.name || "",
        price: product.price || 0,
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ""),
      }));
    }
  };

  return (
    <StoreContext.Provider value={{ savedItems: items, handleSaved }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};