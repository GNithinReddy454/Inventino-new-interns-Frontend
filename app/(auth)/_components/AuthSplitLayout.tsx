"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bgImage?: string;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  bgImage = "/auth-bg.jpg",
}: Props) {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-inter overflow-hidden">
      {/* LEFT */}
      <div className="h-full overflow-hidden flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md" style={{ zoom: "0.90" }}>
          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Inventino"
                width={110}
                height={32}
                priority
              />
            </Link>
          </div>

          {/* HEADING */}
          <div className="text-center mb-2">
            <h1 className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">
              Luxury Bracelets & Jewelry
            </h1>
            <h2 className="mt-0.5 text-xl font-semibold text-[#E15483]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-600 text-center">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden lg:block relative h-screen">
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