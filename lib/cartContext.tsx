"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 1. Define the Shape of the Context
type CartContextType = {
  cart: any[];
  handleBag: (product: any, quantity?: number) => void; // <--- This fixes the "Property does not exist" error
  removeFromCart: (productId: number) => void;
  cartTotal: number;
};

// 2. Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Create Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // --- THE MISSING FUNCTION ---
  const handleBag = (product: any, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    // Optional: Alert or Toast here
    console.log("Added to bag:", product.title);
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, handleBag, removeFromCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// 4. Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}