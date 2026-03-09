"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/app/(main)/components/authContext";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { adminLoginAction } from "@/redux/authslice";
import { loginSchema, type LoginFormData } from "@/app/(auth)/schema";
import { useToast } from "@/app/components/GlobalToast";

import AuthLayout from "@/app/(auth)/_components/AuthSplitLayout";
import AuthInput from "@/app/(auth)/_components/AuthInput";
import AuthButton from "@/app/(auth)/_components/AuthButton";
import PasswordInput from "@/app/(auth)/_components/PasswordInput";
import GoogleButton from "@/app/(auth)/_components/GoogleButton";

export default function AdminLoginPage() {
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
    if (!data.email || !data.password) return;

    const resultAction = await dispatch(
      adminLoginAction({ email: data.email, password: data.password })
    );
    if (adminLoginAction.fulfilled.match(resultAction)) {
      const serverUser = resultAction.payload?.data?.user;
      if (serverUser) {
        login(serverUser);
        showToast("Login Successful!", "Welcome back, Admin.", "success");
        router.push("/admin");
      }
    } else if (adminLoginAction.rejected.match(resultAction)) {
      const errorMessage =
        (resultAction.payload as string) || "Invalid email or password";
      showToast("Login Failed", errorMessage, "error");
    }
  };

  return (
    <AuthLayout title="Welcome back Admin" bgImage="/images/login-bg.jpg">
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
          {loading ? "Logging in..." : "Sign In"}
        </AuthButton>
        <GoogleButton text="Sign in with Google" />
      </form>
    </AuthLayout>
  );
}
