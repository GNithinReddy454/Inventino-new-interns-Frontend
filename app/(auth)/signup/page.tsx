"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/authContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { name: "", email: "", password: "" };
    let hasError = false;

    // Specific Validation Messages
    if (!name.trim()) { 
      newErrors.name = "Please enter your full name"; 
      hasError = true; 
    }
    
    if (!email.includes("@")) { 
      newErrors.email = "Please enter a valid email address"; 
      hasError = true; 
    }

    if (password.length < 6) { 
      newErrors.password = "Password must be at least 6 characters"; 
      hasError = true; 
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const userName = name || email.split("@")[0];
    login({ name: userName, email });
    router.push("/verify-otp");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SIDE - FORM */}
      <div className="flex items-center justify-center px-6 py-10 lg:px-16 bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Inventino" width={160} height={48} className="object-contain" priority />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xs tracking-[0.3em] text-gray-500 uppercase">Luxury Bracelets &amp; Jewelry</h1>
            <h2 className="mt-2 text-2xl font-semibold text-[#E15483]">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* FULL NAME */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Full Name *</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({...prev, name: ""})); }}
                type="text"
                placeholder="Enter your full name"
                className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
                }`}
              />
              {errors.name && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Email *</label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ""})); }}
                type="email"
                placeholder="Enter your email"
                className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
                }`}
              />
              {errors.email && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Password *</label>
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ""})); }}
                type="password"
                placeholder="Create a password"
                className={`w-full rounded-[16px] bg-[#FFE6F0] border px-4 py-[15px] text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-[#F7B9D0] focus:ring-[#E15483]/60"
                }`}
              />
              {errors.password && <p className="text-[#D32F2F] text-xs mt-1 pl-2 font-medium">{errors.password}</p>}
            </div>

            <button type="submit" className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-medium hover:bg-[#d14476] transition-colors mt-2">
              Sign Up
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Already have an account? <Link href="/login" className="text-[#E15483] font-medium hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image src="/images/signup-bg.jpg" alt="Shine With Style" fill priority className="object-cover" />
      </div>
    </div>
  );
}