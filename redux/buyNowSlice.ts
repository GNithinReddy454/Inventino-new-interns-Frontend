import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BuyNowProduct {
  productId: string;
  color: string | null;
  size: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image: string;
    [key: string]: any;
  };
}

interface BuyNowState {
  product: BuyNowProduct | null;
}

const initialState: BuyNowState = {
  product: null,
};

const buyNowSlice = createSlice({
  name: "buyNow",
  initialState,
  reducers: {
    setBuyNowProduct: (state, action: PayloadAction<BuyNowProduct>) => {
      state.product = action.payload;
    },
    clearBuyNowProduct: (state) => {
      state.product = null;
    },
  },
});

export const { setBuyNowProduct, clearBuyNowProduct } = buyNowSlice.actions;
export default buyNowSlice.reducer;