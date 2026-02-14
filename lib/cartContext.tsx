// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// type Product = {
//   id: number;
//   name: string;
//   image: string;
//   badge: string;
//   rating: number;
//   reviews: number;
//   price: number;
//   quantity?: number;
// };

// type CartContextType = {
//   cart: Product[];
//   addToCart: (product: Product, quantity?: number) => void;
//   removeFromCart: (productId: number) => void;
//   cartTotal: number;
// };

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState<Product[]>([]);

//   useEffect(() => {
//     const savedCart = localStorage.getItem("cart");
//     if (savedCart) {
//       setCart(JSON.parse(savedCart));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = (product: Product, quantity: number = 1) => {
//     setCart((prevCart) => {
//       const existingItem = prevCart.find(
//         (item) => item.id === product.id
//       );

//       if (existingItem) {
//         return prevCart.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: (item.quantity || 1) + quantity }
//             : item
//         );
//       }

//       return [...prevCart, { ...product, quantity }];
//     });
//   };

//   const removeFromCart = (productId: number) => {
//     setCart((prevCart) =>
//       prevCart.filter((item) => item.id !== productId)
//     );
//   };

//   const cartTotal = cart.reduce(
//     (total, item) => total + item.price * (item.quantity || 1),
//     0
//   );

//   return (
//     <CartContext.Provider
//       value={{ cart, addToCart, removeFromCart, cartTotal }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// }

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Defines the structure of a Product in the cart
export type Product = {
  id: number;
  name: string;
  image: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  price: number;
  quantity?: number;
  category?: string; // Added to support category logic if needed
};

// Defines what functions/data are available globally
type CartContextType = {
  cart: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  handleBag: (product: Product, quantity?: number) => void; // <--- ADDED THIS ALIAS
  removeFromCart: (productId: number) => void;
  cartTotal: number;
  handleSaved?: (product: Product) => void; // Optional placeholders to prevent strict type errors
  savedItems?: Product[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);

  // Load from LocalStorage on start
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Main Add Function
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      }

      return [...prevCart, { ...product, quantity }];
    });
  };

  // --- THE FIX: Alias handleBag to addToCart ---
  const handleBag = addToCart; 

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        handleBag, // <--- Passing the alias here
        removeFromCart, 
        cartTotal 
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