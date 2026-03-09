"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";
import ProductCard from "./ProductCard";

interface ProductImage { id: string; url: string; _id?: string; }
interface Product {
  _id: string; name: string; slug: string; description: string;
  price: number; discountPrice?: number; category: string; material: string;
  size?: string; color?: string; stock: number; images: ProductImage[];
  isActive: boolean; isDeleted: boolean; ratingsAverage?: number;
  ratingsCount?: number; trendy?: boolean; bestSeller?: boolean;
  hashtags?: string[]; productId?: string; createdAt: string; updatedAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";

function resolveUrl(url: string): string {
  if (!url || url.includes("undefined")) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function normalizeProduct(p: Product) {
  const resolvedImages = p.images.map((img) => resolveUrl(img.url)).filter(Boolean);
  return {
    id: p._id, name: p.name, slug: p.slug, description: p.description,
    price: p.price, originalPrice: p.discountPrice ? p.price : undefined,
    category: p.category, material: p.material, size: p.size, color: p.color,
    stock: p.stock, image: resolvedImages[0] ?? "", images: resolvedImages,
    rating: p.ratingsAverage ?? 0, reviews: p.ratingsCount ?? 0,
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
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?category=all`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const all: Product[] = data?.data?.items ?? [];
        const bs = all.filter((p) => p.bestSeller).slice(0, 8);
        setProducts(bs.length > 0 ? bs : all.slice(0, 8));
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const gap = parseInt(getComputedStyle(el).gap || "16");
    el.scrollBy({ left: (card.clientWidth + gap) * (dir === "right" ? 1 : -1), behavior: "smooth" });
  };

  return (
    <section className="w-full bg-pink-100 px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-16">
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Best Sellers</h2>
          <p className="text-sm text-gray-500">Handpicked pieces that showcase exceptional craftsmanship</p>
        </div>

        {loading && (
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 h-64 bg-pink-200 rounded-2xl animate-pulse
                w-[72vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]" />
            ))}
          </div>
        )}

        {error && !loading && <p className="text-center text-red-500 text-sm py-8">{error}</p>}

        {!loading && !error && products.length > 0 && (
          <div className="relative">
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-all outline-none"
              style={{ left: -4 }}
              aria-label="Scroll left"
            >❮</button>

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory items-stretch"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                // NO touchAction here — lets touch events reach the cards
                paddingTop: 12,
                paddingBottom: 16,
                paddingLeft: 36,
                paddingRight: 36,
                WebkitOverflowScrolling: "touch",
              } as React.CSSProperties}
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className="snap-start flex-shrink-0
                    w-[72vw]
                    sm:w-[calc(50%-12px)]
                    md:w-[calc(33.333%-16px)]
                    lg:w-[calc(25%-18px)]"
                >
                  <ProductCard product={normalizeProduct(product)} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollBy("right")}
              className="absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-all outline-none"
              style={{ right: -4 }}
              aria-label="Scroll right"
            >❯</button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No best sellers found.</p>
        )}

        <div className="text-center mt-8 sm:mt-10">
          <ClientOnly>
            <Link
              href="/products"
              className="inline-block bg-pink-500 hover:bg-pink-600 active:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              View All Products
            </Link>
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}