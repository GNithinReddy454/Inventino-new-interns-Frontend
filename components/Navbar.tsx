"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/authContext";
<<<<<<< HEAD
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname.toLowerCase().startsWith(href.toLowerCase());
  };
=======
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      // Always show near the very top of the page
      if (currentY < 50) {
        setIsVisible(true);
      } else if (diff > 4) {
        // Scrolling down
        setIsVisible(false);
      } else if (diff < -4) {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

>>>>>>> e291063f06935df18466541aac041349f33c7199
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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
              className="object-contain" // Tailwind class helps too
              style={{ width: "auto", height: "auto" }}
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
            <Link
              href="/about"
              className={isActive("/about") ? "text-pink-600 underline decoration-pink-500 underline-offset-4 font-semibold" : "hover:text-pink-600 transition-colors"}
            >
              About
            </Link>
            <Link
              href="/AllProducts"
              className={isActive("/AllProducts") ? "text-pink-600 underline decoration-pink-500 underline-offset-4 font-semibold" : "hover:text-pink-600 transition-colors"}
            >
              All Products
            </Link>
            <Link
              href="/stories"
              className={isActive("/stories") ? "text-pink-600 underline decoration-pink-500 underline-offset-4 font-semibold" : "hover:text-pink-600 transition-colors"}
            >
              Stories
            </Link>
            <Link
              href="/contact"
              className={isActive("/contact") ? "text-pink-600 underline decoration-pink-500 underline-offset-4 font-semibold" : "hover:text-pink-600 transition-colors"}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="btn btn-ghost btn-circle p-2">
              <Heart className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <button className="btn btn-ghost btn-circle p-2">
              <ShoppingBag className="w-4 md:w-5 h-4 md:h-5" />
            </button>

            {/* User / Auth actions */}
            <AuthButtons />

            {/* Mobile hamburger: placed to the right of login icon on small screens */}
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 rounded-md bg-white/0 hover:bg-white/50"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo.png" alt="Inventino" width={100} height={34} className="object-contain" />
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-md"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-6 text-lg">
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className={isActive("/about") ? "text-pink-600 underline decoration-pink-500 underline-offset-4" : "text-gray-800"}
            >
              About
            </Link>
            <Link
              href="/AllProducts"
              onClick={() => setMenuOpen(false)}
              className={isActive("/AllProducts") ? "text-pink-600 underline decoration-pink-500 underline-offset-4" : "text-gray-800"}
            >
              All Products
            </Link>
            <Link
              href="/stories"
              onClick={() => setMenuOpen(false)}
              className={isActive("/stories") ? "text-pink-600 underline decoration-pink-500 underline-offset-4" : "text-gray-800"}
            >
              Stories
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className={isActive("/contact") ? "text-pink-600 underline decoration-pink-500 underline-offset-4" : "text-gray-800"}
            >
              Contact
            </Link>
          </nav>

          <div className="mt-auto">
            <div className="flex gap-3">
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-2 bg-pink-500 text-white rounded-md">Sign up</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 border rounded-md">Login</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

function AuthButtons() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-sm rounded-md px-3 py-1 bg-white border"
        >
          <User className="w-4 h-4" />
          <span className="hidden md:inline">Hi, {user.name.split(" ")[0]}</span>
        </button>
        <button
          onClick={() => logout()}
          className="text-sm px-3 py-1 rounded-md bg-pink-500 text-white hover:bg-pink-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/signup" className="btn btn-ghost btn-circle p-2">
        <User className="w-4 md:w-5 h-4 md:h-5" />
      </Link>
      <Link href="/signup" className="hidden md:inline text-sm text-pink-600">Login</Link>
    </div>
  );
}
