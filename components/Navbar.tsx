"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-pink-500 text-white text-sm py-2 px-4 flex justify-center md:justify-between items-center">
        <p className="text-center md:text-left">
          💖 Valentine’s Day Special – Get 20% OFF on all handmade gifts!
          <span className="ml-2 underline cursor-pointer">Explore Now</span>
        </p>
        <Link href="/about" className="hidden md:block whitespace-nowrap">
          Learn Our Story
        </Link>
      </div>

      {/* MAIN NAVBAR */}
      <div className="bg-pink-100 px-6 md:px-12 py-3 flex justify-between items-center">
        {/* LEFT: LOGO IMAGE */}
        <div className="shrink-0">
          <Link href="/">
            <Image
              src="/logo.png" // place your logo in public/logo.png
              alt="Inventino"
              width={120} // fits nicely
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        {/* CENTER: SEARCH */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for bracelets, necklaces, earrings..."
              className="w-full rounded-full bg-white text-gray-800 placeholder-gray-400 border border-gray-300 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>

        {/* RIGHT: LINKS + ICONS */}
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden lg:flex gap-4 md:gap-6 text-gray-700 text-sm md:text-base">
            <Link href="/about" className="hover:text-pink-600 transition-colors">About</Link>
            <Link href="/AllProducts" className="hover:text-pink-600 transition-colors">All Products</Link>
            <Link href="/stories" className="hover:text-pink-600 transition-colors">Stories</Link>
            <Link href="/contact" className="hover:text-pink-600 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="btn btn-ghost btn-circle p-2">
              <Heart className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button className="btn btn-ghost btn-circle p-2">
              <ShoppingBag className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button className="btn btn-ghost btn-circle p-2">
              <User className="w-4 md:w-5 h-4 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
