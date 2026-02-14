"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid registered email");
      return;
    }
    // Simulate sending link and move to reset page
    router.push("/reset-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-sm text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Inventino" width={160} height={48} priority />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-8 px-4">
          Enter your registered email address and we&apos;ll send you a password reset link.
        </p>
        <form onSubmit={handleSendLink} className="text-left space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider pl-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm focus:outline-none focus:ring-2 transition-all ${
                error ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
              }`}
            />
            {error && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{error}</p>}
          </div>
          <button type="submit" className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-medium hover:bg-[#d14476] transition-colors">
            Send Reset Link
          </button>
        </form>
        <div className="mt-8">
          <Link href="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}