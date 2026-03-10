"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem, fetchWishlist } from "@/redux/wishlistslice";

interface Product {
  mongoId?: string;
  _id?: string;
  id?: string;
  product?: {
    _id?: string;
  };
}

interface WishlistItem {
  product?: {
    _id?: string;
  };
  _id?: string;
}

interface StoreContextType {
  savedItems: WishlistItem[];
  handleSaved: (product: Product) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleSaved = (product: Product) => {
    const productId = product.mongoId || product._id || product.id;
    if (!productId) return;

    const exists = items.some((i: WishlistItem) =>
      (i.product?._id === productId) || (i._id === productId)
    );

    if (exists) {
      dispatch(removeWishlistItem(productId));
    } else {
      dispatch(addWishlistItem(productId));
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