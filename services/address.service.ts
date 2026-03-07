import apiClient from "@/lib/api";
import { Address } from "@/lib/types";

/**
 * Address Service - All address operations
 *
 * Handles:
 * - Getting user addresses
 * - Adding new addresses
 * - Updating addresses
 * - Deleting addresses
 * - Setting default address
 */
export const addressService = {
  /**
   * Get all user addresses
   */
  async getAddresses() {
    const response = await apiClient.get("/addresses");
    return response.data;
  },

  /**
   * Get single address by ID
   */
  async getAddressById(id: string) {
    const response = await apiClient.get(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Add new address
   */
  async addAddress(addressData: Partial<Address>) {
    const response = await apiClient.post("/addresses", addressData);
    return response.data;
  },

  /**
   * Update existing address
   */
  async updateAddress(id: string, addressData: Partial<Address>) {
    const response = await apiClient.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   */
  async deleteAddress(id: string) {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string) {
    const response = await apiClient.patch(`/addresses/${id}/set-default`);
    return response.data;
  },

  /**
   * Get default address
   */
  async getDefaultAddress() {
    const response = await apiClient.get("/addresses/default");
    return response.data;
  },

  /**
   * Validate address
   */
  async validateAddress(addressData: Partial<Address>) {
    const response = await apiClient.post(
      "/addresses/validate",
      addressData,
    );
    return response.data;
  },
};
