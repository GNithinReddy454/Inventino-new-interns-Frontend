
"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem, fetchWishlist } from "@/redux/wishlistslice";

interface StoreContextType {
  savedItems: any[];
  handleSaved: (product: any) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  // Get items from Redux instead of local state
  const { items } = useAppSelector((state) => state.wishlist);

  // Fetch wishlist on load to keep sync
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleSaved = (product: any) => {
    // Check if item exists in the Redux wishlist
    // Backend usually returns item.product._id, check both levels
    const productId = product.mongoId || product._id || product.id;
    
    const exists = items.some((i: any) => 
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