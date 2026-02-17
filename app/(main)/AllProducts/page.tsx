"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Share2, LayoutGrid, ChevronLeft, ChevronRight, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import productsData from "@/lib/products.json";
import { useStore } from "@/lib/storeContext";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import { useProducts, addToCart } from "@/lib/hooks";

// --- 1. DATA GENERATOR (FIXED HYDRATION) ---
const TOTAL_PRODUCTS = 156;
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const ALL_PRODUCTS_LIST = Array.from({ length: TOTAL_PRODUCTS }).map((_, index) => {
  const id = index + 1;
  const template = productsData[index % productsData.length] as any;
  const randomCategory = CATEGORIES_LIST[index % CATEGORIES_LIST.length];

  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: randomCategory,
    price: stablePrice + 0.99,
    image: template.images ? template.images[0] : template.image,
    images: template.images || [template.image], 
    name: template.name || template.title
  };
});

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [sortBy, setSortBy] = useState("Featured");
  const [isClient, setIsClient] = useState(false);
  
  // TOAST STATE
  const [toast, setToast] = useState<{name: string, show: boolean}>({ name: '', show: false });

  const itemsPerPage = 9;

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
    const value = parseInt(e.target.value) || 0;
    if (type === 'min') setPriceRange([Math.min(value, priceRange[1] - 10), priceRange[1]]);
    else setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 10)]);
  };

  const getPaginationRange = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, "...", currentPage, "...", totalPages];
  };

  // Helper to trigger toast with item name
  const triggerToast = (name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: '', show: false }), 3500);
  };

  if (!isClient) return <div className="min-h-screen bg-white" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen relative">
      
      {/* COMPACT FIGMA TOASTER (BOTTOM RIGHT) */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-full py-3 px-6 flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-50 border-l-4 border-l-[#D94F7A]">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white flex-shrink-0">
            <CheckCircle2 size={18} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-[#D94F7A] uppercase tracking-widest leading-none mb-0.5">Success!</span>
            <span className="text-xs font-bold text-gray-800 truncate max-w-[150px] leading-tight">
              {toast.name} added
            </span>
          </div>
          <button 
            onClick={() => setToast({ name: '', show: false })}
            className="ml-2 text-gray-300 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Categories</h3>
              <button onClick={() => { setSelectedCategory("All Products"); setPriceRange([0, 600]); }} className="text-xs text-[#D94F7A] font-medium hover:underline">Clear</button>
            </div>
            <ul className="space-y-3 text-sm">
              <li onClick={() => setSelectedCategory("All Products")} className={`flex justify-between cursor-pointer font-medium ${selectedCategory === "All Products" ? "text-[#D94F7A]" : "text-gray-600 hover:text-[#D94F7A]"}`}>
                All Products <span className="bg-pink-100 text-[#D94F7A] px-2 rounded-full text-xs">{TOTAL_PRODUCTS}</span>
              </li>
              {CATEGORIES_LIST.map(cat => {
                const count = ALL_PRODUCTS_LIST.filter(p => p.category === cat).length;
                return (
                  <li key={cat} onClick={() => setSelectedCategory(cat)} className={`flex justify-between items-center cursor-pointer transition-colors ${selectedCategory === cat ? "text-[#D94F7A] font-bold" : "text-gray-600 hover:text-[#D94F7A]"}`}>
                    <span>{cat}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedCategory === cat ? "bg-pink-100 text-[#D94F7A]" : "bg-gray-100 text-gray-400"}`}>{count}</span>
                  </li>
                );
              })}
            </ul>

            {/* --- NEW PRICE RANGE SECTION STARTS HERE --- */}
            <hr className="my-6 border-gray-100" />
            
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Price Range</h3>
              
              {/* Price Inputs */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 'min')}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
                <span className="text-gray-300">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 'max')}
                    className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                  />
                </div>
              </div>

              {/* Slider (Controls Max Price) */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D94F7A]"
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
            </div>
            {/* --- NEW PRICE RANGE SECTION ENDS HERE --- */}

          </div>
        </aside>

        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-gray-400">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent font-bold text-gray-900 outline-none border-none cursor-pointer hover:text-[#D94F7A] transition-colors">
                  <option value="Featured">Featured</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
              <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"><LayoutGrid size={20} /></button>
              <button className="px-4 py-2.5 bg-[#D94F7A] text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wide">{filteredProducts.length} Products</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={triggerToast} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-auto flex justify-center pt-8 border-t border-gray-50 select-none">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                {getPaginationRange().map((item, index) => (
                  <button key={index} onClick={() => typeof item === 'number' && setCurrentPage(item)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${currentPage === item ? 'bg-[#D94F7A] text-white border-[#D94F7A] shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>{item}</button>
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
function ProductCard({ product, onAdd }: { product: any, onAdd: (name: string) => void }) {
  const { handleSaved, savedItems } = useStore();
  const { addToCart } = useCart();
  const isSaved = savedItems.some(item => item.id === product.id);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % product.images.length);
    }, 7000); 
    return () => clearInterval(interval);
  }, [product.images.length]);

  return (
    <div className="flex flex-col group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-transparent hover:shadow-[0_14px_24px_-10px_rgba(217,79,122,0.4)]">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full relative z-0">
          {product.images.map((img: string, idx: number) => (
            <img 
              key={idx}
              src={img} 
              alt={product.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-110 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`} 
            />
          ))}
        </Link>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
          {product.images.map((_: any, idx: number) => (
            <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-4 bg-[#D94F7A]' : 'w-1 bg-white/60'}`} />
          ))}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaved(product as Product);
            }}
            className={`p-2 rounded-full shadow-md transition-colors ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white/90 text-gray-400 hover:text-[#D94F7A]'}`}
          >
            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="p-2 bg-white/90 rounded-full text-gray-400 hover:text-[#D94F7A] shadow-md transition-colors"><Share2 size={14} /></button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 pb-4 pt-1.5">
        <span className="text-[10px] text-[#D94F7A] font-bold uppercase tracking-widest mb-1 mt-1">{product.category}</span>
        <Link href={`/AllProducts/${product.id}`} className="mb-2 block z-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-[#D94F7A] transition-colors">{product.name || product.title}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product as Product, 1);
              onAdd(product.name || product.title); // Trigger compact toast
            }}
            className="z-10 bg-[#D94F7A] text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md hover:bg-[#b83d63] transition-all active:scale-95 uppercase tracking-wide"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}