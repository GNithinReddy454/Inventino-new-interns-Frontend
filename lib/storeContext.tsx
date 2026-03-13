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
}

interface WishlistItem {
  product?: {
    _id?: string;
  };
  _id?: string;
  color?: string | null;
  size?: string | null;
}

interface StoreContextType {
  savedItems: WishlistItem[];
  handleSaved: (product: WishlistProduct, color?: string | null, size?: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleSaved = (product: WishlistProduct, color?: string | null, size?: string | null) => {
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
      dispatch(addWishlistItem({ productId, color, size }));
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