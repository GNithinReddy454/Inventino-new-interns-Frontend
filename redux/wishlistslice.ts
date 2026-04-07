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

// ── localStorage helpers (for guests) ────────────────────────────────────────
const LOCAL_KEY = "guest_wishlist";

interface GuestWishlistItem {
  product: {
    _id: string;
    productId?: string;
    id?: string;
  };
  color?: string | null;
  size?: string | null;
  quantity?: number; // Add quantity to GuestWishlistItem
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

// Accepts either a plain string ID or an object with productId, color, size, and quantity
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (payload: any, { rejectWithValue }) => {
    let productId: string;
    let color: string | null = null;
    let size: string | null = null;
    let quantity: number = 1; // Default quantity to 1

    if (typeof payload === "string") {
      productId = payload;
    } else {
      productId = String(payload.productId || payload.product?._id || payload._id || payload.id);
      color = payload.color || null;
      size = payload.size || null;
      quantity = payload.quantity || 1; // Extract quantity from payload
    }

    try {
      if (!isLoggedIn()) {
        const items = getLocalWishlist();
        // Avoid duplicates checking all possible ID fields AND color/size
        const exists = items.some((i: any) => {
          const id = String(i.productId || i.product?.productId || i.product?._id || i.product?.id || i._id || i.id);
          return id === productId && i.color === color && i.size === size;
        });
        if (!exists) {
          // Build a properly structured item that mirrors the backend API response shape
          // so the wishlist page can display name, price, image, color, size, quantity
          const itemToStore = {
            product: {
              _id: productId,
              productId: productId,
              name: (typeof payload === "object" ? payload.name || payload.product?.name : "") || "",
              price: (typeof payload === "object" ? payload.price ?? payload.product?.price : 0) ?? 0,
              images: (() => {
                if (typeof payload !== "object") return [];
                const img = payload.image || payload.product?.image;
                const imgs = payload.images || payload.product?.images;
                if (Array.isArray(imgs) && imgs.length > 0) {
                  return imgs.map((i: any) => typeof i === "string" ? { url: i } : i);
                }
                if (img) return [typeof img === "string" ? { url: img } : img];
                return [];
              })(),
              category: (typeof payload === "object" ? payload.category || payload.product?.category : "") || "",
            },
            _id: `${productId}-${color || ""}-${size || ""}`,
            productId: productId,
            color,
            size,
            quantity,
            isLocal: true,
          };
          items.push(itemToStore);
          saveLocalWishlist(items);
        }
        return items;
      }
      // Pass color, size, and quantity to the service
      const response = await wishlistService.addToWishlist(productId, color || undefined, size || undefined, quantity);
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
  async (compositeId: string, { rejectWithValue }) => {
    try {
      // Extract the original ID if a composite ID (e.g. "id-color-size-index") was passed
      const productId = compositeId.includes("-") ? compositeId.split("-")[0] : compositeId;

      if (!isLoggedIn()) {
        const items = getLocalWishlist().filter((i: any) => {
          // If we passed a unique _id (like "prod-color-size"), match that first
          if (i._id === productId || i._id === compositeId) return false;
          // Fallback to product level IDs if _id didn't match
          const id = String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i.id);
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
            const color = action.payload?.color;
            const size = action.payload?.size;
            const quantity = action.payload?.quantity || 1; // Include quantity
            const exists = state.items.some((i: any) => 
                String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i._id || i.id) === pId && 
                i.color === color && 
                i.size === size
            );
            if (!exists) {
                state.items.push({ ...action.payload, quantity, isLocal: true }); // Store quantity
            }
        },
        removeLocalWishlistItem: (state, action) => {
            const compositeId = String(action.payload);
            const baseId = compositeId.includes("-") ? compositeId.split("-")[0] : compositeId;

            state.items = state.items.filter(i => {
                const itemId = String(i._id || "");
                const productId = String(i.product?.productId || i.product?._id || i.product?.id || i.productId || i.id || "");
                
                // If it matches exactly (composite or _id), remove it
                if (itemId === compositeId || itemId === baseId) return false;
                // If it's the base product level ID, remove it
                return productId !== baseId;
            });
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
                const color = loc.color;
                const size = loc.size;
                const quantity = loc.quantity || 1; // Preserve quantity
                if (!merged.some(m => 
                    String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
                    merged.push({ ...loc, quantity });
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
                const color = loc.color;
                const size = loc.size;
                const quantity = loc.quantity || 1; // Preserve quantity
                if (!merged.some(m => 
                    String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
                    merged.push({ ...loc, quantity });
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
                const color = loc.color;
                const size = loc.size;
                const quantity = loc.quantity || 1; // Preserve quantity
                if (!merged.some(m => 
                    String(m.product?.productId || m.product?._id || m.product?.id || m.productId || m._id || m.id) === id && 
                    m.color === color && 
                    m.size === size
                )) {
                    merged.push({ ...loc, quantity });
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