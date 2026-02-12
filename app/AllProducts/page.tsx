"use client";

import { useState } from "react";
import { Heart, Share2, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA (Updated with working Necklace image) ---
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
    // FIXED IMAGE LINK BELOW:
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop"
  }
];

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-pink-500 font-medium cursor-pointer">All Products <span className="bg-pink-100 text-pink-600 px-2 rounded-full text-xs">156</span></li>
              {['Bracelets', 'Necklaces', 'Earrings', 'Rings'].map(cat => <li key={cat} className="text-gray-600 hover:text-pink-500 cursor-pointer">{cat}</li>)}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
             <div className="h-1 bg-gray-200 rounded-full relative mt-6"><div className="absolute left-1/4 right-0 h-1 bg-pink-500 rounded-full"></div><div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow"></div></div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <span className="bg-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm shadow-pink-200">156 Products</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}
            {MOCK_PRODUCTS.map((product) => <ProductCard key={product.id + 'dup'} product={product} />)}
          </div>
        </main>
      </div>
    </div>
  );
}

// CARD COMPONENT
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-pink-100 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
        </Link>
        {product.badge && <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider rounded-full text-white ${product.badge.color}`}>{product.badge.text}</div>}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500"><Heart size={16}/></button>
      </div>
      <Link href={`/AllProducts/${product.id}`}>
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 hover:text-pink-500 cursor-pointer">{product.title}</h3>
      </Link>
      <div className="mt-auto flex items-center justify-between">
         <span className="text-lg font-bold text-pink-500">${product.price}</span>
         <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-pink-200">ADD TO BAG</button>
      </div>
    </div>
  );
}