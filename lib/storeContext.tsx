"use client";

import React, { createContext, useContext, useState } from "react";
import { Product } from "./products";

interface StoreContextType {
  savedItems: Product[];
  handleSaved: (item: Product) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [savedItems, setSavedItems] = useState<Product[]>([]);

  const handleSaved = (item: Product) => {
    setSavedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      return [...prev, item];
    });
  };

  return (
    <StoreContext.Provider value={{ savedItems, handleSaved }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
