"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

import AuthLayout from "../_components/AuthLayout";
import AuthButton from "../_components/AuthButton";

export default function VerifyOTP() {

  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  // Timer
  useEffect(() => {

    let interval: ReturnType<typeof setInterval>;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);

  }, [timer]);


  // Input change
  const handleChange = (index: number, value: string) => {

    if (!/^\d*$/.test(value)) return;

    setOtp(prev => {

      const newOtp = [...prev];
      newOtp[index] = value.slice(-1);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      return newOtp;

    });

  };


  // Backspace navigation
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

  };


  // Resend OTP
  const handleResend = () => {

    setIsResending(true);

    setTimeout(() => {

      setIsResending(false);
      setTimer(30);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 4000);

    }, 1000);

  };


  // Verify OTP
  const handleVerify = (e: React.FormEvent) => {

    e.preventDefault();

    if (otp.join("").length === 6) {
      router.push("/all-products");
    }

  };


  return (

    <AuthLayout
      title="OTP Verification"
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
                OTP sent to your email
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
      <form onSubmit={handleVerify} className="space-y-4">


        <p className="text-xs text-gray-500 text-center">
          Enter the 6-digit code sent to your email
        </p>


        {/* OTP Inputs */}
        <div className="flex gap-2 sm:gap-3 justify-center">

          {otp.map((digit, index) => (

            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(index, e.target.value)
              }
              onKeyDown={(e) =>
                handleKeyDown(index, e)
              }
              className="
                w-11 h-13
                text-center
                text-lg font-bold
                border border-[#F7B9D0]
                rounded-[14px]
                bg-[#FFE6F0]
                focus:border-[#E15483]
                focus:outline-none
              "
            />

          ))}

        </div>


        <AuthButton>
          Verify OTP
        </AuthButton>


        {/* Resend */}
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


        {/* Back */}
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#E15483] transition-colors text-sm font-semibold"
        >

          <ArrowLeft size={18}/>
          Back to Signup

        </Link>


      </form>

    </AuthLayout>

  );

}