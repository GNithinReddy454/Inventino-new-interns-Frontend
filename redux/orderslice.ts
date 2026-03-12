import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/services/order.service";

export interface OrderState {
    isLoading: boolean;
    error: string | null;
    lastOrderResponse: any | null;
}

const initialState: OrderState = {
    isLoading: false,
    error: null,
    lastOrderResponse: null,
};

/**
 * Thunk to place an order
 * Payload: { addressId: string, paymentMethod: string }
 */
export const placeOrderAction = createAsyncThunk(
    "order/placeOrder",
    async (payload: { addressId: string; paymentMethod: string }, { rejectWithValue }) => {
        try {
            const response = await orderService.placeOrder(payload);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Order placement failed";
            return rejectWithValue(errorMsg);
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        resetOrderState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.lastOrderResponse = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(placeOrderAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(placeOrderAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.lastOrderResponse = action.payload;
            })
            .addCase(placeOrderAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
