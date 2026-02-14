"use client";

import React, { createContext, useContext, useState } from "react";
import { Product } from "./products"; 

interface BagItem extends Product {
  quantity: number;
}

interface StoreContextType {
  bag: BagItem[];
  savedItems: Product[];
  handleBag: (item: Product, qty?: number) => void;
  handleSaved: (item: Product) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [bag, setBag] = useState<BagItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);

  const handleBag = (item: Product, qty: number = 1) => {
    setBag((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const handleSaved = (item: Product) => {
    setSavedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      return [...prev, item];
    });
  };

  return (
    <StoreContext.Provider value={{ bag, savedItems, handleBag, handleSaved }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};