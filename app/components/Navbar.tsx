"use client";

import { useCart } from "@/lib/cartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";

export default function Navbar() {
  const { cartCount } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="w-full bg-gradient-to-r from-pink-400 to-pink-300 py-3 md:py-4 px-4 md:px-6 lg:px-12 flex justify-between items-center shadow-lg flex-wrap gap-3 sticky top-0 z-50">
      <Link href="/">
        <h1 className="text-base md:text-lg font-black text-white tracking-widest hover:text-pink-100 transition cursor-pointer">
          INVENTINO
        </h1>
      </Link>

      <div className="hidden md:flex gap-6 lg:gap-10 text-white font-semibold text-xs lg:text-sm">
        <a href="#" className="hover:text-white transition duration-200 hover:underline underline-offset-2">Home</a>
        <Link href="/shop/all" className="hover:text-white transition duration-200 hover:underline underline-offset-2">Shop</Link>
        <a href="#" className="hover:text-white transition duration-200 hover:underline underline-offset-2">About</a>
        <a href="#" className="hover:text-white transition duration-200 hover:underline underline-offset-2">Contact</a>
      </div>

      <div className="flex gap-3 md:gap-4 items-center">
        <ClientOnly>
          <input
            type="text"
            placeholder="Search..."
            className="hidden md:block px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </ClientOnly>
        <div className="relative cursor-pointer hover:scale-110 transition">
          <span className="text-white text-lg md:text-xl">🛒</span>
          {isClient && cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-white text-lg md:text-xl cursor-pointer hover:scale-110 transition">👤</span>
      </div>
    </nav>
  );
}
