"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/app/(main)/components/authContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { signupUserAction } from "@/redux/authslice";
import { signupSchema, type SignupFormData } from "../schema";
import { useToast } from "@/app/components/GlobalToast";

import AuthLayout from "../_components/AuthSplitLayout";
import AuthInput from "../_components/AuthInput";
import PasswordInput from "../_components/PasswordInput";
import AuthButton from "../_components/AuthButton";
import GoogleButton from "../_components/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const resultAction = await dispatch(
      signupUserAction({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
    );
    if (signupUserAction.fulfilled.match(resultAction)) {
      const serverUser = resultAction.payload?.data?.user;
      if (serverUser) {
        login(serverUser as any);
        showToast("Account Created!", "Welcome to Inventino Jewels.", "success");
        router.push("/verify-otp");
      }
    } else if (signupUserAction.rejected.match(resultAction)) {
      const errorMessage =
        (resultAction.payload as string) || "Signup failed. Please try again.";
      showToast("Signup Failed", errorMessage, "error");
    }
  };

  return (
    <AuthLayout title="Create Account" bgImage="/images/signup-bg.jpg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Full Name *"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register("name")}
        />

        <AuthInput
          label="Email *"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          label="Phone Number *"
          type="tel"
          placeholder="Enter your phone number"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <PasswordInput
          label="Password *"
          placeholder="Create password"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm Password *"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <AuthButton disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </AuthButton>

        <GoogleButton text="Sign up with Google" />

        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#E15483] font-bold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
