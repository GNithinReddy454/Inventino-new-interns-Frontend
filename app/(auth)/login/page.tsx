"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/(main)/components/authContext";
import { useRouter } from "next/navigation";

import AuthLayout from "../_components/AuthLayout";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";
import PasswordInput from "../_components/PasswordInput";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const router = useRouter();


  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    const newErrors = {
      email: "",
      password: "",
    };

    let hasError = false;

    if (!email.trim()) {
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

    const userName = email.split("@")[0];

    login({
      name: userName,
      email,
    });

    router.push("/");

  };


  return (

    <AuthLayout
      title="Welcome Back"
      bgImage="/images/login-bg.jpg"
    >

      <form onSubmit={handleSubmit} className="space-y-4">

        <AuthInput
          label="Email *"
          type="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            setErrors(prev => ({ ...prev, email: "" }));
          }}
          placeholder="Enter your email"
          error={errors.email}
        />


        <div className="relative">

          <PasswordInput
            label="Password *"
            value={password}
            onChange={(val) => {
              setPassword(val);
              setErrors(prev => ({ ...prev, password: "" }));
            }}
            placeholder="Enter password"
            error={errors.password}
          />

          <Link
            href="/forgot-password"
            className="absolute right-0 top-0 text-[11px] text-[#E15483] hover:underline"
          >
            Forgot Password?
          </Link>

        </div>


        <AuthButton>
          Login
        </AuthButton>


        {/* Google Button (you can convert to reusable later) */}
        <div className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            width={16}
            height={16}
          />

          Login with Google

        </div>


        <p className="text-center text-xs text-gray-500">

          New user?

          <Link
            href="/signup"
            className="text-[#E15483] font-bold ml-1 hover:underline"
          >
            Create Account
          </Link>

        </p>


      </form>

    </AuthLayout>

  );

}