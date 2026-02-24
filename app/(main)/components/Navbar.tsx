"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart, User, LogOut, Menu, X, ChevronRight, Package, MapPin, Settings } from "lucide-react";
import { useAuth } from "@/app/(main)/components/authContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/storeContext";
import { useCart } from "@/lib/cartContext";

const Navbar = () => {
  const pathname = usePathname();
  const { savedItems } = useStore();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const bagCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutsideSearch = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/all-products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/all-products");
    }
  };

  // Build a unified searchable master list mapping from static and JSON products
  const masterProductList = [
    // We import these inline to avoid circular issues, or use top level if available.
    // For Next.js dynamic requires safely:
    ...require("@/lib/products").products.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      searchString: `${p.name} ${p.category} ${p.description || ""} ${p.badge || ""}`.toLowerCase()
    })),
    ...require("@/lib/products.json").map((p: any, i: number) => ({
      id: i + 11,
      name: p.title || p.name,
      category: p.category,
      price: p.price,
      image: p.images ? p.images[0] : "",
      searchString: `${p.title || p.name} ${p.category} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase()
    }))
  ];

  const searchResults = searchQuery.trim().length > 1
    ? masterProductList.filter(p => {
      const queryTerms = searchQuery.toLowerCase().split(" ").filter(Boolean);
      return queryTerms.every(term => p.searchString.includes(term));
    }).slice(0, 5) // limit to top 5 hits for UI
    : [];

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

  const iconCircleStyle = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-sm border border-pink-50 hover:text-pink-500 transition-all relative";

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-pink-500 text-white text-sm py-2 px-4 flex justify-center items-center font-sans">
        <p className="text-center">
          💖 Valentine&apos;s Day Special – Get 20% OFF on all handmade gifts!
          {/* UPDATED: Path changed to all-products */}
          <Link href="/all-products" className="ml-2 underline cursor-pointer">Explore Now</Link>
        </p>
      </div>

      {/* MAIN NAVBAR */}
      <header className="sticky top-0 z-50 w-full">
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
            <div className="relative w-full mx-4" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search for bracelets, necklaces, earrings..."
                  className="w-full rounded-full bg-white text-gray-800 placeholder-gray-400 border border-gray-300 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* SEARCH DROPDOWN */}
              {showSearchResults && searchQuery.trim().length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden custom-scrollbar max-h-[80vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      <p className="px-3 pb-1 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Matched Products
                      </p>
                      {searchResults.map((p) => (
                        <Link
                          href={`/all-products/${p.id}`}
                          key={p.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-pink-50 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                            {p.image && (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-bold text-gray-800 truncate group-hover:text-[#E8456A] transition-colors">{p.name}</span>
                            <span className="text-xs text-gray-400 font-medium truncate uppercase">{p.category}</span>
                          </div>
                          <span className="text-sm font-black text-[#E8456A] shrink-0">${p.price.toFixed(2)}</span>
                        </Link>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-2 py-2.5 text-xs font-bold text-pink-600 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors flex items-center justify-center gap-1"
                      >
                        View all results <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-400">
                        <Search size={20} />
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1">No products found</p>
                      <p className="text-xs text-gray-500">Try adjusting your keywords (e.g., &quot;rose gold bracelet&quot;)</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden lg:flex gap-6 text-sm md:text-base items-center font-bold">
              {/* UPDATED: Path changed to all-products */}
              <Link href="/all-products" className={getLinkStyle("/all-products")}>All Products</Link>
              <Link href="/stories" className={getLinkStyle("/stories")}>Stories</Link>
              <Link href="/contact" className={getLinkStyle("/contact")}>Contact</Link>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link href="/wishlist" className={iconCircleStyle}>
                <Heart size={18} />
                {savedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-pink-100 shadow-sm">
                    {savedItems.length}
                  </span>
                )}
              </Link>

              <Link href="/bag" className={iconCircleStyle}>
                <ShoppingCart size={18} />
                {bagCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-pink-100 shadow-sm animate-in zoom-in">
                    {bagCount}
                  </span>
                )}
              </Link>

              <div className="relative flex items-center gap-2 ml-1" ref={dropdownRef}>
                <button
                  onClick={() => user ? setShowDropdown(!showDropdown) : router.push("/login")}
                  onMouseEnter={() => user && setShowDropdown(true)}
                  className={iconCircleStyle}
                >
                  <User size={18} />
                </button>


                {user && showDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-pink-100 rounded-3xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="p-4 border-b border-pink-50 bg-pink-50/30">
                      <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">Your Account</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    </div>

                    <div className="p-2">
                      <Link href="/profile" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors group" onClick={() => setShowDropdown(false)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700"><User size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">My Profile</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link href="/profile/orders" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors group" onClick={() => setShowDropdown(false)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700"><Package size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Orders</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link href="/profile/addresses" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors group" onClick={() => setShowDropdown(false)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700"><MapPin size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Addresses</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link href="/profile/settings" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors group" onClick={() => setShowDropdown(false)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700"><Settings size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Settings</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <button
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 border-t border-pink-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>

        <div className={`absolute right-0 top-0 h-full w-[70%] sm:w-[50%] bg-white border-l-4 border-pink-300 flex flex-col p-6 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center mb-8 pb-4">
            <span className="font-bold text-pink-600 text-xl font-serif">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-pink-50 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {/* UPDATED: Path changed to all-products */}
            <Link href="/all-products" className={getMobileLinkStyle("/all-products")} onClick={() => setIsMenuOpen(false)}>All Products</Link>
            <Link href="/stories" className={getMobileLinkStyle("/stories")} onClick={() => setIsMenuOpen(false)}>Stories</Link>
            <Link href="/contact" className={getMobileLinkStyle("/contact")} onClick={() => setIsMenuOpen(false)}>Contact</Link>

            {user && (
              <Link
                href="/profile"
                className={getMobileLinkStyle("/profile")}
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </Link>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            {!user ? (
              <div className="flex justify-between items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-700 font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} /> Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-pink-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-gray-800 truncate">{user.name}</span>
                    <span className="text-xs text-gray-400 truncate">{user.email}</span>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-50 text-red-500 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> Logout
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