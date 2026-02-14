export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  transactionId: string;
  paymentMethod: string;
  totalAmount: number;
  status: 'success' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  courier?: string;
  codMessage?: string;
}

export type PaymentMethod = 'card' | 'paypal' | 'gpay' | 'cod';

export type CheckoutStep = 'shipping' | 'payment' | 'success' | 'failed' | 'tracking';
