"use client";

import { useRef } from "react";
import Link from "next/link";

const categories = [
  { name: "Rings", count: "150+ Products", image: "/images/red-charm.jpg", slug: "rings" },
  { name: "Necklaces", count: "200+ Products", image: "/images/diary-charm.jpg", slug: "necklaces" },
  { name: "Bracelets", count: "180+ Products", image: "/images/bracelets-charm.jpg", slug: "bracelets" },
  { name: "Earrings", count: "220+ Products", image: "/images/HairAccesories.jpg", slug: "earrings" },
  { name: "Bag Charms", count: "80+ Products", image: "/images/bag-charm.jpg", slug: "bag-charms" },
  { name: "Kids", count: "60+ Products", image: "/images/kids-jelwelry.jpg", slug: "kids-jewelry" },
];

export default function ShopByCategory() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-pink-100 px-6 md:px-16 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-sm text-gray-500">Find the perfect handmade piece for every occasion</p>
        </div>

        {/* Scrollable cards + arrow */}
        <div className="relative flex items-center gap-3">

          {/* Left scroll arrow */}
          <button
            onClick={() => scroll("left")}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-pink-50 hover:border-pink-300 transition-all"
            aria-label="Scroll left"
          >
            ❮
          </button>

          {/* Card row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                /* UPDATED: Added category query parameter for deep-linking */
                href={`/all-products?category=${cat.name}`}
                className="group flex-shrink-0 w-44 bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-white hover:border-pink-300 hover:scale-105"
              >
                {/* Circular image */}
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-pink-50 group-hover:border-pink-300 transition-colors">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-pink-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-gray-400">{cat.count}</p>
              </Link>
            ))}
          </div>

          {/* Right scroll arrow */}
          <button
            onClick={() => scroll("right")}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-pink-50 hover:border-pink-300 transition-all"
            aria-label="Scroll right"
          >
            ❯
          </button>
        </div>

      </div>
    </section>
  );
}