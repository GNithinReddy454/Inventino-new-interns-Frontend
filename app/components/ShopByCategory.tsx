"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  bracelets: "/images/bracelets-charm.jpg",
  earrings: "/images/bag-charm.jpg",
  necklaces: "/images/diary-charm.jpg",
  rings: "/images/red-charm.jpg",
  accessories: "/images/HairAccesories.jpg",
  "mens bracelets": "/images/bracelets-charm.jpg",
  "women watches": "/images/bracelets-charm.jpg",
};

interface CategoryItem {
  name: string;
  count: number;
  image: string;
  slug: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";

function resolveUrl(url: string): string {
  if (!url || url.includes("undefined") || url.trim() === "") return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function nameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export default function ShopByCategory() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const catRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`
        );
        const catData = await catRes.json();
        const catItems = catData?.data?.items ?? [];

        if (catItems.length > 0) {
          const derived: CategoryItem[] = catItems
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((c: any) => {
              const imgUrl = resolveUrl(c.image?.url ?? "");
              const slug = c.slug ?? nameToSlug(c.name);
              return {
                name: c.name,
                count: 0,
                image:
                  imgUrl ||
                  CATEGORY_FALLBACK_IMAGES[c.name.toLowerCase()] ||
                  "/images/bracelets-charm.jpg",
                slug,
              };
            });
          setCategories(derived);
          return;
        }

        const prodRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?category=all&limit=100`
        );
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const prodData = await prodRes.json();
        const products: any[] = prodData?.data?.items ?? [];

        const categoryMap: Record<string, { count: number; image: string }> = {};

        for (const product of products) {
          const cat: string = product.category ?? "Other";
          if (!categoryMap[cat]) {
            categoryMap[cat] = { count: 0, image: "" };
          }
          categoryMap[cat].count += 1;

          if (!categoryMap[cat].image) {
            const imgObj = product.images?.find(
              (img: any) =>
                img.url &&
                !img.url.includes("undefined") &&
                img.url.trim() !== ""
            );
            if (imgObj) {
              categoryMap[cat].image = resolveUrl(imgObj.url);
            }
          }
        }

        const derived: CategoryItem[] = Object.entries(categoryMap).map(
          ([name, { count, image }]) => {
            const slug = nameToSlug(name);
            return {
              name,
              count,
              image:
                image ||
                CATEGORY_FALLBACK_IMAGES[name.toLowerCase()] ||
                "/images/bracelets-charm.jpg",
              slug,
            };
          }
        );

        setCategories(derived);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current || !scrollRef.current.children.length) return;

    const container = scrollRef.current;
    const firstChild = container.children[0] as HTMLElement;
    const amount =
      firstChild.clientWidth +
      parseInt(window.getComputedStyle(container).gap || "0");

    container.style.scrollBehavior = "auto";
    container.style.scrollSnapType = "none";

    const startPos = container.scrollLeft;
    const targetPos = dir === "right" ? startPos + amount : startPos - amount;
    const duration = 600;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress =
        progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      container.scrollLeft = startPos + (targetPos - startPos) * easeProgress;

      if (elapsed < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        container.style.scrollBehavior = "smooth";
        container.style.scrollSnapType = "x mandatory";
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <section className="w-full bg-pink-100 py-10 md:py-16">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-sm text-gray-500">
            Find the perfect handmade piece for every occasion
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-hidden px-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)] h-44 bg-pink-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="text-center text-red-500 text-sm py-8">{error}</p>
        )}

        {/* Scrollable row */}
        {!loading && !error && categories.length > 0 && (
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 sm:-left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none focus:ring-0"
              aria-label="Scroll left"
            >
              ❮
            </button>

            {/* overflow-hidden clips scroll, inner px-1 lets card shadows show */}
            <div className="overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-4 py-2 px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((cat) => (
                  <div
                    key={cat.slug}
                    className="flex-shrink-0 w-[70vw] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)]"
                  >
                    <Link
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="group block bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white hover:border-pink-300 hover:-translate-y-1 h-full text-center"
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-pink-50 group-hover:border-pink-300 transition-colors">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              CATEGORY_FALLBACK_IMAGES[cat.name.toLowerCase()] ??
                              "/images/bracelets-charm.jpg";
                          }}
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-pink-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] md:text-xs text-gray-400">
                        {cat.count > 0 ? `${cat.count}+ Products` : "Shop Now"}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 sm:-right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none focus:ring-0"
              aria-label="Scroll right"
            >
              ❯
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && categories.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No categories found.
          </p>
        )}
      </div>
    </section>
  );
}