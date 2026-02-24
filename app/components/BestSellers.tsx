"use client";

import { useRef } from "react";
import Link from "next/link";
import { products } from "@/lib/products";
import ClientOnly from "./ClientOnly";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Adjusted to 8 products so there are exactly 2 full pages on desktop (4 per page)
  const bestSellerProducts = products.slice(0, 8);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current || !scrollRef.current.children.length) return;

    const container = scrollRef.current;
    const firstChild = container.children[0] as HTMLElement;
    const amount = firstChild.clientWidth + parseInt(window.getComputedStyle(container).gap || "0");

    // Disable CSS smooth scrolling and snapping while animating to prevent conflicts
    container.style.scrollBehavior = "auto";
    container.style.scrollSnapType = "none";

    const startPos = container.scrollLeft;
    const targetPos = dir === "right" ? startPos + amount : startPos - amount;

    const duration = 600; // 600ms for a slow smooth effect
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic
      const easeProgress = progress < 0.5
        ? 4 * Math.pow(progress, 3)
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      container.scrollLeft = startPos + (targetPos - startPos) * easeProgress;

      if (elapsed < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        // Restore CSS smooth scrolling and snapping
        container.style.scrollBehavior = "";
        container.style.scrollSnapType = "";
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <section className="w-full bg-pink-100 px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-16">
      <div className="max-w-[1400px] w-full mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Best Sellers</h2>
          <p className="text-sm text-gray-500">Handpicked pieces that showcase exceptional craftsmanship</p>
        </div>

        {/* Scrollable row + arrows */}
        <div className="relative group px-12 sm:px-0">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 sm:-left-3 md:-left-6 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none focus:ring-0"
            aria-label="Scroll left"
          >
            ❮
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory items-stretch px-2 sm:px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {bestSellerProducts.map((product) => (
              <div
                key={product.id}
                className="snap-center flex-shrink-0 w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.3333%-2rem)] lg:w-[calc(25%-2.25rem)]"
              >
                <div className="h-full">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 sm:-right-3 md:-right-6 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all outline-none focus:outline-none focus:ring-0"
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