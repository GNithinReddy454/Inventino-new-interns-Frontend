"use client";

import { products } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/app/components/AnnouncementBar";
import ClientOnly from "@/app/components/ClientOnly";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ShopPage() {
  const { category } = useParams();
  const { addToCart } = useCart();

  const categoryName = category === "all" ? "All Products" : category?.toString().split("-").join(" ").toUpperCase() || "Products";

  const filteredProducts =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <section className="w-full bg-gradient-to-b from-white to-pink-50 px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 md:mb-8 flex items-center gap-2 text-xs text-gray-600">
            <Link href="/" className="hover:text-pink-500 font-semibold">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-bold">{categoryName}</span>
          </div>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-black text-gray-900 mb-3 md:mb-4 capitalize">
            {categoryName}
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mb-8 md:mb-12 font-medium">
            {filteredProducts.length} amazing pieces to choose from
          </p>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-10">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-pink-100/40 hover:border-pink-200"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-100 h-48 md:h-56 lg:h-64 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                    />
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {product.badge}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 md:p-5">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 md:mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-700">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <p className="text-pink-500 font-bold text-sm md:text-base mb-2 md:mb-3">
                      ${product.price.toFixed(2)}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
