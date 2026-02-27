"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/app/(main)/components/authContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { verifyOtpAction } from "@/redux/authslice";

import AuthLayout from "../_components/AuthCardLayout";
import AuthButton from "../_components/AuthButton";

export default function VerifyOTP() {

  const router = useRouter();
  const { user, login } = useAuth();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  useEffect(() => {

    let interval: ReturnType<typeof setInterval>;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
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


  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {

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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/products");
    
  };

  return (

    <AuthLayout
      title="OTP Verification"
      subtitle="Enter the 6-digit code sent to your email"
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
              <p className="text-sm font-bold text-gray-800">Success!</p>
              <p className="text-xs text-gray-500">OTP sent to your email</p>
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


      <form onSubmit={handleVerify} className="space-y-5">

        {otpError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {otpError}
          </div>
        )}

        {/* OTP inputs */}
        <div className="flex gap-2 sm:gap-3 justify-center">

          {otp.map((digit, index) => (

            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                w-12 h-14
                text-center
                text-xl font-bold
                border border-[#F7B9D0]
                rounded-[14px]
                bg-[#FFE6F0]
                focus:border-[#E15483]
                focus:outline-none
              "
            />

          ))}

        </div>


        <AuthButton disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </AuthButton>


        <p className="text-xs text-gray-500 text-center">

          Didn’t receive the code?

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`font-bold ml-1 ${
              timer > 0 || isResending
                ? "text-gray-400"
                : "text-[#E15483] hover:underline"
            }`}
          >
            {isResending
              ? "Sending..."
              : timer > 0
                ? `Resend in ${timer}s`
                : "Resend OTP"}
          </button>

        </p>


        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#E15483] text-sm font-semibold"
        >
          <ArrowLeft size={18}/>
          Back to Signup
        </Link>

      </form>

    </AuthLayout>

  );

}