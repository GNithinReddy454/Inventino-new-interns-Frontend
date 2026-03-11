export type OrderItem = {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice: number;
    images: Array<{ url: string }>;
  };
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type Payment = {
  method: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
};

export type Pricing = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
};

export type OrderData = {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: Payment;
  pricing: Pricing;
  createdAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
};

export type StatusStyle = {
  color: string;
  background: string;
  dot: string;
  label: string;
};

export const statusColors: Record<string, StatusStyle> = {
  delivered:  { color: "#059669", background: "#ecfdf5", dot: "#10b981", label: "Delivered" },
  shipped:    { color: "#1d4ed8", background: "#eff6ff", dot: "#3b82f6", label: "Shipped" },
  processing: { color: "#c2410c", background: "#fff7ed", dot: "#f97316", label: "Processing" },
  created:    { color: "#c2410c", background: "#fff7ed", dot: "#f97316", label: "Processing" },
  cancelled:  { color: "#6b7280", background: "#f3f4f6", dot: "#9ca3af", label: "Cancelled" },
};