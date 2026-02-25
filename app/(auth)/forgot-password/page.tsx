"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { forgotPasswordAction } from "@/redux/authslice";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schema";

import AuthLayout from "../_components/AuthCardLayout";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await dispatch(forgotPasswordAction(data.email));

      if (response.payload) {
        setSuccessMessage("Password reset link sent to your email!");

        setTimeout(() => {
          router.push("/reset-password");
        }, 2000);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your registered email address and we'll send you a password reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <AuthInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthButton disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </AuthButton>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E15483]"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}