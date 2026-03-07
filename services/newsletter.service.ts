import apiClient from "@/lib/api";

export interface SubscribeResponse {
  statusCode: number;
  message: string;
  data: {
    subscriber: {
      _id: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  error: null | string;
}

export const newsletterService = {
  async subscribe(email: string): Promise<SubscribeResponse> {
    const response = await apiClient.post<SubscribeResponse>("/subscribe", { email });
    return response.data;
  },
};