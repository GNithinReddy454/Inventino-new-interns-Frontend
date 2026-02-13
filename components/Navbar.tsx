"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/components/authContext";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname(); // Get current page path

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY < 50) {
        setIsVisible(true);
      } else if (diff > 4) {
        setIsVisible(false);
      } else if (diff < -4) {
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to handle the active styling logic
  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `transition-all duration-300 pb-1 ${
      isActive 
        ? "text-pink-600 font-bold border-b-2 border-pink-600" // Active style from your screenshot
        : "text-gray-700 hover:text-pink-500 hover:border-b-2 hover:border-pink-300" // Hover style
    }`;
  };

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
              src="/logo.png"
              alt="Inventino"
              width={120}
              height={40}
              className="object-contain"
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
          <nav className="hidden lg:flex gap-4 md:gap-6 text-sm md:text-base items-center h-full">
            <Link href="/about" className={getLinkStyle("/about")}>About</Link>
            <Link href="/AllProducts" className={getLinkStyle("/AllProducts")}>All Products</Link>
            <Link href="/stories" className={getLinkStyle("/stories")}>Stories</Link>
            <Link href="/contact" className={getLinkStyle("/contact")}>Contact</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="btn btn-ghost btn-circle p-2 cursor-pointer">
              <Heart className="w-4 md:w-5 h-4 md:h-5 hover:text-pink-500 transition-colors" />
            </div>
            <button className="btn btn-ghost btn-circle p-2">
              <ShoppingBag className="w-4 md:w-5 h-4 md:h-5 hover:text-pink-500 transition-colors" />
            </button>

            {/* User / Auth actions */}
            <AuthButtons />
          </div>
        </div>
      </div>
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
          className="flex items-center gap-2 text-sm rounded-md px-3 py-1 bg-white border border-gray-200 hover:border-pink-300 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden md:inline">Hi, {user.name.split(" ")[0]}</span>
        </button>
        <button
          onClick={() => logout()}
          className="text-sm px-3 py-1 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/signup" className="btn btn-ghost btn-circle p-2">
        <User className="w-4 md:w-5 h-4 md:h-5 hover:text-pink-600 transition-colors" />
      </Link>
      <Link href="/login" className="hidden md:inline text-sm text-pink-600 font-semibold hover:underline">Login</Link>
    </div>
  );
}