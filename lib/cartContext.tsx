"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Product = {
  id: number | string;   // ✅ supports both static (number) and API (string _id)
  name: string;
  image: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  price: number;
  quantity?: number;
  category?: string;
};

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  handleBag: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number | string, newQuantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const updateQuantity = (productId: number | string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item,
      ),
    );
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item,
        );
      }

      return [...prevCart, { ...product, quantity }];
    });
  };

  const handleBag = addToCart;

  const removeFromCart = (productId: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        handleBag,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
