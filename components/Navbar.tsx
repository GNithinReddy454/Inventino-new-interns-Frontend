"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart, User, LogOut } from "lucide-react"; // Switched to ShoppingCart
import { useAuth } from "@/components/authContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/storeContext"; 

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const { bag, savedItems } = useStore();
  const { user, logout } = useAuth();
  const router = useRouter();

  const bagCount = bag.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      if (currentY < 50) setIsVisible(true);
      else if (diff > 4) setIsVisible(false);
      else if (diff < -4) setIsVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `transition-all duration-300 pb-1 ${
      isActive 
        ? "text-pink-600 font-bold border-b-2 border-pink-600" 
        : "text-gray-700 hover:text-pink-500 hover:border-b-2 hover:border-pink-300"
    }`;
  };

  // Standard circular style for buttons
  const iconCircleStyle = "w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-sm border border-pink-50 hover:text-pink-500 transition-all relative";

  return (
    <header className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-pink-500 text-white text-sm py-2 px-4 flex justify-center md:justify-between items-center">
        <p className="text-center md:text-left">
          💖 Valentine’s Day Special – Get 20% OFF on all handmade gifts!
          <span className="ml-2 underline cursor-pointer">Explore Now</span>
        </p>
        <Link href="/about" className="hidden md:block whitespace-nowrap">Learn Our Story</Link>
      </div>

      {/* MAIN NAVBAR */}
      <div className="bg-pink-100 px-6 md:px-12 py-3 flex justify-between items-center">
        <div className="shrink-0">
          <Link href="/">
            <Image src="/logo.png" alt="Inventino" width={120} height={40} className="object-contain" style={{ width: "auto", height: "auto" }} />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 justify-center max-w-md">
          <div className="relative w-full mx-4">
            <input
              type="text"
              placeholder="Search for bracelets, necklaces, earrings..."
              className="w-full rounded-full bg-white text-gray-800 placeholder-gray-400 border border-gray-300 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex gap-6 text-sm md:text-base items-center">
            <Link href="/about" className={getLinkStyle("/about")}>About</Link>
            <Link href="/AllProducts" className={getLinkStyle("/AllProducts")}>All Products</Link>
            <Link href="/stories" className={getLinkStyle("/stories")}>Stories</Link>
            <Link href="/contact" className={getLinkStyle("/contact")}>Contact</Link>
          </nav>

          {/* ACTION BUTTONS: Wishlist -> Cart -> User */}
          <div className="flex items-center gap-3">
            
            {/* 1. Wishlist */}
            <Link href="/wishlist" className={iconCircleStyle}>
              <Heart size={18} />
              {savedItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-pink-100 shadow-sm">
                  {savedItems.length}
                </span>
              )}
            </Link>

            {/* 2. Shopping Cart */}
            <Link href="/bag" className={iconCircleStyle}>
              <ShoppingCart size={18} />
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-pink-100 shadow-sm animate-in zoom-in">
                  {bagCount}
                </span>
              )}
            </Link>

            {/* 3. User Icon / Status */}
            <div className="flex items-center gap-2 ml-1">
              <Link href={user ? "/profile" : "/login"} className={iconCircleStyle}>
                <User size={18} />
              </Link>
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                  <button 
                    onClick={() => logout()} 
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;