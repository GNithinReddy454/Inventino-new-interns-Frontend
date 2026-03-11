import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "@/services/cart.service";

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CartState {
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
    isLoading: boolean;
    error: string | null;
    promoCode: string | null;
    discount: number;
    originalTotal: number;
}

const initialState: CartState = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    isLoading: false,
    error: null,
    promoCode: null,
    discount: 0,
    originalTotal: 0,
};

// ── Auth check helper ─────────────────────────────────────────────────────────
function isLoggedIn(): boolean {
    try {
        return !!localStorage.getItem("token");
    } catch {
        return false;
    }
}

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            // ✅ Skip API call for guests — cart lives in localStorage via cartContext
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            return await cartService.getCart();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
        }
    }
);

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            return await cartService.addToCart(productId, quantity);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
        }
    }
);

export const updateCartQuantity = createAsyncThunk(
    "cart/updateCartQuantity",
    async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            return await cartService.updateCartQuantity(productId, quantity);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update quantity");
        }
    }
);

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (productId: string, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            return await cartService.removeFromCart(productId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove from cart");
        }
    }
);

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return {};
            return await cartService.clearCart();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
        }
    }
);

export const applyPromoCode = createAsyncThunk(
    "cart/applyPromo",
    async (code: string, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return rejectWithValue("Login required to apply promo codes");
            return await cartService.applyPromoCode(code);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to apply promo code");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchCart
        builder.addCase(fetchCart.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCart.fulfilled, (state, action: any) => {
            state.isLoading = false;
            state.error = null;
            state.items = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            state.totalAmount = action.payload?.data?.totalAmount || action.payload?.cart?.totalAmount || action.payload?.data?.cart?.totalAmount || 0;
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });
        builder.addCase(fetchCart.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // addToCart
        builder.addCase(addToCart.fulfilled, (state, action: any) => {
            state.items = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            state.totalAmount = action.payload?.data?.totalAmount || action.payload?.cart?.totalAmount || action.payload?.data?.cart?.totalAmount || 0;
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });

        // updateCartQuantity
        builder.addCase(updateCartQuantity.fulfilled, (state, action: any) => {
            state.items = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            state.totalAmount = action.payload?.data?.totalAmount || action.payload?.cart?.totalAmount || action.payload?.data?.cart?.totalAmount || 0;
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });

        // removeFromCart
        builder.addCase(removeFromCart.fulfilled, (state, action: any) => {
            state.items = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            state.totalAmount = action.payload?.data?.totalAmount || action.payload?.cart?.totalAmount || action.payload?.data?.cart?.totalAmount || 0;
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });

        // clearCart
        builder.addCase(clearCart.fulfilled, (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.totalItems = 0;
            state.promoCode = null;
            state.discount = 0;
        });

        // applyPromoCode
        builder.addCase(applyPromoCode.fulfilled, (state, action: any) => {
            if (action.payload?.data) {
                state.promoCode = action.payload.data.code;
                state.discount = action.payload.data.discount;
                state.originalTotal = action.payload.data.originalTotal;
                state.totalAmount = action.payload.data.newTotal;
            }
        });
    },
});

export default cartSlice.reducer;