"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-sm text-center border border-gray-100">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="Inventino" 
            width={160} 
            height={48} 
            priority 
          />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter your new password below to complete the reset process.
        </p>

        <div className="text-left space-y-6">
          {/* NEW PASSWORD INPUT */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider pl-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-[16px] bg-[#FFE6F0] border border-[#F7B9D0] px-4 py-[15px] text-sm focus:outline-none focus:ring-2 focus:ring-[#E15483]/60 transition-all placeholder:text-gray-400"
              />
              {/* Icon logic: Only shows when typing and picks only ONE icon */}
              {newPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#E15483]"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* CONFIRM PASSWORD INPUT */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider pl-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter confirm password"
                className="w-full rounded-[16px] bg-[#FFE6F0] border border-[#F7B9D0] px-4 py-[15px] text-sm focus:outline-none focus:ring-2 focus:ring-[#E15483]/60 transition-all placeholder:text-gray-400"
              />
              {/* Icon logic: Only shows when typing and picks only ONE icon */}
              {confirmPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#E15483]"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>

          <button className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-medium shadow-sm hover:bg-[#d14476] transition-colors mt-2">
            Reset Password
          </button>
        </div>

        <div className="mt-8">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> 
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}