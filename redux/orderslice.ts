import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/services/order.service";

export interface OrderState {
    isLoading: boolean;
    error: string | null;
    lastOrderResponse: any | null;
    currentOrder: any | null;
    returnResponse: any | null;
    exchangeResponse: any | null;
}

const initialState: OrderState = {
    isLoading: false,
    error: null,
    lastOrderResponse: null,
    currentOrder: null,
    returnResponse: null,
    exchangeResponse: null,
};

/**
 * Thunk to place an order
 */
export const placeOrderAction = createAsyncThunk(
    "order/placeOrder",
    async (payload: {
        addressId: string;
        items: Array<{ productId: string; quantity: number; color?: string | null; size?: string }>;
        paymentMethod: string;
    }, { rejectWithValue }) => {
        try {
            const response = await orderService.placeOrder({
                addressId: payload.addressId,
                items: payload.items,
                payment: { method: payload.paymentMethod },
            });
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Order placement failed";
            return rejectWithValue(errorMsg);
        }
    }
);

/**
 * Thunk to fetch order by ID
 */
export const fetchOrderByIdAction = createAsyncThunk(
    "order/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(id);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch order details";
            return rejectWithValue(errorMsg);
        }
    }
);

/**
 * Thunk to return an order
 */
export const returnOrderAction = createAsyncThunk(
    "order/return",
    async (payload: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await orderService.requestReturnExchange(payload.id, payload.data);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Return request failed";
            return rejectWithValue(errorMsg);
        }
    }
);

/**
 * Thunk to exchange an order
 */
export const exchangeOrderAction = createAsyncThunk(
    "order/exchange",
    async (payload: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await orderService.requestReturnExchange(payload.id, payload.data);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Exchange request failed";
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
            state.currentOrder = null;
            state.returnResponse = null;
            state.exchangeResponse = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Place Order
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
            })
            // Fetch Order by ID
            .addCase(fetchOrderByIdAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderByIdAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.currentOrder = action.payload.data || action.payload;
            })
            .addCase(fetchOrderByIdAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Return Order
            .addCase(returnOrderAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(returnOrderAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.returnResponse = action.payload;
            })
            .addCase(returnOrderAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Exchange Order
            .addCase(exchangeOrderAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(exchangeOrderAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.exchangeResponse = action.payload;
            })
            .addCase(exchangeOrderAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
