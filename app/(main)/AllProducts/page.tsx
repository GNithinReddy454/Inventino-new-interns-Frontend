"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Share2, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import productsData from "@/lib/products.json";
import { useStore } from "@/lib/storeContext";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cartContext";

// --- 1. DATA GENERATOR (FIXED HYDRATION) ---
const TOTAL_PRODUCTS = 156;
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const ALL_PRODUCTS_LIST = Array.from({ length: TOTAL_PRODUCTS }).map((_, index) => {
  const id = index + 1;
  const template = productsData[index % productsData.length] as any;
  const randomCategory = CATEGORIES_LIST[index % CATEGORIES_LIST.length];

  // Use stable math based on ID to prevent 155 vs 156 hydration errors
  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: randomCategory,
    price: stablePrice + 0.99,
    image: template.images ? template.images[0] : template.image,
    name: template.name || template.title
  };
});

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [sortBy, setSortBy] = useState("Featured");
  const [isClient, setIsClient] = useState(false);

  const itemsPerPage = 9;

  // Force mount to client to fix hydration freezes
  useEffect(() => { setIsClient(true); }, []);

  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS_LIST.filter(product => {
      const categoryMatch = selectedCategory === "All Products" || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);

    return result;
  }, [selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, priceRange, sortBy]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value);
    if (type === 'min') setPriceRange([Math.min(value, priceRange[1] - 10), priceRange[1]]);
    else setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 10)]);
  };

  const getPaginationRange = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, "...", currentPage, "...", totalPages];
  };

  if (!isClient) return <div className="min-h-screen bg-white" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Categories</h3>
              <button onClick={() => { setSelectedCategory("All Products"); setPriceRange([0, 600]); }} className="text-xs text-pink-500 font-medium hover:underline">Clear</button>
            </div>
            <ul className="space-y-3 text-sm">
              <li onClick={() => setSelectedCategory("All Products")} className={`flex justify-between cursor-pointer font-medium ${selectedCategory === "All Products" ? "text-pink-500" : "text-gray-600 hover:text-pink-500"}`}>
                All Products <span className="bg-pink-100 text-pink-600 px-2 rounded-full text-xs">{TOTAL_PRODUCTS}</span>
              </li>
              {CATEGORIES_LIST.map(cat => {
                // 1. Calculate the count for this category
                const count = ALL_PRODUCTS_LIST.filter(p => p.category === cat).length;
                
                return (
                  <li 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    // Updated class to use flexbox for spacing
                    className={`flex justify-between items-center cursor-pointer transition-colors ${selectedCategory === cat ? "text-pink-500 font-bold" : "text-gray-600 hover:text-pink-500"}`}
                  >
                    <span>{cat}</span>
                    {/* 2. Display the count badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedCategory === cat ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-400"}`}>
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <div className="relative h-1 bg-gray-200 rounded-full mb-2">
                <div className="absolute h-full bg-pink-500 rounded-full" style={{ left: `${(priceRange[0] / 600) * 100}%`, right: `${100 - (priceRange[1] / 600) * 100}%` }}></div>
                <input type="range" min="0" max="600" value={priceRange[0]} onChange={(e) => handlePriceChange(e, 'min')} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <input type="range" min="0" max="600" value={priceRange[1]} onChange={(e) => handlePriceChange(e, 'max')} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 border-2 border-white rounded-full shadow-md pointer-events-none" style={{ left: `${(priceRange[0] / 600) * 100}%` }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 border-2 border-white rounded-full shadow-md pointer-events-none" style={{ left: `${(priceRange[1] / 600) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-gray-400">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent font-bold text-gray-900 outline-none border-none cursor-pointer hover:text-pink-500 transition-colors">
                  <option value="Featured">Featured</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
              <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"><LayoutGrid size={20} /></button>
              <button className="px-4 py-2.5 bg-pink-500 text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wide">{filteredProducts.length} Products</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-auto flex justify-center pt-8 border-t border-gray-50 select-none">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                {getPaginationRange().map((item, index) => (
                  <button key={index} onClick={() => typeof item === 'number' && setCurrentPage(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${currentPage === item ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>{item}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ================= PRODUCT CARD =================
function ProductCard({ product }: { product: any }) {
const { handleSaved, savedItems } = useStore();
const { addToCart } = useCart();
  const isSaved = savedItems.some(item => item.id === product.id);

  return (
    <div className="flex flex-col group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-transparent hover:shadow-[0_14px_24px_-10px_rgba(236,72,153,0.6)]">
      <div className="relative aspect-square bg-gray-50">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full relative z-0">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </Link>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaved(product as Product);
            }}
            className={`p-1.5 rounded-full shadow-sm transition-colors ${isSaved ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-400 hover:text-pink-500'}`}
          >
            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-pink-500 shadow-sm transition-colors"><Share2 size={14} /></button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 pb-4 pt-1.5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 mt-1">{product.category}</span>
        <Link href={`/AllProducts/${product.id}`} className="mb-2 block z-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-pink-500 transition-colors">{product.name || product.title}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-pink-500">${product.price.toFixed(2)}</span>
          {/* Add to Bag Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product as Product, 1);
            }}
            className="z-10 bg-pink-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md hover:bg-pink-600 transition-all active:scale-95 uppercase tracking-wide"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
