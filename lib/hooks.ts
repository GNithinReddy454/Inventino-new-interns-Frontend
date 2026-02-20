import useSWR from 'swr';
import { apiClient, fetcher } from './api';
import { ProductResponse, CartResponse, Address, OrderResponse, PaymentMethod } from './types';
import { console } from 'inspector';

// --- PRODUCTS ---
export const useProducts = () => {
  const { data, error, isLoading } = useSWR<ProductResponse>('/api/products', fetcher);
  return {
    products: data?.data?.items || [],
    meta: data?.data?.meta,
    isLoading,
    isError: error,
  };
};

export const useProduct = (id: string) => {
  const { data, error, isLoading } = useSWR(id ? `/api/products/${id}` : null, fetcher);
  return {
    product: data?.data,
    isLoading,
    isError: error,
  };
};

// --- CART ---
export const useCart = () => {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>('/api/cart', fetcher, {
    shouldRetryOnError: false 
  });

  return {
    cartItems: data?.data?.items || [],
    cartTotal: data?.data?.totalAmount || 0,
    isLoading,
    isError: error,
    mutate,
  };
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  try {
    const res = await apiClient.post('/api/cart', { productId, quantity });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartQuantity = async (productId: string, quantity: number) => {
  try {
    const res = await apiClient.put(`/api/cart/${productId}`, { quantity });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (productId: string) => {
  try {
    const res = await apiClient.delete(`/api/cart/${productId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// --- ADDRESSES ---
export const useAddresses = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/addresses', fetcher);
  return {
    addresses: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};

// --- AUTH ---
export const loginUser = async (credentials: any) => {
  const res = await apiClient.post('/api/auth/login', credentials);
  if (res.data?.data?.token) {
    localStorage.setItem('token', res.data.data.token);
  }
  return res.data;
};

export const registerUser = async (userData: any) => {
  const res = await apiClient.post('/api/auth/register', userData);
  if (res.data?.data?.token) {
    localStorage.setItem('token', res.data.data.token);
  }
  return res.data;
};

// --- ORDERS ---
export const placeOrder = async (
  shippingAddress: Address,
  paymentMethod: PaymentMethod,
  cardDetails?: any
): Promise<OrderResponse> => {
  
  const formattedAddress = {
    fullName: shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
    phone: shippingAddress.phone,
    street: shippingAddress.street || shippingAddress.streetAddress,
    city: shippingAddress.city,
    state: shippingAddress.state,
    pincode: shippingAddress.pincode || shippingAddress.zipCode,
    country: shippingAddress.country || 'India',
    isDefault: true
  };

  try {
    const res = await apiClient.post('/api/orders', {
      shippingAddress: formattedAddress,
      paymentMethod,
      cardDetails
    });

    return {
      status: 'success',
      orderId: res.data?.data?._id || 'ORD-NEW',
      orderNumber: res.data?.data?.orderId || 'INV-001',
      orderDate: new Date().toISOString(),
      totalAmount: res.data?.data?.totalAmount || 0,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      estimatedDelivery: '5-7 Days'
    };
  } catch (error: any) {
    console.error("Order Failed:", error.response?.data);
    return {
      status: 'failed',
      orderId: '',
      orderNumber: '',
      orderDate: new Date().toISOString(),
      totalAmount: 0,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      errorCode: error.response?.status?.toString() || '500',
      errorMessage: error.response?.data?.message || 'Failed to connect to backend'
    };
  }
};

// --- ORDER SUMMARY (Calculated on Frontend for now) ---
export const useOrderSummary = () => {
  const { cartTotal, isLoading } = useCart();

  // Logic: Free shipping if total > 500, else 50. Tax 18%.
  const shipping = cartTotal > 500 ? 0 : 50;
  const tax = cartTotal * 0.18;
  const discount = 0;
  const total = cartTotal + shipping + tax - discount;

  return {
    summary: {
      subtotal: cartTotal,
      shipping,
      tax,
      discount,
      total
    },
    isLoading
  };
};

// --- PROMO CODE (Mock Implementation) ---
export const applyPromoCode = async (code: string) => {
  // Simulate API delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code.toUpperCase() === 'SAVE10') {
        resolve({ success: true, discount: 10 });
      } else {
        reject(new Error('Invalid Promo Code'));
      }
    }, 1000);
  });
};