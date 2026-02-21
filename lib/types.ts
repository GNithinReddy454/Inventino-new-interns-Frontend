// lib/types.ts

// --- USER & AUTH ---
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// --- PRODUCTS ---
export interface ProductImage {
  url: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  slug: string;
  images: ProductImage[];
  isActive?: boolean;
  quantity?: number; // Added for Cart compatibility
  color?: string;    // Added for UI compatibility
}

export interface ProductResponse {
  statusCode: number;
  message: string;
  data: {
    items: Product[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// --- ADDRESS ---
// Backend calls it "Address", Frontend Checkout calls it "ShippingAddress"
// We export both to satisfy both files.
export interface Address {
  _id?: string;
  fullName?: string;  // Backend expects fullName (optional on frontend)
  firstName?: string; // Frontend form uses these
  lastName?: string;
  email?: string;     // Frontend shipping form
  phone: string;
  street?: string;    // Backend (optional on frontend)
  streetAddress?: string; // Frontend
  city: string;
  state: string;
  pincode?: string;   // Backend (optional on frontend)
  zipCode?: string;   // Frontend
  country?: string;
  isDefault?: boolean;
}

// Alias Address as ShippingAddress so CheckoutFlow doesn't break
export type ShippingAddress = Address;

// --- CART ---
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartResponse {
  statusCode: number;
  message: string;
  data: {
    items: CartItem[];
    totalAmount: number;
  };
}

// --- ORDERS (Placeholder for CheckoutFlow) ---
export interface OrderResponse {
  status: 'success' | 'failed';
  orderId: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  transactionId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  courier?: string;
  errorCode?: string;
  errorMessage?: string;
  codMessage?: string;
}

// --- CHECKOUT ENUMS ---
export type CheckoutStep = 'shipping' | 'payment' | 'success' | 'failed' | 'tracking';
export type PaymentMethod = 'card' | 'cod' | 'paypal' | 'gpay';