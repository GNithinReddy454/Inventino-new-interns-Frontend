"use client";
import React from "react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      
      {/* LEFT SIDE - FORM */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <div className="w-80">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            Welcome Back
          </p>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 rounded-md border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            <input
              type="password"
              placeholder="Enter password"
              className="w-full p-2 rounded-md border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            <div className="text-right text-sm text-pink-500 cursor-pointer">
              Forgot Password?
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition duration-300"
            >
              Sign In
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>

            <p className="text-center text-sm">
              New user?{" "}
              <span className="text-pink-600 cursor-pointer">
                Create Account
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="relative w-full h-[78vh] max-h-[900px] rounded-2xl overflow-hidden shadow-2xl border border-pink-100">
          
          <Image
            src="/loginImage.png"
            alt="Elegant Jewellery"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-white text-center px-6">
              <h2 className="text-3xl font-semibold">
                Elegance in Every Detail
              </h2>
              <p className="text-sm mt-2">
                Luxury pink bracelets crafted to shine beautifully.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
