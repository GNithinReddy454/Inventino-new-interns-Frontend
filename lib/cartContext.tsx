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
  badge?: string | { text: string; color?: string };
  rating?: number;
  reviews?: number;
  price: number;
  quantity?: number;
  category?: string;
  color?: string;
  size?: string;
};

  type CartContextType = {
  cart: Product[];
  addToCart: (product: Product, quantity?: number, color?: string | null, size?: string | null) => void;
  handleBag: (product: Product, quantity?: number, color?: string | null, size?: string | null) => void;
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
    setTimeout(() => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
      setMounted(true);
    }, 0);
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

  const addToCart = (product: Product, quantity: number = 1, color?: string | null, size?: string | null) => {
    setCart((prevCart) => {
      const itemColor = color != null ? color : product.color;
      const itemSize = size != null ? size : product.size;

      const existingItem = prevCart.find((item) => 
        String(item.id) === String(product.id) && 
        item.color === itemColor && 
        item.size === itemSize
      );

      if (existingItem) {
        return prevCart.map((item) =>
          (String(item.id) === String(product.id) && item.color === itemColor && item.size === itemSize)
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item,
        );
      }

      return [...prevCart, { ...product, quantity, color: itemColor || undefined, size: itemSize || undefined }];
    });
  };

  const handleBag = addToCart;

  const removeFromCart = (productId: number | string) => {
    const idToCompare = String(productId);
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== idToCompare));
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
