"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/login");
    }, 2500);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#fdf8f9] font-inter">
      {/* CSS to hide browser default password icons */}
      <style jsx global>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[344px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-[#4CAF50] rounded-full p-1.5 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-[16px] font-bold text-[#333333] leading-tight">Success!</p>
              <p className="text-[14px] text-[#666666] leading-tight">Password reset successfully</p>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 lg:p-12 shadow-sm text-center border border-pink-50 mx-4">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={110} height={32} priority className="object-contain" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-medium">Luxury Bracelets &amp; Jewelry</h1>
          <h2 className="mt-1 text-xl font-semibold text-[#E15483]">Reset Password</h2>
        </div>

        <form onSubmit={handleReset} noValidate className="space-y-4 text-left">
          {/* NEW PASSWORD */}
          <div className="space-y-1">
            <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">New Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter new password"
                className="w-full rounded-[14px] bg-[#FFE6F0] border border-[#F7B9D0] px-4 py-3 pr-12 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#E15483] transition-all"
                required
              />
              {/* Only show our custom eye when typing */}
              {password.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-1">
            <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Repeat new password"
                className="w-full rounded-[14px] bg-[#FFE6F0] border border-[#F7B9D0] px-4 py-3 pr-12 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#E15483] transition-all"
                required
              />
              {confirmPassword.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{error}</p>}

          <button type="submit" className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all mt-4">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}