"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 1. Import Router
import { ArrowLeft } from "lucide-react";

export default function VerifyOTP() {
  const router = useRouter(); // 2. Initialize Router
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Navigation Function
  const handleVerify = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 4) {
      // In a real app, you would check the OTP with an API here
      router.push("/AllProducts"); // Sends user to your product list
    } else {
      alert("Please enter the full 4-digit code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm text-center">
        
        <div className="mb-6 flex justify-center">
          <Image 
            src="/logo.png" 
            alt="Inventino Jewels Logo" 
            width={180} 
            height={60} 
            priority
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">OTP Verification</h1>
        <p className="text-gray-500 text-sm mb-8">Enter the 4-digit code sent to your email.</p>

        <div className="flex gap-4 justify-center mb-8">
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
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* 4. Added onClick handler */}
        <button 
          onClick={handleVerify}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-colors mb-6"
        >
          Verify OTP
        </button>

        <p className="text-sm text-gray-500 mb-6">
          Didn&apos;t receive the code? <button className="text-pink-500 font-semibold">Resend OTP</button>
        </p>

        <Link 
          href="/signup" 
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Signup
        </Link>
      </div>
    </div>
  );
}