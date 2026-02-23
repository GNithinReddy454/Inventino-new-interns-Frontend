"use client";

import { useRef } from "react";
import Link from "next/link";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import ClientOnly from "./ClientOnly";

export default function BestSellers() {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bestSellerProducts = products.slice(0, 6);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-pink-100 px-6 md:px-16 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Best Sellers</h2>
          <p className="text-sm text-gray-500">Handpicked pieces that showcase exceptional craftsmanship</p>
        </div>

        {/* Scrollable row + arrows */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:border-pink-300 transition-all"
            aria-label="Scroll left"
          >
            ❮
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {bestSellerProducts.map((product) => (
              <Link
                href={`/AllProducts/${product.id}`}
                key={product.id}
                className="group flex-shrink-0 w-60 block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-pink-50"
              >
                <div className="relative aspect-square overflow-hidden bg-pink-50">
                  {product.badge && (
                    <span className="absolute top-2 left-2 z-10 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {product.badge}
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex text-yellow-400 text-xs">{"★".repeat(Math.floor(product.rating))}</div>
                    <span className="text-[10px] text-gray-400">
                      {product.rating.toFixed(1)} / {product.reviews}
                    </span>
                  </div>
                  <p className="text-pink-600 font-black text-base">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:border-pink-300 transition-all"
            aria-label="Scroll right"
          >
            ❯
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <ClientOnly>
            <Link
              href="/all-products"
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