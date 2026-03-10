import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/services/product.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoryData {
    story: string;
    storyMedia: string;
    productId: string;
    name: string;
}

export interface SimilarProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    material: string;
    stock: number;
    images: string[];
    isActive: boolean;
    isDeleted: boolean;
    ratingsAverage: number;
    ratingsCount: number;
    trendy: boolean;
    bestSeller: boolean;
    hashtags: string[];
    createdAt: string;
    updatedAt: string;
    productId: string;
    slug: string;
}

export interface RatingData {
    reviews: {
        _id: string;
        product: string;
        user: { _id: string; name: string };
        rating: number;
        comment: string;
        images: { id: string; url: string }[];
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }[];
    ratingsAverage: number;
    ratingsCount: number;
}

interface StoryState {
    story: StoryData | null;
    storyLoading: boolean;
    storyError: string | null;

    similarProducts: SimilarProduct[];
    similarLoading: boolean;
    similarError: string | null;
    similarTotalPages: number;
    similarCurrentPage: number;

    ratingData: RatingData | null;
    ratingLoading: boolean;
    ratingError: string | null;
    ratingSuccess: boolean;
}

const initialState: StoryState = {
    story: null,
    storyLoading: false,
    storyError: null,

    similarProducts: [],
    similarLoading: false,
    similarError: null,
    similarTotalPages: 1,
    similarCurrentPage: 1,

    ratingData: null,
    ratingLoading: false,
    ratingError: null,
    ratingSuccess: false,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProductStory = createAsyncThunk(
    "story/fetchStory",
    async (productId: string, { rejectWithValue }) => {
        try {
            const response = await productService.getStory(productId);
            return response?.data as StoryData;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch product story"
            );
        }
    }
);

export const fetchSimilarProducts = createAsyncThunk(
    "story/fetchSimilar",
    async ({ productId, page, limit }: { productId: string; page: number; limit: number }, { rejectWithValue }) => {
        try {
            const response = await productService.getSimilar(productId, page, limit);
            // If the backend doesn't support meta yet, we default to whatever comes back.
            // If it returns { items, meta } the backend needs to be standard.
            // But let's handle both based on common backend patterns.
            const results = response?.data;
            if (Array.isArray(results)) {
                return { items: results, totalPages: 1, currentPage: page };
            } else if (results && results.items) {
                return { items: results.items, totalPages: results.meta?.totalPages || 1, currentPage: results.meta?.page || 1 };
            }
            return { items: [], totalPages: 1, currentPage: 1 };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch similar products"
            );
        }
    }
);

export const submitProductRating = createAsyncThunk(
    "story/submitRating",
    async (
        { productId, rating, review }: { productId: string; rating: number; review?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await productService.submitRating(productId, rating, review);
            return response?.data as RatingData;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to submit rating"
            );
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {
        resetRatingState(state) {
            state.ratingSuccess = false;
            state.ratingError = null;
        },
        setSimilarCurrentPage(state, action) {
            state.similarCurrentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        // fetchProductStory
        builder.addCase(fetchProductStory.pending, (state) => {
            state.storyLoading = true;
            state.storyError = null;
        });
        builder.addCase(fetchProductStory.fulfilled, (state, action) => {
            state.storyLoading = false;
            state.story = action.payload;
        });
        builder.addCase(fetchProductStory.rejected, (state, action) => {
            state.storyLoading = false;
            state.storyError = action.payload as string;
        });

        // fetchSimilarProducts
        builder.addCase(fetchSimilarProducts.pending, (state) => {
            state.similarLoading = true;
            state.similarError = null;
        });
        builder.addCase(fetchSimilarProducts.fulfilled, (state, action) => {
            state.similarLoading = false;
            state.similarProducts = action.payload.items;
            state.similarCurrentPage = action.payload.currentPage;
            state.similarTotalPages = action.payload.totalPages;
        });
        builder.addCase(fetchSimilarProducts.rejected, (state, action) => {
            state.similarLoading = false;
            state.similarError = action.payload as string;
        });

        // submitProductRating
        builder.addCase(submitProductRating.pending, (state) => {
            state.ratingLoading = true;
            state.ratingError = null;
            state.ratingSuccess = false;
        });
        builder.addCase(submitProductRating.fulfilled, (state, action) => {
            state.ratingLoading = false;
            state.ratingData = action.payload;
            state.ratingSuccess = true;
        });
        builder.addCase(submitProductRating.rejected, (state, action) => {
            state.ratingLoading = false;
            state.ratingError = action.payload as string;
            state.ratingSuccess = false;
        });
    },
});

export const { resetRatingState, setSimilarCurrentPage } = storySlice.actions;
export default storySlice.reducer;
