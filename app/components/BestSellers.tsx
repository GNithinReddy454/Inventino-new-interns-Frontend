"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";
import ProductCard from "./ProductCard";

interface ProductImage {
  id: string;
  url: string;
  _id?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  material: string;
  size?: string;
  color?: string;
  stock: number;
  images: ProductImage[];
  isActive: boolean;
  isDeleted: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
  trendy?: boolean;
  bestSeller?: boolean;
  hashtags?: string[];
  productId?: string;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";

function resolveUrl(url: string): string {
  if (!url || url.includes("undefined")) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function normalizeProduct(p: Product) {
  const resolvedImages = p.images
    .map((img) => resolveUrl(img.url))
    .filter(Boolean);

  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    originalPrice: p.discountPrice ? p.price : undefined,
    category: p.category,
    material: p.material,
    size: p.size,
    color: p.color,
    stock: p.stock,
    image: resolvedImages[0] ?? "",
    images: resolvedImages,
    rating: p.ratingsAverage ?? 0,
    reviews: p.ratingsCount ?? 0,
    badge: p.bestSeller ? "BEST SELLER" : p.trendy ? "TRENDY" : undefined,
    tags: p.hashtags ?? [p.category, "Adjustable"].filter(Boolean),
  };
}

export default function BestSellers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?category=all`
        );
        if (!res.ok) throw new Error("Failed to fetch best sellers");
        const data = await res.json();
        const allProducts: Product[] = data?.data?.items ?? [];
        const bestSellers = allProducts.filter((p) => p.bestSeller === true);
        console.log("Fetched products:", allProducts);
        console.log("Best sellers log:", bestSellers);
      
        setProducts(bestSellers.length > 0 ? bestSellers : allProducts.slice(0, 8));
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);
console.log("Best sellers:", products);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current || !scrollRef.current.children.length) return;
    const container = scrollRef.current;
    const firstChild = container.children[0] as HTMLElement;
    const gap = parseInt(window.getComputedStyle(container).gap || "0");
    const amount = firstChild.clientWidth + gap;

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
        container.style.scrollBehavior = "";
        container.style.scrollSnapType = "";
      }
    };
    requestAnimationFrame(animateScroll);
  };

  return (
    <section className="w-full bg-pink-100 px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-16">
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Best Sellers
          </h2>
          <p className="text-sm text-gray-500">
            Handpicked pieces that showcase exceptional craftsmanship
          </p>
        </div>

        {loading && (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] h-80 bg-pink-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-center text-red-500 text-sm py-8">{error}</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 sm:-left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none"
              aria-label="Scroll left"
            >
              ❮
            </button>

            {/* Outer wrapper clips scroll but inner padding lets outline show */}
            <div className="overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 py-2 px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                  >
                    <ProductCard product={normalizeProduct(product)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 sm:-right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none"
              aria-label="Scroll right"
            >
              ❯
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No best sellers found.
          </p>
        )}

        <div className="text-center mt-10">
          <ClientOnly>
            <Link
              href="/products"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              View All Products
            </Link>
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}