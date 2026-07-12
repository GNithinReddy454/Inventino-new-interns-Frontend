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
        promoCode?: string | null;
        code?: string | null;
        promo_code?: string | null;
        discount?: number;
        subtotal?: number;
        total?: number;
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await orderService.placeOrder({
                addressId: payload.addressId,
                items: payload.items,
                promoCode: payload.promoCode,
                code: payload.code,
                promo_code: payload.promo_code,
                discount: payload.discount,
                subtotal: payload.subtotal,
                total: payload.total,
                payment: { 
                    method: payload.paymentMethod,
                    razorpay_order_id: payload.razorpay_order_id,
                    razorpay_payment_id: payload.razorpay_payment_id,
                    razorpay_signature: payload.razorpay_signature,
                },
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
            const response = await orderService.requestReturn(payload.id, payload.data);
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
            const response = await orderService.requestExchange(payload.id, payload.data);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Exchange request failed";
            return rejectWithValue(errorMsg);
        }
    }
);

/**
 * Thunk to cancel specific items in an order
 */
export const cancelItemsAction = createAsyncThunk(
    "order/cancelItems",
    async (payload: { id: string; data: { items: any[], reason: string } }, { rejectWithValue }) => {
        try {
            const response = await orderService.cancelItems(payload.id, payload.data);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Item cancellation failed";
            return rejectWithValue(errorMsg);
        }
    }
);

/**
 * Thunk to cancel whole order
 */
export const cancelWholeOrderAction = createAsyncThunk(
    "order/cancelWhole",
    async (payload: { id: string; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await orderService.cancelOrder(payload.id, payload.reason);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Order cancellation failed";
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
            })
            // Cancel Items
            .addCase(cancelItemsAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(cancelItemsAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.lastOrderResponse = action.payload;
            })
            .addCase(cancelItemsAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Cancel Whole Order
            .addCase(cancelWholeOrderAction.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(cancelWholeOrderAction.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.lastOrderResponse = action.payload;
            })
            .addCase(cancelWholeOrderAction.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
