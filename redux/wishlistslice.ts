import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

// ── localStorage helpers (for guests) ────────────────────────────────────────
const LOCAL_KEY = "guest_wishlist";

function getLocalWishlist(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: any[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
}

function isLoggedIn(): boolean {
  try {
    return !!(
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("inventino_user")
    );
  } catch {
    return false;
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      if (!isLoggedIn()) {
        // Guest: return localStorage items wrapped in the same shape
        return getLocalWishlist();
      }
      const response = await wishlistService.getWishlist();
      return response.data?.wishlist?.items || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

// Accepts either a plain string ID or a product object
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (payload: any, { rejectWithValue }) => {
    const productId = typeof payload === "string" ? payload : String(payload.productId || payload._id || payload.id);
    try {
      if (!isLoggedIn()) {
        const items = getLocalWishlist();
        // Avoid duplicates checking all possible ID fields
        const exists = items.some((i: any) => {
          const id = String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id);
          return id === productId;
        });
        if (!exists) {
          // If payload is an object, store it; otherwise create minimal structure
          const itemToStore = typeof payload === "object" ? { product: payload, isLocal: true } : { product: { _id: productId }, _id: productId, productId: productId, isLocal: true };
          items.push(itemToStore);
          saveLocalWishlist(items);
        }
        return items;
      }
      const response = await wishlistService.addToWishlist(productId);
      return response.data?.wishlist?.items || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId: string, { rejectWithValue }) => {
    try {
      if (!isLoggedIn()) {
        const items = getLocalWishlist().filter((i: any) => {
          const id = String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id);
          return id !== productId;
        });
        saveLocalWishlist(items);
        return items;
      }
      const response = await wishlistService.removeFromWishlist(productId);
      return response.data?.wishlist?.items || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clear",
  async (_, { rejectWithValue }) => {
    try {
      if (!isLoggedIn()) {
        saveLocalWishlist([]);
        return [];
      }
      await wishlistService.clearWishlist();
      return [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear wishlist"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        addLocalWishlistItem: (state, action) => {
            const pId = String(action.payload?.product?.productId || action.payload?.product?._id || action.payload?.product?.id || action.payload?._id || action.payload?.productId);
            const exists = state.items.some((i: any) => 
                String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id) === pId
            );
            if (!exists) {
                state.items.push({ ...action.payload, isLocal: true });
            }
        },
        removeLocalWishlistItem: (state, action) => {
            const id = String(action.payload);
            state.items = state.items.filter(i => 
                String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id) !== id
            );
        }
    },
    extraReducers: (builder) => {
        // Fetch Wishlist
        builder.addCase(fetchWishlist.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchWishlist.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            const localOnes = state.items.filter(i => i.isLocal);
            const backendOnes = action.payload || [];
            const merged = [...backendOnes];
            localOnes.forEach(loc => {
                const id = String(loc.product?.productId || loc.product?._id || loc.product?.id || loc.productId || loc._id || loc.id);
                if (!merged.some(m => String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id)) {
                    merged.push(loc);
                }
            });
            state.items = merged;
        });
        builder.addCase(fetchWishlist.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add Item
        builder.addCase(addWishlistItem.fulfilled, (state, action) => {
            const localOnes = state.items.filter(i => i.isLocal);
            const backendOnes = action.payload || [];
            const merged = [...backendOnes];
            localOnes.forEach(loc => {
                const id = String(loc.product?.productId || loc.product?._id || loc.product?.id || loc.productId || loc._id || loc.id);
                if (!merged.some(m => String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id)) {
                    merged.push(loc);
                }
            });
            state.items = merged;
        });

        // Remove Item
        builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
            const removedId = String(action.meta.arg);
            const localOnes = state.items.filter(i => i.isLocal && String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id) !== removedId);
            const backendOnes = action.payload || [];
            const merged = [...backendOnes];
            localOnes.forEach(loc => {
                const id = String(loc.product?.productId || loc.product?._id || loc.product?.id || loc.productId || loc._id || loc.id);
                if (!merged.some(m => String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id)) {
                    merged.push(loc);
                }
            });
            state.items = merged;
        });

        // Clear Wishlist
        builder.addCase(clearWishlist.fulfilled, (state, action) => {
            state.items = action.payload || [];
        });
    },
});

export const { addLocalWishlistItem, removeLocalWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
