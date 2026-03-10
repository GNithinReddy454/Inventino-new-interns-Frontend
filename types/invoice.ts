export type BillingDetails = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
};

export type ShippingDetails = {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
};

export type InvoiceItem = {
  id: string;
  name: string;
  sku: string;
  variant: string;
  price: number;
  quantity: number;
};

export type InvoiceData = {
  orderId: string;
  date: string;
  paymentMethod: string;
  billingDetails: BillingDetails;
  shippingDetails: ShippingDetails;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
};

export type MockInvoiceData = Record<string, InvoiceData>;