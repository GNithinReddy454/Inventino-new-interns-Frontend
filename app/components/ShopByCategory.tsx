"use client";

import { useRef } from "react";
import Link from "next/link";

const categories = [
  { name: "Bracelets", count: "180+ Products", image: "/images/bracelets-charm.jpg", slug: "bracelets" },
  { name: "Earrings", count: "220+ Products", image: "/images/bag-charm.jpg", slug: "earrings" },
  { name: "Necklaces", count: "200+ Products", image: "/images/diary-charm.jpg", slug: "necklaces" },
  { name: "Rings", count: "150+ Products", image: "/images/red-charm.jpg", slug: "rings" },
  { name: "Accessories", count: "80+ Products", image: "/images/HairAccesories.jpg", slug: "accessories" },
];

export default function ShopByCategory() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
        container.style.scrollBehavior = "smooth";
        container.style.scrollSnapType = "x mandatory";
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <section className="w-full bg-pink-100 px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-16">
      <div className="max-w-[1400px] w-full mx-auto">

        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-sm text-gray-500">Find the perfect handmade piece for every occasion</p>
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

          {/* Categories Horizontal Scroll */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scroll-smooth pb-4 px-2 snap-x snap-mandatory items-stretch pt-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="snap-center flex-shrink-0 w-full sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)]"
              >
                <Link
                  href={`/all-products?category=${cat.name}`}
                  className="group block bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white hover:border-pink-300 hover:-translate-y-1 h-full mx-auto text-center"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-pink-50 group-hover:border-pink-300 transition-colors">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-pink-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] md:text-xs text-gray-400">{cat.count}</p>
                </Link>
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

      </div>
    </section>
  );
}