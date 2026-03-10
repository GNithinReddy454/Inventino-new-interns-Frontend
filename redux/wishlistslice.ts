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

export const fetchWishlist = createAsyncThunk(
    "wishlist/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistService.getWishlist();
            return response.data?.wishlist?.items || [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch wishlist"
            );
        }
    }
);

export const addWishlistItem = createAsyncThunk(
    "wishlist/add",
    async (productId: string, { rejectWithValue }) => {
        try {
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
            const response = await wishlistService.clearWishlist();
            return [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to clear wishlist"
            );
        }
    }
);

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Wishlist
        builder.addCase(fetchWishlist.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchWishlist.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchWishlist.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add Item
        builder.addCase(addWishlistItem.fulfilled, (state, action) => {
            state.items = action.payload;
        });

        // Remove Item
        builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
            state.items = action.payload;
        });

        // Clear Wishlist
        builder.addCase(clearWishlist.fulfilled, (state, action) => {
            state.items = action.payload;
        });
    },
});

export default wishlistSlice.reducer;
