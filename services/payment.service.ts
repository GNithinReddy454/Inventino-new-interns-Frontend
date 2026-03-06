import apiClient from "@/lib/api";

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
  gateway: string;
}

export interface AddPaymentMethodPayload {
  paymentToken: string;      // test token (e.g., "tok_stripe_1739564880")
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault?: boolean;
  gateway: string;           // e.g., "stripe" or "test"
}

export const paymentService = {
  // GET /payment-methods (no /api prefix)
  async getAll(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<{
      statusCode: number;
      data: PaymentMethod[];
    }>("/payment-methods");
    return response.data.data;
  },

  // POST /payment-methods
  async add(payload: AddPaymentMethodPayload): Promise<PaymentMethod> {
    const response = await apiClient.post<{
      statusCode: number;
      data: PaymentMethod;
    }>("/payment-methods", payload);
    return response.data.data;
  },

  // DELETE /payment-methods/:id
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/payment-methods/${id}`);
  },

  // PUT /payment-methods/:id/set-default
  async setDefault(id: string): Promise<PaymentMethod> {
    const response = await apiClient.put<{
      statusCode: number;
      data: PaymentMethod;
    }>(`/payment-methods/${id}/set-default`);
    return response.data.data;
  },
};