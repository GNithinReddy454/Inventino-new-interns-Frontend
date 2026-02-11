"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-pink-500 text-white text-sm py-2 px-4 flex justify-between items-center">
        <p className="text-center w-full">
          💖 Valentine’s Day Special – Get 20% OFF on all handmade gifts!
          <span className="ml-2 underline cursor-pointer">Explore Now</span>
        </p>
        <Link href="/about" className="hidden md:block whitespace-nowrap">
          Learn Our Story
        </Link>
      </div>

      {/* MAIN NAVBAR */}
      <div className="navbar bg-pink-100 px-6">
        {/* LEFT: LOGO */}
        <div className="navbar-start">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Inventino
          </Link>
        </div>

        {/* CENTER: SEARCH */}
        <div className="navbar-center hidden lg:flex w-full max-w-md">
          <div className="relative w-full">
  <input
    type="text"
    placeholder="Search for bracelets, necklaces, earrings..."
    className="w-full rounded-full bg-white text-gray-800 placeholder-gray-400 border border-gray-300 pl-5 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
  />
  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
</div>

        </div>

        {/* RIGHT: LINKS + ICONS */}
        <div className="navbar-end flex items-center gap-6">
          {/* NAV LINKS */}
          <nav className="hidden lg:flex gap-6 text-gray-700">
            <Link href="/about" className="hover:text-pink-600">About</Link>
            <Link href="/shop" className="hover:text-pink-600">Shop</Link>
            <Link href="/stories" className="hover:text-pink-600">Stories</Link>
            <Link href="/contact" className="hover:text-pink-600">Contact</Link>
          </nav>

          {/* ICONS */}
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-circle">
              <Heart className="w-5 h-5" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
