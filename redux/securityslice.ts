import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SecurityState {
  current: string;
  newPwd: string;
  confirm: string;
  errors: {
    current?: string;
    newPwd?: string;
    confirm?: string;
  };
  savedBanner: boolean;
}

const initialState: SecurityState = {
  current: "",
  newPwd: "",
  confirm: "",
  errors: {},
  savedBanner: false,
};

const securitySlice = createSlice({
  name: "security",
  initialState,
  reducers: {
    setField(
      state,
      action: PayloadAction<
        Partial<Pick<SecurityState, "current" | "newPwd" | "confirm">>
      >,
    ) {
      return { ...state, ...action.payload };
    },
    setErrors(state, action: PayloadAction<SecurityState["errors"]>) {
      state.errors = action.payload;
    },
    submitSuccess(state) {
      state.current = "";
      state.newPwd = "";
      state.confirm = "";
      state.errors = {};
      state.savedBanner = true;
    },
    hideSavedBanner(state) {
      state.savedBanner = false;
    },
  },
});

export const { setField, setErrors, submitSuccess, hideSavedBanner } =
  securitySlice.actions;
export default securitySlice.reducer;
