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
  const [errorMessage, setErrorMessage] = useState("");
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await dispatch(forgotPasswordAction(data.email));

      if (forgotPasswordAction.fulfilled.match(response)) {
        setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
        // Do NOT redirect – let the user check their email.
      } else {
        const errorMsg = (response.payload as string) || "Something went wrong. Please try again.";
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMessage("An unexpected error occurred.");
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

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
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