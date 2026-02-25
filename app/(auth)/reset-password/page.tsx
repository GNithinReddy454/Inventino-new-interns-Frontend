"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { resetPasswordAction } from "@/redux/authslice";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schema";

import AuthLayout from "../_components/AuthCardLayout";
import AuthButton from "../_components/AuthButton";
import PasswordInput from "../_components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await dispatch(
        resetPasswordAction({
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      );

      if (response.payload) {
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
          router.push("/login");
        }, 2500);
      }
    } catch (err) {
      console.error("Reset password error:", err);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[344px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
              >
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