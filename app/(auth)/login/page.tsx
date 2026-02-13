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

    // Contextual Validation Messages
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

    // On success, proceed to home
    router.push("/");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SIDE - FORM */}
      <div className="flex items-center justify-center px-6 py-10 lg:px-16 bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Inventino"
              width={160}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xs tracking-[0.3em] text-gray-500 uppercase">
              Luxury Bracelets &amp; Jewelry
            </h1>
            <h2 className="mt-2 text-2xl font-semibold text-[#E15483]">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ""})); }}
                placeholder="Enter your email"
                className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
                }`}
              />
              {errors.email && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{errors.email}</p>}
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ""})); }}
                placeholder="Enter password"
                className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
                }`}
              />
              {errors.password && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-[#E15483] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-medium shadow-sm hover:bg-[#d14476] transition-colors"
            >
              Sign In
            </button>

            <button
              type="button"
              className="w-full rounded-full border border-gray-300 bg-white py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700">Sign in with Google</span>
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              New user?{" "}
              <Link href="/signup" className="text-[#E15483] font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/login-bg.jpg"
          alt="Elegance in Every Detail"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}