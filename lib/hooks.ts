import useSWR from 'swr';
import { apiClient, fetcher } from './api';
import { Product, OrderResponse, ShippingAddress, PaymentMethod } from './types';

// Get cart items
export const useCart = () => {
  const { data, error, isLoading, mutate } = useSWR<Product[]>('/api/cart', fetcher);

  return {
    cart: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Get order summary
export const useOrderSummary = () => {
  const { data, error, isLoading } = useSWR('/api/order/summary', fetcher);

  return {
    summary: data,
    isLoading,
    isError: error,
  };
};

// Place order
export const placeOrder = async (
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  cardDetails?: any
): Promise<OrderResponse> => {
  const response = await apiClient.post('/api/order/place', {
    shippingAddress,
    paymentMethod,
    cardDetails,
  });
  return response.data;
};

// Get order status
export const useOrderStatus = (orderId: string | null) => {
  const { data, error, isLoading } = useSWR(
    orderId ? `/api/order/${orderId}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
    }
  );

  return {
    order: data as OrderResponse | undefined,
    isLoading,
    isError: error,
  };
};

// Apply promo code
export const applyPromoCode = async (code: string) => {
  const response = await apiClient.post('/api/promo/apply', { code });
  return response.data;
};

// Validate address
export const validateAddress = async (address: Partial<ShippingAddress>) => {
  const response = await apiClient.post('/api/address/validate', address);
  return response.data;
};
