"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/app/(main)/components/authContext";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { loginUserAction } from "@/redux/authslice";
import { loginSchema, type LoginFormData } from "../schema";
import { useToast } from "@/app/components/GlobalToast";

import AuthLayout from "../_components/AuthSplitLayout";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import PasswordInput from "../_components/PasswordInput";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!data.email || !data.password) {
      return;
    }

    const resultAction = await dispatch(
      loginUserAction({ email: data.email, password: data.password })
    );

    if (loginUserAction.fulfilled.match(resultAction)) {
      const serverUser = resultAction.payload?.data?.user;
      if (serverUser) {
        login(serverUser as any);
        showToast("Login Successful!", "Welcome back.", "success");
        router.push("/");
      }
    } else if (loginUserAction.rejected.match(resultAction)) {
      const errorMessage =
        (resultAction.payload as string) ||
        "Invalid email or password";
      showToast("Login Failed", errorMessage, "error");
    }
  };

  return (
    <AuthLayout title="Welcome Back" bgImage="/images/login-bg.jpg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Email *"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="relative">
          <PasswordInput
            label="Password *"
            placeholder="Enter password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Link
            href="/forgot-password"
            className="absolute right-0 top-0 text-[11px] text-[#E15483] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>

        <div className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            width={16}
            height={16}
          />
          Login with Google
        </div>

        <p className="text-center text-xs text-gray-500">
          New user?
          <Link href="/signup" className="text-[#E15483] font-bold ml-1 hover:underline">
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}