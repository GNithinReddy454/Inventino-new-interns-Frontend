import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  name:      string;
  email:     string;
  phone?:    string;
  location?: string;
}

interface AuthState {
  user: AuthUser | null;
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;