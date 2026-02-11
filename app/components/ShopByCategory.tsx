"use client";

import Link from "next/link";

export default function ShopByCategory() {
  const categories = [
    { name: "Hair Accessories", count: "50+ Products", icon: "💇‍♀️", slug: "hair-accessories" },
    { name: "Bracelets", count: "120+ Products", icon: "💫", slug: "bracelets" },
    { name: "Bag Charms", count: "80+ Products", icon: "👜", slug: "bag-charms" },
    { name: "Kids Jewelry", count: "60+ Products", icon: "🎀", slug: "kids-jewelry" },
    { name: "Shoe Charms", count: "45+ Products", icon: "👠", slug: "shoe-charms" },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-pink-50 px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
            Shop by Category
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full mx-auto mb-3"></div>
          <p className="text-center text-gray-600 text-xs md:text-sm">
            Find the perfect handmade piece for every occasion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/shop/${category.slug}`}
              className="group bg-white rounded-2xl p-6 md:p-8 text-center shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 border border-pink-100/40 hover:border-pink-300 hover:bg-gradient-to-br hover:from-white hover:to-pink-50"
            >
              <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-500 text-xs group-hover:text-pink-600 transition-colors duration-300 font-semibold">{category.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
