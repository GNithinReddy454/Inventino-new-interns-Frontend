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
    user?: User;
    admin?: User;
    token: string;
  };
  error?: string | null;
}

// Generic API response for endpoints that return no data or other data
export interface ApiResponse<T = null> {
  statusCode: number;
  message: string;
  data: T;
  error: string | null;
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
  quantity?: number;
  color?: string;
  size?: string;
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
export interface Address {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  street?: string;
  streetAddress?: string;
  city: string;
  state: string;
  pincode?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export type ShippingAddress = Address;

// --- CART ---
export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
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
  status: "success" | "failed";
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
export type CheckoutStep = "shipping" | "payment" | "review" | "success" | "failed" | "tracking";
export type PaymentMethod = "card" | "cod" | "paypal" | "gpay";