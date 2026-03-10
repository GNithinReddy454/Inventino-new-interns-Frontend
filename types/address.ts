export interface SavedAddress {
  _id: string;
  addressType: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
  isDefault: boolean;
}

export type AddressType = "Home" | "Office" | "Other";

export interface AddressFormData {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string;
}
