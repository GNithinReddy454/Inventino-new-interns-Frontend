"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AuthLayout from "../_components/AuthLayout";
import AuthInput from "../_components/AuthInput";
import AuthButton from "../_components/AuthButton";

import { forgotPasswordSchema } from "../schema";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSendLink = (e: React.FormEvent) => {

    e.preventDefault();

    const result = forgotPasswordSchema.safeParse({
      email,
    });

    if (!result.success) {

      const fieldErrors = result.error.flatten().fieldErrors;

      setError(fieldErrors.email?.[0] || "");

      return;

    }

    router.push("/reset-password");

  };

  return (

    <AuthLayout
      title="Forgot Password"
      bgImage="/images/login-bg.jpg"
    >

      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your registered email address and we&apos;ll send you a password reset link.
      </p>

      <form onSubmit={handleSendLink} className="space-y-6">

        <AuthInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            setError("");
          }}
          placeholder="you@example.com"
          error={error}
        />

        <AuthButton>
          Send Reset Link
        </AuthButton>

        <div className="text-center">

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#E15483]"
          >
            <ArrowLeft size={16}/>
            Back to Login
          </Link>

        </div>

      </form>

    </AuthLayout>

  );

}