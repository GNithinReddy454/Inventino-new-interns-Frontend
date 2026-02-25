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

import AuthLayout from "../_components/AuthSplitLayout";
import AuthInput from "../_components/AuthInput";
import PasswordInput from "../_components/PasswordInput";
import AuthButton from "../_components/AuthButton";
import GoogleButton from "../_components/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await dispatch(
        signupUserAction({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        })
      ).unwrap();

      const serverUser = result?.data?.user;
      if (serverUser) {
        login(serverUser as any);
        router.push("/verify-otp");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <AuthLayout title="Create Account" bgImage="/images/signup-bg.jpg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

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
          <Link href="/login" className="text-[#E15483] font-bold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}