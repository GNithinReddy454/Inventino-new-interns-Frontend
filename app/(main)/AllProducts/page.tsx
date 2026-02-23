"use client";
import ProductCard from "@/app/components/ProductCard";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import productsData from "@/lib/products.json";
import { useStore } from "@/lib/storeContext";
import { useCart } from "@/lib/cartContext";
import { Product } from "@/lib/products";

import { Button } from "@/app/components/ui/button";

// ─── Data Generator ──────────────────────────────────────────────────────────
const TOTAL_PRODUCTS = 156;
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const ALL_PRODUCTS_LIST = Array.from({ length: TOTAL_PRODUCTS }).map((_, index) => {
  const id = index + 1;
  const template = productsData[index % productsData.length] as any;
  const randomCategory = CATEGORIES_LIST[index % CATEGORIES_LIST.length];
  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id,
    category: randomCategory,
    price: stablePrice + 0.99,
    image: template.images ? template.images[0] : template.image,
    images: template.images || [template.image],
    name: template.name || template.title,
    description: template.description || "Handcrafted with natural threads passed down through generations",
    tags: [randomCategory, "Adjustable"],
  };
});

const SORT_OPTIONS = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
];

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [sortBy, setSortBy] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<{ name: string; show: boolean }>({ name: "", show: false });

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 350);
  const itemsPerPage = 9;

  useEffect(() => { setIsClient(true); }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Filtered + sorted products ──────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS_LIST.filter((product) => {
      const categoryMatch =
        selectedCategory === "All Products" || product.category === selectedCategory;
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const searchMatch =
        !debouncedSearch ||
        product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.category?.toLowerCase().includes(debouncedSearch.toLowerCase());
      return categoryMatch && priceMatch && searchMatch;
    });

    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "Newest First") result.sort((a, b) => b.id - a.id);

    return result;
  }, [selectedCategory, priceRange, debouncedSearch, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, priceRange, sortBy, debouncedSearch]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  // ── Price range handlers ────────────────────────────────────────────────────
  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < priceRange[1] - 10) setPriceRange([val, priceRange[1]]);
  };
  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val > priceRange[0] + 10) setPriceRange([priceRange[0], val]);
  };

  // ✅ FIXED: Clamp value to minimum 0 to prevent negative price inputs
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>, type: "min" | "max") => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    if (type === "min") setPriceRange([Math.min(value, priceRange[1] - 10), priceRange[1]]);
    else setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 10)]);
  };

  // Slider fill percentages
  const MAX_PRICE = 1000;
  const minPercent = (priceRange[0] / MAX_PRICE) * 100;
  const maxPercent = (priceRange[1] / MAX_PRICE) * 100;

  // ── Pagination range ────────────────────────────────────────────────────────
  const getPaginationRange = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // ── Toast ───────────────────────────────────────────────────────────────────
  const triggerToast = useCallback((name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: "", show: false }), 3500);
  }, []);

  if (!isClient) return <div className="min-h-screen bg-white" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen relative">

      {/* ── Toast ── */}
      <div
        className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-full py-3 px-6 flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-50 border-l-4 border-l-[#D94F7A]">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white flex-shrink-0">
            <CheckCircle2 size={18} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-[#D94F7A] uppercase tracking-widest leading-none mb-0.5">
              Success!
            </span>
            <span className="text-xs font-bold text-gray-800 truncate max-w-[150px] leading-tight">
              {toast.name} added
            </span>
          </div>
          <button
            onClick={() => setToast({ name: "", show: false })}
            className="ml-2 text-gray-300 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

            {/* Categories heading + Clear */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Categories</h3>
              <button
                onClick={() => { setSelectedCategory("All Products"); setPriceRange([0, 600]); setSearchQuery(""); }}
                className="text-xs text-[#D94F7A] font-medium hover:underline"
              >
                Clear
              </button>
            </div>

            {/* ── Category list — horizontally scrollable on overflow ── */}
            <div
              ref={categoryScrollRef}
              className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:overflow-x-visible scrollbar-hide"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* Mobile: pill-style horizontal scroll; Desktop: vertical list */}
              <button
                onClick={() => setSelectedCategory("All Products")}
                className={`flex-shrink-0 lg:flex lg:justify-between lg:w-full text-sm font-medium px-3 py-1.5 rounded-full lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent transition-colors ${
                  selectedCategory === "All Products"
                    ? "bg-[#D94F7A] text-white lg:bg-transparent lg:text-[#D94F7A]"
                    : "bg-gray-100 text-gray-600 lg:bg-transparent hover:text-[#D94F7A]"
                }`}
              >
                <span>All Products</span>
                <span className="hidden lg:inline bg-pink-100 text-[#D94F7A] px-2 rounded-full text-xs ml-auto">
                  {TOTAL_PRODUCTS}
                </span>
              </button>

              {CATEGORIES_LIST.map((cat) => {
                const count = ALL_PRODUCTS_LIST.filter((p) => p.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 lg:flex lg:justify-between lg:items-center lg:w-full text-sm px-3 py-1.5 rounded-full lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent transition-colors ${
                      isActive
                        ? "bg-[#D94F7A] text-white font-bold lg:bg-transparent lg:text-[#D94F7A]"
                        : "bg-gray-100 text-gray-600 lg:bg-transparent hover:text-[#D94F7A]"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`hidden lg:inline px-2 py-0.5 rounded-full text-[10px] font-bold ml-auto ${
                        isActive ? "bg-pink-100 text-[#D94F7A]" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <hr className="my-5 border-gray-100" />

            {/* ── Price Range ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Price Range</h3>

              {/* Number inputs */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  {/* ✅ FIXED: Added min={0} to prevent negative values via keyboard */}
                  <input
                    type="number"
                    min={0}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceInput(e, "min")}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
                <span className="text-gray-300 font-medium">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    min={0}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceInput(e, "max")}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
              </div>

              {/* ── Dual-thumb range slider with correct color fill ── */}
              <div className="relative h-5 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />

                {/* Colored fill between thumbs */}
                <div
                  className="absolute h-1.5 bg-[#D94F7A] rounded-full pointer-events-none"
                  style={{
                    left: `${minPercent}%`,
                    width: `${maxPercent - minPercent}%`,
                  }}
                />

                {/* Min thumb */}
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={10}
                  value={priceRange[0]}
                  onChange={handleMinSlider}
                  className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb-pink pointer-events-auto"
                  style={{ zIndex: priceRange[0] > MAX_PRICE - 100 ? 5 : 3 }}
                />

                {/* Max thumb */}
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={10}
                  value={priceRange[1]}
                  onChange={handleMaxSlider}
                  className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb-pink pointer-events-auto"
                  style={{ zIndex: 4 }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{filteredProducts.length} products found</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* ── Search with debounce ── */}
              <div className="relative flex-1 sm:w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D94F7A] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* ── Custom Sort dropdown ── */}
              <div ref={sortRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-700 hover:border-[#D94F7A] transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline text-gray-400 text-xs">Sort:</span>
                  <span className="font-bold text-gray-900 text-xs">{sortBy}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt
                            ? "text-[#D94F7A] font-bold bg-pink-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Product Grid ── */}
          {currentProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">No products found</h3>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
              <Button
                variant="outline"
                onClick={() => { setSelectedCategory("All Products"); setPriceRange([0, 600]); setSearchQuery(""); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={triggerToast} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-auto flex justify-center pt-6 border-t border-gray-50 select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-100"
                >
                  <ChevronLeft size={15} />
                </button>

                {getPaginationRange().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => typeof item === "number" && setCurrentPage(item)}
                    disabled={item === "..."}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                      currentPage === item
                        ? "bg-[#D94F7A] text-white border-[#D94F7A] shadow-md shadow-[#D94F7A]/30"
                        : item === "..."
                        ? "bg-transparent text-gray-300 border-transparent cursor-default"
                        : "bg-white text-gray-600 border-gray-100 hover:border-[#D94F7A] hover:text-[#D94F7A]"
                    }`}
                  >
                    {item}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-100"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
