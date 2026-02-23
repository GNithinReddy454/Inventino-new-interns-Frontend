"use client";
import ProductCard from "@/app/components/ProductCard";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  Menu,
} from "lucide-react";
import productsData from "@/lib/products.json";
import { useStore } from "@/lib/storeContext";
import { useCart } from "@/lib/cartContext";
import { Product } from "@/lib/products";
import { Button } from "@/app/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────────────────
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

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Newest First"];

// ─── Debounce ─────────────────────────────────────────────────────────────────
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Read initial state FROM URL params ──────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Products"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 600,
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "Featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<{ name: string; show: boolean }>({ name: "", show: false });

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 350);
  const itemsPerPage = 9;

  useEffect(() => { setIsClient(true); }, []);

  // ── Sync state → URL ────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All Products") params.set("category", selectedCategory);
    if (priceRange[0] !== 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] !== 600) params.set("maxPrice", String(priceRange[1]));
    if (sortBy !== "Featured") params.set("sort", sortBy);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (currentPage > 1) params.set("page", String(currentPage));

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [selectedCategory, priceRange, sortBy, debouncedSearch, currentPage, pathname, router]);

  // ── Close sort on outside click ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Reset page on filter change ─────────────────────────────────────────────
  useEffect(() => { setCurrentPage(1); }, [selectedCategory, priceRange, sortBy, debouncedSearch]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS_LIST.filter((product) => {
      const categoryMatch = selectedCategory === "All Products" || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
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

  // ── Clear all filters ───────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSelectedCategory("All Products");
    setPriceRange([0, 600]);
    setSearchQuery("");
    setSortBy("Featured");
    setCurrentPage(1);
  }, []);

  // ── Price handlers ──────────────────────────────────────────────────────────
  const MAX_PRICE = 1000;
  const minPercent = (priceRange[0] / MAX_PRICE) * 100;
  const maxPercent = (priceRange[1] / MAX_PRICE) * 100;

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < priceRange[1] - 10) setPriceRange([val, priceRange[1]]);
  };
  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val > priceRange[0] + 10) setPriceRange([priceRange[0], val]);
  };
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>, type: "min" | "max") => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    if (type === "min") setPriceRange([Math.min(value, priceRange[1] - 10), priceRange[1]]);
    else setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 10)]);
  };

  // ── Pagination range ────────────────────────────────────────────────────────
  const getPaginationRange = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // ── Toast ───────────────────────────────────────────────────────────────────
  const triggerToast = useCallback((name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: "", show: false }), 3500);
  }, []);

  // ── Active filter count badge ───────────────────────────────────────────────
  const activeFilterCount = [
    selectedCategory !== "All Products",
    priceRange[0] !== 0 || priceRange[1] !== 600,
    sortBy !== "Featured",
    !!debouncedSearch,
  ].filter(Boolean).length;

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

      {/* ── Mobile Backdrop ── */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Layout: col on mobile, row on desktop ── */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside
          className={`
            w-72 flex-shrink-0 space-y-4
            fixed left-0 top-0 h-full z-50 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:z-auto md:h-fit md:overflow-visible
            lg:sticky lg:top-32
          `}
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full md:h-auto">

            {/* Sidebar header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="bg-[#D94F7A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#D94F7A] font-medium hover:underline"
                >
                  Clear all
                </button>
                {/* Close button (mobile only) */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <div
              ref={categoryScrollRef}
              className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:overflow-x-visible scrollbar-hide"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
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
                    onClick={() => { setSelectedCategory(cat); setSidebarOpen(false); }}
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

            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Price Range
              </h4>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number" min={0} value={priceRange[0]}
                    onChange={(e) => handlePriceInput(e, "min")}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
                <span className="text-gray-300 font-medium">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number" min={0} value={priceRange[1]}
                    onChange={(e) => handlePriceInput(e, "max")}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
              </div>

              <div className="relative h-5 flex items-center">
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
                <div
                  className="absolute h-1.5 bg-[#D94F7A] rounded-full pointer-events-none"
                  style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                />
                <input
                  type="range" min={0} max={MAX_PRICE} step={10}
                  value={priceRange[0]} onChange={handleMinSlider}
                  className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer range-thumb-pink pointer-events-auto"
                  style={{ zIndex: priceRange[0] > MAX_PRICE - 100 ? 5 : 3 }}
                />
                <input
                  type="range" min={0} max={MAX_PRICE} step={10}
                  value={priceRange[1]} onChange={handleMaxSlider}
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
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-w-0">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{filteredProducts.length} products found</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">

              {/* ── Hamburger with filter badge (mobile only) ── */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative md:hidden p-2 rounded-xl border border-gray-200 hover:border-[#D94F7A] transition-colors flex-shrink-0"
              >
                <Menu size={18} className="text-gray-600" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D94F7A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* ── Search ── */}
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

              {/* ── Sort dropdown ── */}
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

          {/* ── Active filter chips ── */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedCategory !== "All Products" && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All Products")}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {(priceRange[0] !== 0 || priceRange[1] !== 600) && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  ${priceRange[0]} – ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 600])}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {sortBy !== "Featured" && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  {sortBy}
                  <button onClick={() => setSortBy("Featured")}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  "{debouncedSearch}"
                  <button onClick={() => setSearchQuery("")}>
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Product Grid ── */}
          {currentProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">No products found</h3>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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