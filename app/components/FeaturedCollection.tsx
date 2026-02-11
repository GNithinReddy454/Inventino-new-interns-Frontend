"use client";

import { products } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import ClientOnly from "./ClientOnly";

export default function FeaturedCollection() {
  const { addToCart } = useCart();
  const featuredProducts = products.slice(2, 6);

  return (
    <section className="w-full bg-gradient-to-b from-pink-50 to-white px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
            Featured Collection
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full mx-auto mb-3"></div>
          <p className="text-center text-gray-600 text-xs md:text-sm">
            Handpicked pieces that showcase exceptional craftsmanship
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-10">
          {featuredProducts.map((product) => (
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
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400 text-sm">{'★'.repeat(Math.floor(product.rating))}</div>
                  <span className="text-xs text-gray-600">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <p className="text-pink-600 font-black text-lg mb-4">
                  ${product.price.toFixed(2)}
                </p>

                {/* Add to Cart Button */}
                <ClientOnly>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 text-sm uppercase tracking-wide"
                  >
                    Add to Cart
                  </button>
                </ClientOnly>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <ClientOnly>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:shadow-lg">
              View Full Collections
            </button>
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}
