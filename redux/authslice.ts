import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { User } from "@/lib/types";

/**
 * 1. Define the Response interface based on your Postman docs [cite: 1, 13-17]
 * This ensures 'action.payload.data' is recognized by TypeScript.
 */
export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// 2. Updated Thunks with <AuthResponse, ArgumentType>
export const signupUserAction = createAsyncThunk<AuthResponse, any>(
  "auth/signup",
  async (userData: any, { rejectWithValue }) => {
    try {
      return await authService.registerUser(userData);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Signup failed",
      );
    }
  },
);

export const loginUserAction = createAsyncThunk<AuthResponse, any>(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      if (!credentials.email || !credentials.password) {
        return rejectWithValue("Email and password are required");
      }
      return await authService.loginUser(credentials);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Login failed";
      if (errorMsg.includes("data") && errorMsg.includes("argument")) {
        return rejectWithValue(
          "Unable to process request. Please check your credentials.",
        );
      }
      return rejectWithValue(errorMsg);
    }
  },
);

export const forgotPasswordAction = createAsyncThunk<any, string>(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        "Failed to send reset link",
      );
    }
  },
);

export const verifyOtpAction = createAsyncThunk<
  AuthResponse,
  { email: string; otp: string }
>(
  "auth/verifyOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      // Assuming this returns the same data structure as Login
      return await authService.verifyEmail(email, otp);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "OTP verification failed",
      );
    }
  },
);

export const resetPasswordAction = createAsyncThunk<
  any,
  { token: string; newPassword: string }
>(
  "auth/resetPassword",
  async (
    data: { token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      return await authService.resetPassword(data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Password reset failed",
      );
    }
  },
);

export const resendOtpAction = createAsyncThunk<any, string>(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      return await authService.resendOtp(email);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to resend OTP"
      );
    }
  }
);

export const changePasswordAction = createAsyncThunk<
  any,
  { oldPassword: string; newPassword: string }
>(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.changePassword(data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to change password"
      );
    }
  }
);

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
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
        state.user = action.payload.data?.user; // Correctly typed [cite: 1, 16-17]
      })
      .addCase(signupUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Signup failed";
      })
      // Login
      .addCase(loginUserAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user; // Correctly typed [cite: 1, 39-40]
      })
      .addCase(loginUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
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
        state.error = (action.payload as string) || "Failed to send reset link";
      })
      // Verify OTP
      .addCase(verifyOtpAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user; // Correctly typed [cite: 1, 16-17]
      })
      .addCase(verifyOtpAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "OTP verification failed";
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
        state.error = (action.payload as string) || "Password reset failed";
      })
      // Resend OTP
      .addCase(resendOtpAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOtpAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtpAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to resend OTP";
      })
      // Change Password
      .addCase(changePasswordAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePasswordAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to change password";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
