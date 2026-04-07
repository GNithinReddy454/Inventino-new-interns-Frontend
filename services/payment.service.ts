import apiClient from "@/lib/api";

export interface PaymentMethod {
  id: string;
  brand: string;
  cardNumber: string;      // Changed from last4 to match backend response
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
  gateway: string;
}

export interface AddPaymentMethodPayload {
  paymentToken: string;      // test token (e.g., "tok_stripe_1739564880")
  customerId: string;        // required by backend
  brand: string;
  last4: string;             // We still send last4 when adding
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault?: boolean;
  gateway: string;           // e.g., "stripe"
}

export const paymentService = {
  async getAll(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<{
      statusCode: number;
      data: PaymentMethod[];
    }>("/payment-methods");
    return response.data.data;
  },

  async add(payload: AddPaymentMethodPayload): Promise<PaymentMethod> {
    const response = await apiClient.post<{
      statusCode: number;
      data: PaymentMethod;
    }>("/payment-methods", payload);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/payment-methods/${id}`);
  },

  async setDefault(id: string): Promise<PaymentMethod> {
    const response = await apiClient.put<{
      statusCode: number;
      data: PaymentMethod;
    }>(`/payment-methods/${id}/set-default`);
    return response.data.data;
  },
};
