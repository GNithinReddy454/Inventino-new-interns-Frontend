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

interface GuestWishlistItem {
  product: {
    _id: string;
  };
  color?: string | null;
  size?: string | null;
  isLocal?: boolean;
}

function getLocalWishlist(): GuestWishlistItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: GuestWishlistItem[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
}

function isLoggedIn(): boolean {
  // Adjust this to match how your app stores the auth token
  return !!(
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    document.cookie.includes("token=")
  );
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

// Updated to accept color and size
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async ({ productId, color, size }: { productId: string; color?: string | null; size?: string | null }, { rejectWithValue }) => {
    try {
      if (!isLoggedIn()) {
        const items = getLocalWishlist();
        // Avoid duplicates (check both productId, color, and size)
        const exists = items.some(
          (i: GuestWishlistItem) => 
            i.product?._id === productId && 
            i.color === color && 
            i.size === size
        );
        if (!exists) {
          items.push({ 
            product: { _id: productId },
            color: color || null,
            size: size || null,
            isLocal: true 
          });
          saveLocalWishlist(items);
        }
        return items;
      }
      // Pass color and size to the service
      const response = await wishlistService.addToWishlist(productId, color, size);
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
        const items = getLocalWishlist().filter(
          (i: GuestWishlistItem) => i.product?._id !== productId
        );
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
            const pId = String(action.payload?.product?._id || action.payload?._id);
            const color = action.payload?.color;
            const size = action.payload?.size;
            const exists = state.items.some((i: any) => 
                String(i.product?._id) === pId && 
                i.color === color && 
                i.size === size
            );
            if (!exists) {
                state.items.push({ ...action.payload, isLocal: true });
            }
        },
        removeLocalWishlistItem: (state, action) => {
            const id = String(action.payload);
            state.items = state.items.filter(i => String(i.product?._id || i._id) !== id);
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
                const id = String(loc.product?._id || loc._id);
                const color = loc.color;
                const size = loc.size;
                if (!merged.some(m => 
                    String(m.product?._id || m._id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
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
                const id = String(loc.product?._id || loc._id);
                const color = loc.color;
                const size = loc.size;
                if (!merged.some(m => 
                    String(m.product?._id || m._id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
                    merged.push(loc);
                }
            });
            state.items = merged;
        });

        // Remove Item
        builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
            const removedId = String(action.meta.arg);
            const localOnes = state.items.filter(i => i.isLocal && String(i.product?._id || i._id) !== removedId);
            const backendOnes = action.payload || [];
            const merged = [...backendOnes];
            localOnes.forEach(loc => {
                const id = String(loc.product?._id || loc._id);
                const color = loc.color;
                const size = loc.size;
                if (!merged.some(m => 
                    String(m.product?._id || m._id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
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