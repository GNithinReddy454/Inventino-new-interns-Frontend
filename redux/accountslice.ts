import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AccountState {
  name: string;
  email: string;
  phone: string;
  location: string;
  gender: string;
  savedBanner: boolean;
}

const initialState: AccountState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  gender: "",
  savedBanner: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setField(state, action: PayloadAction<Partial<Omit<AccountState, "savedBanner">>>) {
      return { ...state, ...action.payload };
    },
    showSavedBanner(state) {
      state.savedBanner = true;
    },
    hideSavedBanner(state) {
      state.savedBanner = false;
    },
  },
});

export const { setField, showSavedBanner, hideSavedBanner } = accountSlice.actions;
export default accountSlice.reducer;