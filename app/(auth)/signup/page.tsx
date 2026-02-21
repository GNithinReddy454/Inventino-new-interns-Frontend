"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }
    router.push("/");
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-background font-inter">
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
            <h1 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-medium">
              Luxury Bracelets & Jewelry
            </h1>
            <h2 className="mt-1 text-xl font-semibold text-primary">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-gray-600 tracking-tight">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                placeholder="Enter your email"
                className={`w-full rounded-2xl bg-accent border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${errors.email ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"
                  }`}
              />
              {errors.email && <p className="text-destructive text-[10px] mt-1 pl-1 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[12.7px] font-normal text-gray-600 tracking-tight">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                  placeholder="Enter password"
                  className={`w-full rounded-2xl bg-accent border px-4 py-3 pr-12 text-sm placeholder:text-gray-400 focus:outline-none transition-all ${errors.password ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"
                    }`}
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors.password && <p className="text-destructive text-[10px] mt-1 pl-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-md hover:bg-primary-dark active:scale-[0.98] transition-all"
            >
              Login
            </button>

            <div className="w-full rounded-full border border-border bg-card py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none">
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={16}
                height={16}
                className="grayscale opacity-60"
              />
              <span className="text-muted-foreground">Login with Google</span>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-2">
              New user?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
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