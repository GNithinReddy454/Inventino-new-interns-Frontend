import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { adminLogin } from "@/services/admin.service";
import { User, AuthResponse, ApiResponse } from "@/lib/types";

interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const error = err as { response?: { data?: { message?: string } } };
    return error.response?.data?.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
};

export const signupUserAction = createAsyncThunk<AuthResponse, SignupPayload>(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.registerUser(userData);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Signup failed");
    }
  }
);

export const loginUserAction = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.loginUser(credentials);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Login failed");
    }
  }
);

export const adminLoginAction = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      return await adminLogin(credentials);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Admin login failed");
    }
  }
);

export const forgotPasswordAction = createAsyncThunk<ApiResponse<null>, string>(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to send reset link");
    }
  }
);

export const verifyOtpAction = createAsyncThunk<AuthResponse, { email: string; otp: string }>(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      return await authService.verifyEmail(email, otp);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "OTP verification failed");
    }
  }
);

export const resetPasswordAction = createAsyncThunk<ApiResponse<null>, { token: string; newPassword: string }>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(data);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Password reset failed");
    }
  }
);

export const resendOtpAction = createAsyncThunk<ApiResponse<null>, string>(
  "auth/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.resendOtp(email);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to resend OTP");
    }
  }
);

export const changePasswordAction = createAsyncThunk<ApiResponse<null>, { oldPassword: string; newPassword: string }>(
  "auth/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.changePassword(data);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to change password");
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
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = (action.payload as string) || "Signup failed";
      })
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
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(adminLoginAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user;
      })
      .addCase(adminLoginAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Admin login failed";
      })
      .addCase(forgotPasswordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send reset link";
      })
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
        state.error = (action.payload as string) || "OTP verification failed";
      })
      .addCase(resetPasswordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Password reset failed";
      })
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