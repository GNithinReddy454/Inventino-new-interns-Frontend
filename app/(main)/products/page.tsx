"use client";
import { Roboto } from "next/font/google";
import ProductCard from "@/app/components/ProductCard";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react"; // Added Suspense
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  Menu,
  Loader2,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import { productService } from "@/services/product.service";
import { normalize } from "@/utils/products.utils";
import { NormalizedProduct } from "@/types/products.type";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  slug: string;
  images: { url: string }[];
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES_LIST = [
  "Bracelets",
  "Earrings",
  "Necklaces",
  "Rings",
  "Accessories",
];
const SORT_OPTIONS = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
];
const ITEMS_PER_PAGE = 9;

const SORT_MAP: Record<string, string> = {
  Featured: "featured",
  "Price: Low to High": "price_asc",
  "Price: High to Low": "price_desc",
  "Newest First": "newest",
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Price Inputs ──────────────────────────────────────────────────────────────
function PriceInputs({
  minPrice,
  maxPrice,
  minPriceFetched,
  maxPriceFetched,
  setMinPrice,
  setMaxPrice,
}: {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minPriceFetched: number | undefined;
  maxPriceFetched: number | undefined;
  setMinPrice: (v: number | undefined) => void;
  setMaxPrice: (v: number | undefined) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Min"
        value={minPrice ?? ""}
        min={0}
        max={maxPrice ?? maxPriceFetched ?? undefined}
        onChange={(e) => {
          if (e.target.value === "") {
            setMinPrice(undefined);
            return;
          }
          const val = Number(e.target.value);
          if (val < 0) return;
          setMinPrice(val);
        }}
        className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D94F7A]"
      />
      <input
        type="number"
        placeholder="Max"
        value={maxPrice ?? ""}
        min={minPrice ?? 0}
        max={maxPriceFetched ?? undefined}
        onChange={(e) => {
          if (e.target.value === "") {
            setMaxPrice(undefined);
            return;
          }
          const val = Number(e.target.value);
          if (val < 0) return;
          setMaxPrice(val);
        }}
        className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D94F7A]"
      />
    </div>
  );
}

/**
 * ─── Inner Content Component ───────────────────────────────────────────────────
 * All logic using useSearchParams moved here to be wrapped by Suspense.
 */
function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter/sort state (initialized from URL)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Products",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "Featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  );
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<{ name: string; show: boolean }>({
    name: "",
    show: false,
  });

  // API state
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [minPriceFetched, setMinPriceFetched] = useState<number | undefined>(
    undefined,
  );
  const [maxPriceFetched, setMaxPriceFetched] = useState<number | undefined>(
    undefined,
  );

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 350);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All Products")
      params.set("category", selectedCategory);
    if (sortBy !== "Featured") params.set("sort", sortBy);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (minPrice !== undefined) params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [
    selectedCategory,
    sortBy,
    debouncedSearch,
    minPrice,
    maxPrice,
    currentPage,
    pathname,
    router,
  ]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, debouncedSearch, minPrice, maxPrice]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Fetch products from API
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: SORT_MAP[sortBy] ?? "featured",
        };
        if (selectedCategory === "All Products") {
          params.type = "all";
        } else {
          params.type = selectedCategory;
        }
        if (debouncedSearch) params.search = debouncedSearch;
        if (minPrice !== undefined) params.price_min = minPrice;
        if (maxPrice !== undefined) params.price_max = maxPrice;

        const res = await productService.getAll(params);
        if (cancelled) return;

        const items: ApiProduct[] = res.data.items ?? [];
        setProducts(items.map(normalize));
        setMeta(res.data.meta);
        setCurrentPage(res.data.meta.page);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    sortBy,
    selectedCategory,
    debouncedSearch,
    minPrice,
    maxPrice,
  ]);

  // Fetch category counts + price bounds once
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await productService.getAll({ limit: 999, type: "all" });
        const items: ApiProduct[] = res.data.items ?? [];
        const counts: Record<string, number> = {};
        let min = Infinity;
        let max = -Infinity;
        items.forEach((p) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
          if (p.price < min) min = p.price;
          if (p.price > max) max = p.price;
        });
        setCategoryCounts(counts);
        setMinPriceFetched(min === Infinity ? undefined : min);
        setMaxPriceFetched(max === -Infinity ? undefined : max);
      } catch {
        // fail silently
      }
    };
    fetchCounts();
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory("All Products");
    setSearchQuery("");
    setSortBy("Featured");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCurrentPage(1);
  }, []);

  const triggerToast = useCallback((name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: "", show: false }), 3500);
  }, []);

  const totalPages = meta?.totalPages ?? 1;
  const totalProducts = meta?.total ?? 0;

  const activeFilterCount = [
    selectedCategory !== "All Products",
    sortBy !== "Featured",
    !!debouncedSearch,
    minPrice !== undefined,
    maxPrice !== undefined,
  ].filter(Boolean).length;

  const getPaginationRange = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3)
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  if (!isClient) return <div className="min-h-screen bg-white" />;

  // ─── FIX: Added `vertical` prop so mobile sidebar forces a column layout ───
  const CategoryList = ({ onSelect, vertical }: { onSelect?: () => void; vertical?: boolean }) => (
    <div
      ref={categoryScrollRef}
      className={
        vertical
          ? "flex flex-col gap-2"
          : "flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:overflow-x-visible scrollbar-hide"
      }
      style={vertical ? undefined : { WebkitOverflowScrolling: "touch" }}
    >
      <button
        onClick={() => { setSelectedCategory("All Products"); onSelect?.(); }}
        className={`flex justify-between items-center w-full text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
        onClick={() => {
          setSelectedCategory("All Products");
          onSelect?.();
        }}
        className={`flex-shrink-0 lg:flex lg:justify-between lg:w-full text-sm font-medium px-3 py-1.5 rounded-full lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent transition-colors ${
          selectedCategory === "All Products"
            ? "bg-[#D94F7A] text-white"
            : "bg-gray-100 text-gray-600 hover:text-[#D94F7A]"
        } ${!vertical ? "lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent flex-shrink-0 " + (selectedCategory === "All Products" ? "lg:text-[#D94F7A]" : "") : ""}`}
      >
        <span>All Products</span>
        <span className={`${vertical ? "inline" : "hidden lg:inline"} bg-pink-100 text-[#D94F7A] px-2 rounded-full text-xs ${selectedCategory === "All Products" && vertical ? "bg-white/30 text-white" : ""}`}>
          {totalProducts || "—"}
        </span>
      </button>

      {CATEGORIES_LIST.map((cat) => {
        const count = categoryCounts[cat] ?? 0;
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); onSelect?.(); }}
            className={`flex justify-between items-center w-full text-sm px-3 py-2 rounded-xl transition-colors ${
            onClick={() => {
              setSelectedCategory(cat);
              onSelect?.();
            }}
            className={`flex-shrink-0 lg:flex lg:justify-between lg:items-center lg:w-full text-sm px-3 py-1.5 rounded-full lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent transition-colors ${
              isActive
                ? "bg-[#D94F7A] text-white font-bold"
                : "bg-gray-100 text-gray-600 hover:text-[#D94F7A]"
            } ${!vertical ? "lg:rounded-none lg:px-0 lg:py-0 lg:bg-transparent flex-shrink-0 " + (isActive ? "lg:text-[#D94F7A]" : "") : ""}`}
          >
            <span>{cat}</span>
            {count > 0 && (
              <span className={`${vertical ? "inline" : "hidden lg:inline"} px-2 py-0.5 rounded-full text-[10px] font-bold ml-auto ${
                isActive ? "bg-white/30 text-white" : "bg-gray-200 text-gray-400"
              }`}>
              <span
                className={`hidden lg:inline px-2 py-0.5 rounded-full text-[10px] font-bold ml-auto ${
                  isActive
                    ? "bg-pink-100 text-[#D94F7A]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen relative">
      {/* Toast */}
      <div
        className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-full py-3 px-6 flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-50 border-l-4 border-l-[#22C55E]">
          <div className="bg-[#22C55E] p-1.5 rounded-full text-white flex-shrink-0">
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 h-full w-72 z-50 overflow-y-auto bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full">
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
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
          {/* ─── FIX: Pass vertical={true} so categories stack in a column ─── */}
          <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <CategoryList onSelect={() => setSidebarOpen(false)} vertical={true} />
          </div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-5 mb-3">Price</h4>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Categories
          </h4>
          <CategoryList onSelect={() => setSidebarOpen(false)} />
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-5 mb-3">
            Price
          </h4>
          <PriceInputs
            minPrice={minPrice}
            maxPrice={maxPrice}
            minPriceFetched={minPriceFetched}
            maxPriceFetched={maxPriceFetched}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-16 h-fit space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
              </div>
            </div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <CategoryList />
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-5 mb-3">
              Price
            </h4>
            <PriceInputs
              minPrice={minPrice}
              maxPrice={maxPrice}
              minPriceFetched={minPriceFetched}
              maxPriceFetched={maxPriceFetched}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCategory}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "Loading…" : `${totalProducts} products found`}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative lg:hidden p-2 rounded-xl border border-gray-200 hover:border-[#D94F7A] transition-colors flex-shrink-0"
              >
                <Menu size={18} className="text-gray-600" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D94F7A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="relative flex-1 sm:w-52">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
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
              <div ref={sortRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-700 hover:border-[#D94F7A] transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline text-gray-400 text-xs">
                    Sort:
                  </span>
                  <span className="font-bold text-gray-900 text-xs">
                    {sortBy}
                  </span>
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
                        onClick={() => {
                          setSortBy(opt);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt ? "text-[#D94F7A] font-bold bg-pink-50" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active chips */}
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
              {minPrice !== undefined && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  Min: ${minPrice}
                  <button onClick={() => setMinPrice(undefined)}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {maxPrice !== undefined && (
                <span className="flex items-center gap-1.5 bg-pink-50 text-[#D94F7A] text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
                  Max: ${maxPrice}
                  <button onClick={() => setMaxPrice(undefined)}>
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm flex items-center gap-3">
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setCurrentPage((p) => p)}
                className="text-xs font-semibold underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                No products found
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Try adjusting your filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  onAdd={triggerToast}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
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
                    onClick={() =>
                      typeof item === "number" && setCurrentPage(item)
                    }
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

/**
 * ─── Main Wrapper ──────────────────────────────────────────────────────────────
 * Provides the required Suspense boundary for useSearchParams build check.
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#D94F7A]" size={48} />
            <p className="text-sm font-medium text-gray-500">
              Loading your treasures...
            </p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
