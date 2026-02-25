import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { User } from "@/lib/types";

// Async Thunks for Signup and Login
export const signupUserAction = createAsyncThunk(
  "auth/signup",
  async (userData: any, { rejectWithValue }) => {
    try {
      return await authService.registerUser(userData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Signup failed");
    }
  }
);

export const loginUserAction = createAsyncThunk(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      if (!credentials.email || !credentials.password) {
        return rejectWithValue("Email and password are required");
      }
      return await authService.loginUser(credentials);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      // Filter out technical axios errors
      if (errorMsg.includes("data") && errorMsg.includes("argument")) {
        return rejectWithValue("Unable to process request. Please check your credentials.");
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const forgotPasswordAction = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to send reset link");
    }
  }
);

export const verifyOtpAction = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      return await authService.verifyEmail(email, otp);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "OTP verification failed");
    }
  }
);

export const resetPasswordAction = createAsyncThunk(
  "auth/resetPassword",
  async (data: { password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Password reset failed");
    }
  }
);

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null; // This allows the string error message
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      authService.logoutUser();
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUserAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user;
      })
      .addCase(signupUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || (action.error?.message as string) || "Signup failed";
      })
      // Login
      .addCase(loginUserAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user;
      })
      .addCase(loginUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || (action.error?.message as string) || "Login failed";
      })
      // Forgot Password
      .addCase(forgotPasswordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAction.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || (action.error?.message as string) || "Failed to send reset link";
      })
      // Verify OTP
      .addCase(verifyOtpAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user;
      })
      .addCase(verifyOtpAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || (action.error?.message as string) || "OTP verification failed";
      })
      // Reset Password
      .addCase(resetPasswordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.user = null;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || (action.error?.message as string) || "Password reset failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;