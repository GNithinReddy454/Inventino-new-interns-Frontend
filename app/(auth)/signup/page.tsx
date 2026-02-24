"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(main)/components/authContext";

import AuthLayout from "../_components/AuthLayout";
import AuthInput from "../_components/AuthInput";
import PasswordInput from "../_components/PasswordInput";
import AuthButton from "../_components/AuthButton";
import GoogleButton from "../_components/GoogleButton";

type Errors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {

  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const newErrors: Errors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasError = false;


    if (!name.trim()) {
      newErrors.name = "Please enter your full name";
      hasError = true;
    }


    if (!email.trim()) {
      newErrors.email = "Please enter your email";
      hasError = true;
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }


    if (!password) {
      newErrors.password = "Please create a password";
      hasError = true;
    }
    else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }


    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
      hasError = true;
    }
    else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }


    if (hasError) {
      setErrors(newErrors);
      return;
    }


    login({
      name: name || email.split("@")[0],
      email,
    });

    router.push("/verify-otp");

  };


  return (

    <AuthLayout
      title="Create Account"
      bgImage="/images/signup-bg.jpg"
    >

      <form onSubmit={handleSubmit} className="space-y-4">


        <AuthInput
          label="Full Name *"
          value={name}
          placeholder="Enter your full name"
          error={errors.name}
          onChange={(value) => {
            setName(value);
            setErrors(prev => ({
              ...prev,
              name: "",
            }));
          }}
        />


        <AuthInput
          label="Email *"
          type="email"
          value={email}
          placeholder="Enter your email"
          error={errors.email}
          onChange={(value) => {
            setEmail(value);
            setErrors(prev => ({
              ...prev,
              email: "",
            }));
          }}
        />


        <PasswordInput
          label="Password *"
          value={password}
          placeholder="Create password"
          error={errors.password}
          onChange={(value) => {
            setPassword(value);
            setErrors(prev => ({
              ...prev,
              password: "",
            }));
          }}
        />


        <PasswordInput
          label="Confirm Password *"
          value={confirmPassword}
          placeholder="Repeat password"
          error={errors.confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setErrors(prev => ({
              ...prev,
              confirmPassword: "",
            }));
          }}
        />


        <AuthButton>
          Sign Up
        </AuthButton>


        <GoogleButton text="Sign up with Google" />


        <p className="text-center text-xs text-gray-500">

          Already have an account?{" "}

          <Link
            href="/login"
            className="text-[#E15483] font-bold hover:underline"
          >
            Login
          </Link>

        </p>


      </form>

    </AuthLayout>

  );

}