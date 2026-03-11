
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "@/services/wishlist.service";

interface WishlistState {
    items: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    isLoading: false,
    error: null,
};

// ── localStorage helpers (guest users) ──────────────────────────────────────
const LOCAL_KEY = "wishlist_guest";

function getLocalWishlist(): any[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
    catch { return []; }
}

function saveLocalWishlist(items: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function isAuthError(error: any): boolean {
    const status = error?.response?.status;
    const msg: string = (error?.response?.data?.message || "").toLowerCase();
    return (
        status === 401 || status === 403 ||
        msg.includes("unauth") || msg.includes("unauthorized") ||
        msg.includes("invalid token") || msg.includes("not logged") || msg.includes("login")
    );
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchWishlist = createAsyncThunk(
    "wishlist/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistService.getWishlist();
            return response.data?.wishlist?.items || [];
        } catch (error: any) {
            if (isAuthError(error)) {
                return getLocalWishlist();
            }
            return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
        }
    }
);

// Accepts either a plain string ID (logged-in) or { productId, product } (guest fallback)
export const addWishlistItem = createAsyncThunk(
    "wishlist/add",
    async (arg: string | { productId: string; product: any }, { rejectWithValue }) => {
        const productId = typeof arg === "string" ? arg : arg.productId;
        const productData = typeof arg === "object" ? arg.product : null;

        try {
            const response = await wishlistService.addToWishlist(productId);
            return response.data?.wishlist?.items || [];
        } catch (error: any) {
            if (isAuthError(error)) {
                const existing = getLocalWishlist();
                const alreadyExists = existing.some(
                    (w: any) => w.product?._id === productId || w.product?.id === productId
                );
                if (!alreadyExists) {
                    const entry = { product: { ...productData, _id: productId, id: productId } };
                    const updated = [...existing, entry];
                    saveLocalWishlist(updated);
                    return updated;
                }
                return existing;
            }
            return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist");
        }
    }
);

export const removeWishlistItem = createAsyncThunk(
    "wishlist/remove",
    async (productId: string, { rejectWithValue }) => {
        try {
            const response = await wishlistService.removeFromWishlist(productId);
            return response.data?.wishlist?.items || [];
        } catch (error: any) {
            if (isAuthError(error)) {
                const existing = getLocalWishlist();
                const updated = existing.filter(
                    (w: any) => w.product?._id !== productId && w.product?.id !== productId
                );
                saveLocalWishlist(updated);
                return updated;
            }
            return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist");
        }
    }
);

export const clearWishlist = createAsyncThunk(
    "wishlist/clear",
    async (_, { rejectWithValue }) => {
        try {
            await wishlistService.clearWishlist();
            return [];
        } catch (error: any) {
            if (isAuthError(error)) {
                saveLocalWishlist([]);
                return [];
            }
            return rejectWithValue(error.response?.data?.message || "Failed to clear wishlist");
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchWishlist.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
            .addCase(fetchWishlist.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

            .addCase(addWishlistItem.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(addWishlistItem.rejected, (state, action) => { state.error = action.payload as string; })

            .addCase(removeWishlistItem.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(removeWishlistItem.rejected, (state, action) => { state.error = action.payload as string; })

            .addCase(clearWishlist.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(clearWishlist.rejected, (state, action) => { state.error = action.payload as string; });
    },
});

export default wishlistSlice.reducer;