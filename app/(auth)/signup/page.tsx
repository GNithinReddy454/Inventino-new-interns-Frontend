"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/(main)/components/authContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Added Lucide icons

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let hasError = false;

    if (!name.trim()) { newErrors.name = "Please enter your full name"; hasError = true; }
    if (!email.includes("@")) { newErrors.email = "Please enter a valid email address"; hasError = true; }
    if (password.length < 6) { newErrors.password = "Password must be at least 6 characters"; hasError = true; }
    if (password !== confirmPassword) { newErrors.confirmPassword = "Passwords do not match"; hasError = true; }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const userName = name || email.split("@")[0];
    login({ name: userName, email });
    router.push("/verify-otp");
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white font-inter">
      {/* GLOBAL CSS FIX: Hides the default browser eye icon */}
      <style jsx global>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>
      
      <div className="flex flex-col items-center justify-center px-6 py-4 lg:px-16 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md">
          
          <div className="flex justify-center mb-2 lg:mb-4">
            <Image src="/logo.png" alt="Inventino" width={110} height={32} className="object-contain" priority />
          </div>

          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-medium">Luxury Bracelets &amp; Jewelry</h1>
            <h2 className="mt-1 text-xl font-semibold text-[#E15483]">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* NAME INPUT */}
            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Full Name *</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({...prev, name: ""})); }}
                type="text"
                placeholder="Enter your full name"
                className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                  errors.name ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                }`}
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.name}</p>}
            </div>

            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Email *</label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ""})); }}
                type="email"
                placeholder="Enter your email"
                className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                  errors.email ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                }`}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.email}</p>}
            </div>

            {/* PASSWORD INPUT - With Smart Eye Toggle */}
            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Password *</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ""})); }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 pr-12 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                    errors.password ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                  }`}
                />
                {password.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.password}</p>}
            </div>

            {/* CONFIRM PASSWORD INPUT - With Smart Eye Toggle */}
            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-[#555555] tracking-tight">Confirm Password *</label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({...prev, confirmPassword: ""})); }}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  className={`w-full rounded-[14px] bg-[#FFE6F0] border px-4 py-3 pr-12 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                    errors.confirmPassword ? "border-red-500" : "border-[#F7B9D0] focus:border-[#E15483]"
                  }`}
                />
                {confirmPassword.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E15483]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="w-full rounded-full bg-[#E15483] text-white py-3.5 text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all mt-4">
              Sign Up
            </button>

            <div className="w-full rounded-full border border-gray-300 bg-gray-50/50 py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none">
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={16} height={16} className="grayscale opacity-60" />
              <span className="text-gray-500">Sign up with Google</span>
            </div>

            <p className="text-center text-xs text-gray-500 mt-2">
              Already have an account? <Link href="/login" className="text-[#E15483] font-bold hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <Image src="/images/signup-bg.jpg" alt="Luxury Jewelry" fill priority className="object-cover" />
      </div>
    </div>
  );
}