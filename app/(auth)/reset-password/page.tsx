"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { resetPasswordAction } from "@/redux/authslice";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schema";

import AuthLayout from "../_components/AuthCardLayout";
import AuthButton from "../_components/AuthButton";
import PasswordInput from "../_components/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState("");

  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorToast("Invalid or missing password reset token. Please request a new link.");
      return;
    }
    try {
      const response = await dispatch(
        resetPasswordAction({ token, newPassword: data.password })
      );
      if (resetPasswordAction.fulfilled.match(response)) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push("/login");
        }, 2500);
      } else {
        setErrorToast((response.payload as string) || "Failed to reset password");
      }
    } catch {
      setErrorToast("An unexpected error occurred.");
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Success!</p>
              <p className="text-xs text-gray-500">Password reset successfully</p>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorToast && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
            <span>{errorToast}</span>
            <button onClick={() => setErrorToast("")} className="p-1 hover:bg-red-100 rounded-full" type="button">
              <X size={14} className="text-red-700" />
            </button>
          </div>
        )}
        <PasswordInput
          label="New Password *"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          label="Confirm Password *"
          placeholder="Repeat new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <AuthButton disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}