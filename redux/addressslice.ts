import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressService } from "@/services/address.service";
import type { SavedAddress } from "@/types/address";

interface AddressState {
  addresses: SavedAddress[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  isLoading: false,
  error: null,
};

export const fetchAddressesAction = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getAddresses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
    }
  }
);

export const addAddressAction = createAsyncThunk(
  "address/addAddress",
  async (addressData: any, { rejectWithValue }) => {
    try {
      const response = await addressService.addAddress(addressData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressesAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddressesAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddressesAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addAddressAction.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      });
  },
});

export default addressSlice.reducer;
