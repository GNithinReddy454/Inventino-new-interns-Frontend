"use client";

import ProductCard from "@/app/components/ProductCard";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
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
import { productService, ProductApiItem } from "@/services/product.service";
import { normalize } from "@/utils/products.utils";
import {
  NormalizedProduct,
  ProductListMeta,
  GetAllProductsParams,
} from "@/types/products.type";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const CATEGORIES_LIST = [
  "Bracelets",
  "Necklaces",
  "Rings",
  "Hair Accessories",
  "Bag Charms",
  "Shoe Charms",
  "Kids Jewelry",
  "Women Watches",
] as const;

const SORT_OPTIONS = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest First",
] as const;

type SortLabel = (typeof SORT_OPTIONS)[number];

const SORT_MAP: Record<SortLabel, GetAllProductsParams["sort"]> = {
  Featured: "featured",
  "Price: Low to High": "priceAsc",
  "Price: High to Low": "priceDesc",
  "Newest First": "newest",
};

const SORT_MAP_REVERSE: Record<string, SortLabel> = {
  featured: "Featured",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low",
  newest: "Newest First",
};

const ITEMS_PER_PAGE = 9;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="mt-3 h-8 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function PriceRange({
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
  const rangeMin = minPriceFetched ?? 0;
  const rangeMax = maxPriceFetched ?? 10000;
  const currentMin = minPrice ?? rangeMin;
  const currentMax = maxPrice ?? rangeMax;

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-3">
        <input
          type="number"
          value={currentMin}
          min={rangeMin}
          max={currentMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= currentMax) {
              setMinPrice(val === rangeMin ? undefined : val);
            }
          }}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors focus:border-[#D94F7A] focus:outline-none"
        />
        <input
          type="number"
          value={currentMax}
          min={currentMin}
          max={rangeMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= currentMin) {
              setMaxPrice(val === rangeMax ? undefined : val);
            }
          }}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors focus:border-[#D94F7A] focus:outline-none"
        />
      </div>

      <div className="relative flex h-5 items-center">
        <div className="absolute h-1.5 w-full rounded-full bg-gray-200" />
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#D94F7A]"
          style={{
            width: `${
              rangeMax === rangeMin
                ? 100
                : ((currentMax - rangeMin) / (rangeMax - rangeMin)) * 100
            }%`,
          }}
        />
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          value={currentMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= currentMin) {
              setMaxPrice(val === rangeMax ? undefined : val);
            }
          }}
          className="range-thumb-pink absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSort: SortLabel =
    SORT_MAP_REVERSE[searchParams.get("sort") ?? ""] ?? "Featured";

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Products"
  );
  const [sortBy, setSortBy] = useState<SortLabel>(initialSort);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined
  );

  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<{ name: string; show: boolean }>({
    name: "",
    show: false,
  });
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [meta, setMeta] = useState<ProductListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [minPriceFetched, setMinPriceFetched] = useState<number | undefined>();
  const [maxPriceFetched, setMaxPriceFetched] = useState<number | undefined>();
  const [globalTotal, setGlobalTotal] = useState(0);

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 600);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== "All Products") {
      params.set("category", selectedCategory);
    }

    const apiSort = SORT_MAP[sortBy];
    if (apiSort && apiSort !== "featured") {
      params.set("sort", apiSort);
    }

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }

    if (minPrice !== undefined) {
      params.set("minPrice", String(minPrice));
    }

    if (maxPrice !== undefined) {
      params.set("maxPrice", String(maxPrice));
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    router.replace(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, debouncedSearch, minPrice, maxPrice]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let items: ProductApiItem[] = [];
        let metaData: ProductListMeta = {
          total: 0,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          totalPages: 1,
        };

        if (debouncedSearch?.trim()) {
          const res = await productService.searchProducts(
            debouncedSearch.trim(),
            currentPage,
            ITEMS_PER_PAGE
          );
          items = res.data?.data?.items ?? [];
          metaData = res.data?.data?.meta ?? metaData;
        } else if (
          sortBy === "Featured" &&
          selectedCategory === "All Products" &&
          minPrice === undefined &&
          maxPrice === undefined
        ) {
          const res = await productService.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          });
          items = res.data?.data?.items ?? [];
          metaData = res.data?.data?.meta ?? metaData;
        } else {
          const params: GetAllProductsParams = {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          };

          const apiSort = SORT_MAP[sortBy];
          if (apiSort && apiSort !== "featured") {
            params.sort = apiSort;
          }
          if (selectedCategory !== "All Products") {
            params.category = selectedCategory;
          }
          if (minPrice !== undefined) {
            params.minPrice = minPrice;
          }
          if (maxPrice !== undefined) {
            params.maxPrice = maxPrice;
          }

          const res = await productService.getAll(params);
          items = res.data?.data?.items ?? [];
          metaData = res.data?.data?.meta ?? metaData;
        }

        if (cancelled) return;

        setProducts(items.map((item) => normalize(item)));
        setMeta(metaData);
      } catch (err: unknown) {
        if (!cancelled) {
          const apiError = err as ApiError;
          const msg =
            apiError?.response?.data?.message ||
            apiError?.message ||
            "Failed to load products.";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await productService.getAll({ limit: 999, page: 1 });
        const items: ProductApiItem[] = res.data?.data?.items ?? [];

        setGlobalTotal(res.data?.data?.meta?.total ?? items.length);

        const counts: Record<string, number> = {};
        let min = Infinity;
        let max = -Infinity;

        items.forEach((p) => {
          const key = (p.category || "")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          counts[key] = (counts[key] || 0) + 1;

          const price = p.discountPrice ?? p.price ?? 0;
          if (price < min) min = price;
          if (price > max) max = price;
        });

        setCategoryCounts(counts);
        setMinPriceFetched(min === Infinity ? undefined : min);
        setMaxPriceFetched(max === -Infinity ? undefined : max);
      } catch {
        // silent
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
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  if (!isClient) {
    return <div className="min-h-screen bg-white" />;
  }

  const priceProps = {
    minPrice,
    maxPrice,
    minPriceFetched,
    maxPriceFetched,
    setMinPrice,
    setMaxPrice,
  };

  const CategoryList = ({
    onSelect,
    vertical,
  }: {
    onSelect?: () => void;
    vertical?: boolean;
  }) => (
    <div
      ref={categoryScrollRef}
      className={
        vertical
          ? "flex flex-col gap-2"
          : "scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0"
      }
      style={vertical ? undefined : { WebkitOverflowScrolling: "touch" }}
    >
      <button
        onClick={() => {
          setSelectedCategory("All Products");
          onSelect?.();
        }}
        className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full transition-colors lg:flex lg:w-full lg:justify-between lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 ${
          selectedCategory === "All Products"
            ? "bg-[#D94F7A] text-white lg:bg-transparent lg:text-[#D94F7A]"
            : "bg-gray-100 text-gray-600 hover:text-[#D94F7A]"
        }`}
      >
        <span>All Products</span>
        <span
          className={`rounded-full bg-pink-100 px-2 text-xs text-[#D94F7A] ${
            vertical ? "inline" : "hidden lg:inline"
          }`}
        >
          {globalTotal || "—"}
        </span>
      </button>

      {CATEGORIES_LIST.map((cat) => {
        const count = categoryCounts[cat] ?? 0;
        const isActive = selectedCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              onSelect?.();
            }}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 ${
              isActive
                ? "bg-[#D94F7A] font-bold text-white lg:bg-transparent lg:text-[#D94F7A]"
                : "bg-gray-100 text-gray-600 hover:text-[#D94F7A]"
            }`}
          >
            <span>{cat}</span>
            {count > 0 && (
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  vertical ? "inline" : "hidden lg:inline"
                } ${
                  isActive
                    ? "bg-[#D94F7A] text-white"
                    : "bg-gray-200 text-gray-400"
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
    <div className="relative min-h-screen max-w-7xl mx-auto bg-gray-50/50 px-4 py-8 font-sans">
      <div
        className={`fixed bottom-8 right-8 z-100 transform transition-all duration-500 ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-12 opacity-0"
        }`}
      >
        <div className="flex items-center gap-4 rounded-full border border-gray-50 border-l-4 border-l-[#22C55E] bg-white px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
          <div className="shrink-0 rounded-full bg-[#22C55E] p-1.5 text-white">
            <CheckCircle2 size={18} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="mb-0.5 text-[11px] font-black uppercase tracking-widest leading-none text-[#D94F7A]">
              Success!
            </span>
            <span className="max-w-37.5 truncate text-xs font-bold leading-tight text-gray-800">
              {toast.name} added
            </span>
          </div>
          <button
            onClick={() => setToast({ name: "", show: false })}
            className="ml-2 text-gray-300 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-72 transform flex-col bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-gray-100 px-6 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D94F7A] text-[10px] font-black text-white">
                  {activeFilterCount}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#D94F7A] hover:underline"
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
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Categories
            </h4>
            <CategoryList onSelect={() => setSidebarOpen(false)} vertical />
          </div>
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Price Range
            </h4>
            <PriceRange {...priceProps} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden lg:block lg:w-80 lg:shrink-0">
          <div className="sticky top-24 self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 pb-10 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D94F7A] text-[10px] font-black text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-[#D94F7A] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Categories
                  </h4>
                  <CategoryList />
                </div>
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Price Range
                  </h4>
                  <PriceRange {...priceProps} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4 flex flex-col gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory}
                </h1>
                <p className="mt-0.5 text-xs text-gray-400">
                  {loading ? "Loading…" : `${totalProducts} products found`}
                </p>
              </div>

              <div className="flex w-full items-center gap-2 sm:justify-end">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="relative rounded-xl border border-gray-200 p-2 transition-colors hover:border-[#D94F7A] lg:hidden shrink-0"
                >
                  <Menu size={18} className="text-gray-600" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D94F7A] text-[9px] font-black text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative hidden sm:block sm:w-52">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm transition-colors focus:border-[#D94F7A] focus:outline-none"
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

                <div ref={sortRef} className="relative ml-auto shrink-0 sm:ml-0">
                  <button
                    onClick={() => setSortOpen((open) => !open)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-[#D94F7A]"
                  >
                    <span className="hidden text-xs text-gray-400 sm:inline">Sort:</span>
                    <span className="text-xs font-bold text-gray-900">{sortBy}</span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${
                        sortOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortBy(opt);
                            setSortOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sortBy === opt
                              ? "bg-pink-50 font-bold text-[#D94F7A]"
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

              <div className="relative w-full sm:hidden">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-8 text-sm transition-colors focus:border-[#D94F7A] focus:outline-none"
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
            </div>

            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {selectedCategory !== "All Products" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#D94F7A]">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("All Products")}>
                      <X size={11} />
                    </button>
                  </span>
                )}

                {sortBy !== "Featured" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#D94F7A]">
                    {sortBy}
                    <button onClick={() => setSortBy("Featured")}>
                      <X size={11} />
                    </button>
                  </span>
                )}

                {debouncedSearch && (
                  <span className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#D94F7A]">
                    &quot;{debouncedSearch}&quot;
                    <button onClick={() => setSearchQuery("")}>
                      <X size={11} />
                    </button>
                  </span>
                )}

                {minPrice !== undefined && (
                  <span className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#D94F7A]">
                    Min: ₹{minPrice}
                    <button onClick={() => setMinPrice(undefined)}>
                      <X size={11} />
                    </button>
                  </span>
                )}

                {maxPrice !== undefined && (
                  <span className="flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-[#D94F7A]">
                    Max: ₹{maxPrice}
                    <button onClick={() => setMaxPrice(undefined)}>
                      <X size={11} />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearFilters}
                  className="px-2 py-1 text-xs text-gray-400 underline hover:text-gray-600"
                >
                  Clear all
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentPage((p) => p);
                  }}
                  className="shrink-0 text-xs font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-5xl">🔍</div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">No products found</h3>
                <p className="mb-6 text-sm text-gray-400">
                  Try adjusting your filters or search term
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={triggerToast}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="mt-auto flex justify-center border-t border-gray-50 pt-6 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-colors hover:border-[#D94F7A] hover:text-[#D94F7A] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {getPaginationRange().map((item, index) => (
                    <button
                      key={index}
                      onClick={() => typeof item === "number" && setCurrentPage(item)}
                      disabled={item === "..." || item === currentPage}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        currentPage === item
                          ? "border-[#D94F7A] bg-[#D94F7A] text-white shadow-md shadow-[#D94F7A]/30"
                          : item === "..."
                          ? "cursor-default border-transparent bg-transparent text-gray-300"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#D94F7A] hover:text-[#D94F7A]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-colors hover:border-[#D94F7A] hover:text-[#D94F7A] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
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