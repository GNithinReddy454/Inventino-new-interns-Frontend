"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/app/(main)/components/authContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { verifyOtpAction, resendOtpAction } from "@/redux/authslice";
import { useToast } from "@/app/components/GlobalToast";

import AuthLayout from "../_components/AuthCardLayout";
import AuthButton from "../_components/AuthButton";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

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

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) {
      setOtpError("Email not found. Please sign up again.");
      return;
    }

    setIsResending(true);
    try {
      const result = await dispatch(resendOtpAction(email));
      if (resendOtpAction.fulfilled.match(result)) {
        setTimer(30);
        showToast("OTP Resent", "A new OTP has been sent to your email.", "success");
      } else {
        const errorMsg = (result.payload as string) || "Failed to resend OTP";
        setOtpError(errorMsg);
      }
    } catch (err) {
      setOtpError("An unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    if (!email) {
      setOtpError("Email not found. Please sign up again.");
      return;
    }

    try {
      const result = await dispatch(verifyOtpAction({ email, otp: otpCode }));

      if (verifyOtpAction.fulfilled.match(result)) {
        // Backend returns token and user data inside `data.user`
        const serverUser = result.payload?.data?.user;
        if (serverUser) {
          login(serverUser); // Log the user in
        }
        showToast("Email Verified!", "Your email has been verified successfully.", "success");
        router.push("/products");
      } else {
        const errorMsg = (result.payload as string) || "OTP verification failed";
        setOtpError(errorMsg);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtpError("An unexpected error occurred.");
    }
  };

  return (
    <AuthLayout
      title="OTP Verification"
      subtitle="Enter the 6-digit code sent to your email"
    >
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
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
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
          <ArrowLeft size={18} />
          Back to Signup
        </Link>
      </form>
    </AuthLayout>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}