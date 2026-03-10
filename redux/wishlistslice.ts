import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "@/services/wishlist.service";

interface WishlistState {
    items: any[];
    isLoading: boolean;
    error: string | null;
}

const loadLocalWishlist = (): any[] => {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem("localWishlist");
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

const saveLocalWishlist = (items: any[]) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("localWishlist", JSON.stringify(items));
    }
};

const initialState: WishlistState = {
    items: [],
    isLoading: false,
    error: null,
};

export const fetchWishlist = createAsyncThunk(
    "wishlist/fetch",
    async (_, { rejectWithValue }) => {
        try {
            if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                return loadLocalWishlist();
            }
            const response = await wishlistService.getWishlist();
            return response?.data?.wishlist?.items || response?.wishlist?.items || response?.data?.items || response?.items || [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch wishlist"
            );
        }
    }
);

export const addWishlistItem = createAsyncThunk(
    "wishlist/add",
    async (payload: any, { rejectWithValue }) => {
        try {
            let productId = String(payload.product?._id || payload.product?.id || payload._id || payload.id || payload.productId);
            if (!productId || productId === "" || productId === "undefined" || productId === "null") {
                productId = String(payload.id || payload._id || payload.productId);
            }
            productId = typeof payload === "string" ? payload : productId;

            if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                const currentItems = loadLocalWishlist();
                if (!currentItems.find((i: any) => String(i.product?._id) === productId || String(i.product?.id) === productId)) {
                    const productObj = typeof payload === "object" ? payload : { _id: productId };
                    // Normalize standard product fields so it matches API structure
                    const newItem = {
                        _id: Date.now().toString(),
                        product: {
                            _id: productId,
                            id: productId,
                            title: productObj.name || productObj.title,
                            name: productObj.name || productObj.title,
                            images: productObj.images || [productObj.image],
                            image: productObj.image || productObj.images?.[0],
                            price: productObj.price,
                            originalPrice: productObj.originalPrice,
                            category: productObj.category,
                            rating: productObj.rating,
                            badge: productObj.badge,
                        }
                    };
                    currentItems.push(newItem);
                    saveLocalWishlist(currentItems);
                }
                return currentItems;
            }

            const response = await wishlistService.addToWishlist(productId);
            return response?.data?.wishlist?.items || response?.wishlist?.items || response?.data?.items || response?.items || [];
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
            if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                let currentItems = loadLocalWishlist();
                currentItems = currentItems.filter((i: any) => String(i.product?._id) !== String(productId) && String(i.product?.id) !== String(productId));
                saveLocalWishlist(currentItems);
                return currentItems;
            }

            const response = await wishlistService.removeFromWishlist(productId);
            return response?.data?.wishlist?.items || response?.wishlist?.items || response?.data?.items || response?.items || [];
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
            if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                saveLocalWishlist([]);
                return [];
            }
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
        builder.addCase(fetchWishlist.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchWishlist.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload;
            state.error = null;
        });
        builder.addCase(fetchWishlist.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(addWishlistItem.fulfilled, (state, action) => {
            state.items = action.payload;
            state.error = null;
        });

        builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
            state.items = action.payload;
            state.error = null;
        });

        builder.addCase(clearWishlist.fulfilled, (state, action) => {
            state.items = action.payload;
            state.error = null;
        });
    },
});

export default wishlistSlice.reducer;
