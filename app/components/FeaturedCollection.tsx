"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";
import ProductCard from "./ProductCard";

interface ProductImage {
  id?: string;
  url?: string;
  _id?: string;
}

interface Product {
  _id: string;
  name?: string;
  productName?: string;
  slug: string;
  description: string;
  price?: number;
  discountPrice?: number;
  pricing?: {
    price: number;
    originalPrice?: number | null;
  };
  category: string;
  material: string;
  size?: string;
  color?: string;
  stock?: number;
  totalStock?: number;
  images?: ProductImage[];
  media?: {
    mainImage?: string | null;
    galleryImages?: ProductImage[];
  };
  isActive: boolean;
  isDeleted: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
  rating?: number;
  reviewCount?: number;
  trendy?: boolean;
  bestSeller?: boolean;
  hashtags?: string[];
  productId?: string;
  createdAt: string;
  updatedAt: string;
  story?: {
    title?: string;
    featured?: boolean;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";

function resolveUrl(url?: string): string {
  if (!url || url.includes("undefined")) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function normalizeProduct(p: Product) {
  const name = p.productName || p.name || p.story?.title || "Unnamed Product";
  const mainImage = p.media?.mainImage || (p.images && p.images[0]?.url) || "";
  const resolvedImages = (p.media?.galleryImages || p.images || [])
    .map((img) => resolveUrl(img.url))
    .filter(Boolean) as string[];
  
  const finalImages = mainImage ? [resolveUrl(mainImage), ...resolvedImages] : resolvedImages;

  return {
    id: p._id || p.productId || Math.random().toString(36).substr(2, 9),
    name: name,
    slug: p.slug || "",
    description: p.description || "",
    price: p.pricing?.price ?? p.discountPrice ?? p.price ?? 0,
    originalPrice: p.pricing?.originalPrice ?? p.price ?? undefined,
    category: p.category || "General",
    material: p.material || "",
    size: p.size,
    color: p.color,
    stock: p.totalStock ?? p.stock ?? 0,
    image: finalImages[0] ?? "",
    images: finalImages,
    rating: p.rating ?? p.ratingsAverage ?? 0,
    reviews: p.reviewCount ?? p.ratingsCount ?? 0,
    badge: p.trendy ? "TRENDY" : (p.bestSeller || p.story?.featured) ? "BEST SELLER" : undefined,
    tags: p.hashtags ?? [p.category, "Adjustable"].filter(Boolean),
  };
}

export default function FeaturedCollection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?category=all`
        );

        if (!res.ok) throw new Error("Failed to fetch featured products");

        const data = await res.json();
        const allProducts: Product[] = Array.isArray(data?.data?.items)
          ? data.data.items
          : [];

        const activeProducts = allProducts.filter(
          (p) => p && p.isActive !== false && p.isDeleted !== true
        );

        const featured = activeProducts.filter((p) => p.trendy === true).slice(0, 8);

        setProducts(featured.length > 0 ? featured : activeProducts.slice(0, 8));
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

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
    <section className="w-full bg-pink-100 px-4 py-10 sm:px-8 md:px-12 md:py-16 lg:px-16">
      <div className="mx-auto w-full max-w-350">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl">
            Featured Collection
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
                className="h-80 w-full shrink-0 rounded-2xl bg-pink-200 animate-pulse sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-all outline-none hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 focus:outline-none sm:-left-6 md:-left-8 md:h-10 md:w-10"
              aria-label="Scroll left"
            >
              ❮
            </button>
+
            <div className="overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-1 py-2 pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {products.map((product, index) => (
                  <div
                    key={product._id || product.productId || index}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                  >
                    <ProductCard product={normalizeProduct(product)} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-all outline-none hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 focus:outline-none sm:-right-6 md:-right-8 md:h-10 md:w-10"
              aria-label="Scroll right"
            >
              ❯
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No featured products found.
          </p>
        )}

        <div className="mt-10 text-center">
          <ClientOnly>
            <Link
              href="/products"
              className="inline-block rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-pink-600 hover:shadow-lg active:scale-95"
            >
              View All Products
            </Link>
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}