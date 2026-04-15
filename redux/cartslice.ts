import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "@/services/cart.service";

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string | null;
    size?: string | null;
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
        const token = localStorage.getItem("token");
        const rawUser = localStorage.getItem("inventino_user");
        if (!token || !rawUser) return false;

        const parsedUser = JSON.parse(rawUser);
        const isAdminSession = parsedUser && Array.isArray(parsedUser.permissions);
        return !isAdminSession;
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

// UPDATED: Add color and size parameters
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, quantity, color, size }: { productId: string; quantity: number; color?: string | null; size?: string | null }, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            // Pass color and size to the service
            return await cartService.addToCart(productId, quantity, color, size);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
        }
    }
);

export const updateCartQuantity = createAsyncThunk(
    "cart/updateCartQuantity",
    async ({ productId, quantity, color, size }: { productId: string; quantity: number; color?: string | null; size?: string | null }, { rejectWithValue }) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            return await cartService.updateCartQuantity(productId, quantity, color, size);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update quantity");
        }
    }
);

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (
        payload: string | { productId: string; color?: string | null; size?: string | null },
        { rejectWithValue }
    ) => {
        try {
            if (!isLoggedIn()) return { data: { items: [], totalAmount: 0 } };
            const normalized =
                typeof payload === "string"
                    ? { productId: payload, color: "", size: "" }
                    : {
                        productId: payload.productId,
                        color: payload.color || "",
                        size: payload.size || "",
                    };
            return await cartService.removeFromCart(
                normalized.productId,
                normalized.color,
                normalized.size
            );
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
    reducers: {
        addLocalCartItem: (state, action) => {
            const pId = String(action.payload?.productId || action.payload?._id || action.payload?.id);
            const color = action.payload?.color;
            const size = action.payload?.size;
            
            // Check if item with same productId, color, and size exists
            const exists = state.items.find((i: any) => 
                String(i.productId || (i as any)._id) === pId && 
                i.color === color && 
                i.size === size
            );
            if (exists) {
                exists.quantity += (action.payload.quantity || 1);
            } else {
                state.items.push({ 
                    ...action.payload, 
                    productId: pId, 
                    color, 
                    size,
                    isLocal: true 
                });
            }
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
        },
        updateLocalCartItemQuantity: (state, action) => {
            const pId = String(action.payload?.productId);
            const nextQuantity = Math.max(1, Number(action.payload?.quantity || 1));
            const color = action.payload?.color;
            const size = action.payload?.size;
            state.items = state.items.map((item: any) => {
                const itemId = String(item.productId || item._id || item.product?._id || item.id);
                const sameVariant =
                    (color === undefined || item.color === color) &&
                    (size === undefined || item.size === size);
                if (itemId === pId && sameVariant) {
                    return { ...item, quantity: nextQuantity, isLocal: true };
                }
                return item;
            });
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
        },
        removeLocalCartItem: (state, action) => {
            const id = String(action.payload);
            state.items = state.items.filter(i => String(i.productId || (i as any)._id) !== id);
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
        }
    },
    extraReducers: (builder) => {
        // fetchCart
        builder.addCase(fetchCart.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCart.fulfilled, (state, action: any) => {
            state.isLoading = false;
            state.error = null;
            const backendItems = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            const localItems = state.items.filter((i: any) => i.isLocal);
            const merged = [...backendItems];
            localItems.forEach((loc: any) => {
                // Check for same productId, color, and size combination
                if (!merged.some((m: any) => 
                    String(m.productId || m._id) === String(loc.productId) && 
                    m.color === loc.color && 
                    m.size === loc.size
                )) {
                    merged.push(loc);
                }
            });
            state.items = merged;
            state.totalAmount = action.payload?.data?.total || action.payload?.cart?.totalAmount || action.payload?.data?.newTotal || action.payload?.newTotal || state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
            state.promoCode = action.payload?.data?.promoCode || action.payload?.cart?.promoCode || action.payload?.data?.code || action.payload?.code || action.payload?.promoCode || state.promoCode;
            state.discount = Number(action.payload?.data?.discount || action.payload?.cart?.discount || action.payload?.data?.discountAmount || action.payload?.discount || state.discount || 0);

            // Recalculate totalAmount if a discount is applied but not factored into totalAmount
            const calculatedSubtotal = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
            if (state.discount > 0 && state.totalAmount === calculatedSubtotal) {
                state.totalAmount = state.totalAmount - state.discount;
            }
        });
        builder.addCase(fetchCart.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // addToCart
        builder.addCase(addToCart.fulfilled, (state, action: any) => {
            const backendItems = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            const localItems = state.items.filter((i: any) => i.isLocal);
            const merged = [...backendItems];
            localItems.forEach((loc: any) => {
                if (!merged.some((m: any) => 
                    String(m.productId || m._id) === String(loc.productId) && 
                    m.color === loc.color && 
                    m.size === loc.size
                )) {
                    merged.push(loc);
                }
            });
            state.items = merged;
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });

        // updateCartQuantity
        builder.addCase(updateCartQuantity.fulfilled, (state, action: any) => {
            const backendItems = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            const localItems = state.items.filter((i: any) => i.isLocal);
            const merged = [...backendItems];
            localItems.forEach((loc: any) => {
                if (!merged.some((m: any) => 
                    String(m.productId || m._id) === String(loc.productId) && 
                    m.color === loc.color && 
                    m.size === loc.size
                )) {
                    merged.push(loc);
                }
            });
            state.items = merged;
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
            state.totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        });

        // removeFromCart
        builder.addCase(removeFromCart.fulfilled, (state, action: any) => {
            const backendItems = action.payload?.data?.items || action.payload?.cart?.items || action.payload?.data?.cart?.items || [];
            const argProductId =
                typeof action.meta.arg === "string"
                    ? action.meta.arg
                    : action.meta.arg?.productId;
            const localItems = state.items.filter(
                (i: any) => i.isLocal && String(i.productId) !== String(argProductId)
            );
            const merged = [...backendItems];
            localItems.forEach((loc: any) => {
                if (!merged.some((m: any) => 
                    String(m.productId || m._id) === String(loc.productId) && 
                    m.color === loc.color && 
                    m.size === loc.size
                )) {
                    merged.push(loc);
                }
            });
            state.items = merged;
            state.totalAmount = state.items.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * item.quantity), 0);
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

        builder.addCase(applyPromoCode.fulfilled, (state, action: any) => {
            const data = action.payload?.data || action.payload;
            if (data) {
                state.promoCode = data.code || data.promoCode || action.meta.arg;
                state.discount = Number(data.discount || data.discountAmount || 0);
                state.originalTotal = Number(data.originalTotal || state.totalAmount || 0);
                
                const newTotal = data.newTotal || data.total;
                if (newTotal !== undefined && newTotal !== null) {
                    state.totalAmount = Number(newTotal);
                } else {
                    state.totalAmount = Number(state.totalAmount || 0) - state.discount;
                }
            }
        });
    },
});

export const { addLocalCartItem, updateLocalCartItemQuantity, removeLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;
