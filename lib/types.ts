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
  quantity?: number; // UI helper
  color?: string;    // UI helper
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
// We export 'Address' AND 'ShippingAddress' to satisfy both Backend and Frontend files
export interface Address {
  _id?: string;
  fullName: string;
  firstName?: string; // UI uses this
  lastName?: string;  // UI uses this
  phone: string;
  street: string;
  streetAddress?: string; // UI uses this
  city: string;
  state: string;
  pincode: string;
  zipCode?: string;   // UI uses this
  country?: string;
  isDefault?: boolean;
}

export type ShippingAddress = Address; // Alias so CheckoutFlow doesn't break

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

// --- ORDERS ---
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