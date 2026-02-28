"use client";

import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  /** optional descriptive text shown below title */
  subtitle?: string;
  children: React.ReactNode;
  bgImage?: string; // ✅ optional
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  bgImage = "/auth-bg.jpg", // default image
}: Props) {
  return (
    <div className="fixed inset-0 w-full h-full grid grid-cols-1 lg:grid-cols-2 bg-white font-inter">
      {/* LEFT */}
      <div className="flex items-center justify-center px-6 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Inventino"
              width={110}
              height={32}
              priority
            />
          </div>

          {/* HEADING */}
          <div className="text-center mb-6">
            <h1 className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">
              Luxury Bracelets & Jewelry
            </h1>

            <h2 className="mt-1 text-xl font-semibold text-[#E15483]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative hidden lg:block">
        <Image
          src={bgImage}
          alt="Auth"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
