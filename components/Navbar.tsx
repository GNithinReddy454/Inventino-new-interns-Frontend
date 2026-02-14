"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/components/authContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/storeContext";
import { useCart } from "@/lib/cartContext";


const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const { savedItems } = useStore();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const bagCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      if (currentY < 50) setIsVisible(true);
      else if (diff > 4) setIsVisible(false);
      else if (diff < -4) setIsVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `transition-all duration-300 pb-1 ${isActive
      ? "text-pink-600 font-bold border-b-2 border-pink-600"
      : "text-gray-700 hover:text-pink-500 hover:border-b-2 hover:border-pink-300"
      }`;
  };

  const getMobileLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `text-lg font-bold transition-all duration-300 w-fit ${isActive
      ? "text-pink-600"
      : "text-gray-800"
      }`;
  };

  // Standard circular style for buttons - responsive sizing
  const iconCircleStyle = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-sm border border-pink-50 hover:text-pink-500 transition-all relative";

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
        {/* TOP ANNOUNCEMENT BAR */}
        <div className="bg-pink-500 text-white text-sm py-2 px-4 flex justify-center items-center">
          <p className="text-center">
            💖 Valentine's Day Special – Get 20% OFF on all handmade gifts!
            <Link href="/AllProducts" className="ml-2 underline cursor-pointer">Explore Now</Link>
          </p>
        </div>

        {/* MAIN NAVBAR */}
        <div className="bg-pink-100 px-3 sm:px-6 md:px-12 py-2 sm:py-3 flex justify-between items-center">
          <div className="shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Inventino"
                width={120}
                height={40}
                className="object-contain w-20 sm:w-24 md:w-[120px] h-auto"
              />
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

          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden lg:flex gap-6 text-sm md:text-base items-center">
              <Link href="/AllProducts" className={getLinkStyle("/AllProducts")}>All Products</Link>
              <Link href="/stories" className={getLinkStyle("/stories")}>Stories</Link>
              <Link href="/contact" className={getLinkStyle("/contact")}>Contact</Link>
            </nav>

            {/* ACTION BUTTONS: Wishlist -> Cart -> User */}
            <div className="flex items-center gap-1.5 sm:gap-3">

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
                  <div className="hidden lg:flex items-center gap-2">
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

              {/* Hamburger Menu Button - Moved inside the same group for better alignment */}
              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-800 hover:text-pink-600 transition-all flex-shrink-0"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* MOBILE MENU DRAWER - Moved outside header to escape transform context and cover full viewport */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* Drawer Content */}
        <div className={`absolute right-0 top-0 h-full w-[60%] sm:w-[50%] bg-white border-l-4 border-pink-300 flex flex-col p-6 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center mb-8 pb-4">
            <span className="font-bold text-pink-600">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 hover:bg-pink-50 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            <Link
              href="/AllProducts"
              className={getMobileLinkStyle("/AllProducts")}
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            <Link
              href="/stories"
              className={getMobileLinkStyle("/stories")}
              onClick={() => setIsMenuOpen(false)}
            >
              Stories
            </Link>
            <Link
              href="/contact"
              className={getMobileLinkStyle("/contact")}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>

          {/* Footer with Login/Signup or User Profile */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            {!user ? (
              <div className="flex justify-between items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-700 font-semibold hover:text-pink-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="bg-pink-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-pink-700 transition-all shadow-md active:scale-95"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-2 bg-pink-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-gray-800 truncate">{user.name}</span>
                    <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-100 text-red-600 font-semibold hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;