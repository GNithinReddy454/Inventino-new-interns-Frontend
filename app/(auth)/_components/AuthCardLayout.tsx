"use client";

import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function AuthCardLayout({
  title,
  children,
}: Props) {

  return (

    <div className="
      fixed inset-0
      flex items-center justify-center
      bg-[#fdf8f9]
      font-inter
      p-4
    ">

      <div className="
        w-full max-w-md
        bg-white
        rounded-[32px]
        p-8 lg:p-12
        shadow-sm
        border border-pink-50
      ">

        {/* LOGO */}
        <div className="flex justify-center mb-6">

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

          <h1 className="
            text-[10px]
            tracking-[0.2em]
            text-gray-400
            uppercase
            font-medium
          ">
            Luxury Bracelets & Jewelry
          </h1>

          <h2 className="
            mt-1
            text-xl
            font-semibold
            text-[#E15483]
          ">
            {title}
          </h2>

        </div>


        {children}

      </div>

    </div>

  );

}