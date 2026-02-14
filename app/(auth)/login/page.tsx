"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: "", password: "" };
    let hasError = false;

    if (!email) {
      newErrors.email = "Please enter your registered email";
      hasError = true;
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Please enter your password";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }
    router.push("/");
  };

  return (
    /* fixed inset-0 prevents mobile scrolling and keeps layout centered */
    <div className="fixed inset-0 w-full h-full overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col items-center justify-center px-6 py-4 lg:px-16 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md">
          
          <div className="flex justify-center mb-2 lg:mb-4">
            <Image
              src="/logo.png"
              alt="Inventino"
              width={120}
              height={36}
              className="object-contain"
              priority
            />
          </div>

          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">
              Luxury Bracelets &amp; Jewelry
            </h1>
            <h2 className="mt-1 text-xl font-semibold text-[#E15483]">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3 lg:space-y-4">
            <div className="space-y-1">
              {/* LABELS: EXACT FIGMA SPECS - 12.7px and #555555 */}
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ""})); }}
                placeholder="Enter your email"
                className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                  errors.email ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                }`}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              {/* LABELS: EXACT FIGMA SPECS - 12.7px and #555555 */}
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ""})); }}
                placeholder="Enter password"
                className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                  errors.password ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                }`}
              />
              {errors.password && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" size={12} className="text-xs font-semibold text-[#E15483] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Login
            </button>

            {/* GOOGLE LOGIN - Improved visibility without "Disabled" text */}
            <div
              className="w-full rounded-full border border-gray-300 bg-gray-50/50 py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none transition-opacity"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={16}
                height={16}
                className="grayscale opacity-60"
              />
              <span className="text-gray-500">Login with Google</span>
            </div>

            <p className="text-center text-xs text-gray-500 mt-2">
              New user?{" "}
              <Link href="/signup" className="text-[#E15483] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/images/login-bg.jpg"
          alt="Luxury Jewelry"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}