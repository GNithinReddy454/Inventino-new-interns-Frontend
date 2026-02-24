"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setTimer(30);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#fdf8f9] p-4 overflow-hidden">

      {/* TOASTER: UPDATED WITH DESCRIPTIVE TEXT */}
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
              {/* DESCRIPTION CHANGE: Descriptive status */}
              <p className="text-[14px] text-[#666666] leading-tight">OTP sent to your email</p>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-[32px] p-8 lg:p-12 shadow-sm text-center border border-pink-50">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={160} height={48} priority className="object-contain" />
        </div>

        <h1 className="text-[24px] font-bold text-gray-900 mb-2">OTP Verification</h1>
        <p className="text-gray-500 text-[14px] font-medium mb-10">Enter the 6-digit code sent to your email.</p>

        <div className="flex gap-2 sm:gap-3 justify-center mb-10">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { if (el) inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-[22px] font-bold border-2 border-gray-300 rounded-2xl focus:border-[#E85D8A] focus:ring-1 focus:ring-[#E85D8A]/20 focus:outline-none transition-all bg-gray-50/20 text-gray-900"
            />
          ))}
        </div>

        <button
          onClick={() => otp.join("").length === 6 && router.push("/all-products")}
          className="w-full h-[52px] bg-[#E85D8A] text-white font-bold py-3.5 rounded-2xl transition-all mb-8 shadow-lg shadow-pink-100 hover:opacity-95 active:scale-95"
        >
          Verify OTP
        </button>

        <p className="text-[15px] font-medium text-[#444444] mb-8">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`font-bold ml-1 transition-colors ${timer > 0 || isResending
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#E85D8A] hover:underline"
              }`}
          >
            {isResending ? "..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          </button>
        </p>

        <Link href="/signup" className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#EC4899] transition-colors text-sm font-semibold">
          <ArrowLeft size={18} /> Back to Signup
        </Link>
      </div>
    </div>
  );
}