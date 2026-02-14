"use client";

import { useState } from "react";
import { Heart, Share2, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/components/wishlistContext";
import Link from "next/link";

const MOCK_PRODUCTS = [
  {
    id: 1,
    badge: { text: "NEW", color: "bg-pink-500" },
    category: "BRACELETS",
    title: "Delicate Rose Gold Chain Bracelet",
    description: "Handcrafted with natural threads passed down through generations",
    tags: ["Rose Gold", "Adjustable"],
    price: 34.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    badge: { text: "SALE", color: "bg-red-500" },
    category: "EARRINGS",
    title: "Bohemian Beaded Hoop Earrings",
    description: "Natural stones with gold-tone beading for a unique look",
    tags: ["Gold Tone", "Natural Stones"],
    price: 44.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    badge: { text: "BESTSELLER", color: "bg-yellow-400 text-gray-900" },
    category: "NECKLACES",
    title: "Pearl Layered Chain Necklace",
    description: "Elegant pearl design perfect for any occasion",
    tags: ["Pearl", "Layered"],
    price: 64.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop"
  }
];

export default function ProductsPage() {
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
        <div className="flex flex-col lg:flex-row gap-8">

          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between text-pink-500 font-medium cursor-pointer">All Products <span className="bg-pink-100 text-pink-600 px-2 rounded-full text-xs">156</span></li>
                {['Bracelets', 'Necklaces', 'Earrings', 'Rings'].map(cat => <li key={cat} className="text-gray-600 hover:text-pink-500 cursor-pointer">{cat}</li>)}
              </ul>
            </div>
          </aside>

          <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">All Products</h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Sort by:</span>
                  <select className="border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-pink-500 bg-white">
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white">
                  <button className="p-1.5 bg-gray-100 rounded text-gray-700"><Grid size={18} /></button>
                  <button className="p-1.5 hover:bg-gray-50 text-gray-400 rounded transition-colors"><List size={18} /></button>
                </div>

                <span className="bg-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm shadow-pink-200">
                  {MOCK_PRODUCTS.length} Products
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-500 text-white font-medium shadow-md shadow-pink-200">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium">4</button>
              <span className="text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium">12</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

type Product = {
  id: number;
  badge?: { text: string; color: string };
  category: string;
  title: string;
  description: string;
  tags?: string[];
  price: number;
  originalPrice?: number | null;
  image: string;
};

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist } = useWishlist();

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-pink-100 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

        {product.badge && (
          <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider rounded-full text-white ${product.badge.color}`}>
            {product.badge.text}
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button onClick={() => addToWishlist(product)} aria-label="Add to wishlist" className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:scale-110 transition-all shadow-sm">
            <Heart size={16} />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:scale-110 transition-all shadow-sm">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <span className="text-[10px] text-gray-400 font-semibold tracking-wider mb-1 uppercase">{product.category}</span>
        <Link href={`/AllProducts/${product.id}`} className="hover:text-pink-500">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 cursor-pointer">{product.title}</h3>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-pink-500">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-xs text-gray-300 line-through">${product.originalPrice}</span>}
          </div>

          <button className="bg-pink-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95 uppercase tracking-wide">
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
