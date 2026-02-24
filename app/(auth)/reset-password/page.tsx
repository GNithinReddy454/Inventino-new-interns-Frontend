"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import AuthLayout from "../_components/AuthLayout";
import AuthButton from "../_components/AuthButton";
import PasswordInput from "../_components/PasswordInput";

interface ResetErrors {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<ResetErrors>({
    password: "",
    confirmPassword: "",
  });

  const [showToast, setShowToast] = useState(false);


  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const newErrors: ResetErrors = {
      password: "",
      confirmPassword: "",
    };

    let hasError = false;

    if (!password) {
      newErrors.password = "Please enter new password";
      hasError = true;
    }
    else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    }
    else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      router.push("/login");
    }, 2500);

  };


  return (

    <AuthLayout
      title="Reset Password"
      bgImage="/images/login-bg.jpg"
    >

      {/* Toast */}
      {showToast && (

        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[344px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="bg-green-500 rounded-full p-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div>

              <p className="text-sm font-bold text-gray-800">
                Success!
              </p>

              <p className="text-xs text-gray-500">
                Password reset successfully
              </p>

            </div>

          </div>

          <button
            onClick={() => setShowToast(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} className="text-gray-400"/>
          </button>

        </div>

      )}


      {/* Form */}
      <form onSubmit={handleReset} className="space-y-4">


        <PasswordInput
          label="New Password *"
          value={password}
          placeholder="Enter new password"
          error={errors.password}
          onChange={(val) => {
            setPassword(val);
            setErrors(prev => ({
              ...prev,
              password: "",
            }));
          }}
        />


        <PasswordInput
          label="Confirm Password *"
          value={confirmPassword}
          placeholder="Repeat new password"
          error={errors.confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            setErrors(prev => ({
              ...prev,
              confirmPassword: "",
            }));
          }}
        />


        <AuthButton>
          Reset Password
        </AuthButton>


      </form>

    </AuthLayout>

  );

}