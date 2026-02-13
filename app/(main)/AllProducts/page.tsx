"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Share2, Search, ChevronRight, ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import productsData from "@/lib/products.json";

// --- 1. DATA GENERATOR ---
const TOTAL_PRODUCTS = 156;
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const ALL_PRODUCTS_LIST = Array.from({ length: TOTAL_PRODUCTS }).map((_, index) => {
  const template = productsData[index % productsData.length];
  const randomCategory = CATEGORIES_LIST[index % CATEGORIES_LIST.length];
  const randomPrice = Math.floor(Math.random() * (600 - 25 + 1)) + 25;

  return {
    ...template,
    id: index + 1,
    category: randomCategory,
    price: randomPrice + 0.99,
    image: template.images[0] 
  };
});

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([0, 600]); 
  const [sortBy, setSortBy] = useState("Featured"); // <--- NEW STATE FOR SORTING
  
  const itemsPerPage = 9; 

  // --- FILTERING & SORTING LOGIC ---
  const filteredProducts = useMemo(() => {
    // 1. Filter
    let result = ALL_PRODUCTS_LIST.filter(product => {
      const categoryMatch = selectedCategory === "All Products" || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    // 2. Sort
    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } 
    // "Featured" uses default order (no sorting needed)

    return result;
  }, [selectedCategory, priceRange, sortBy]); // <--- Re-run when sortBy changes

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, priceRange, sortBy]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentPage]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value);
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1] - 10), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 10)]);
    }
  };

  // --- PAGINATION UI LOGIC ---
  const getPaginationRange = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const sideWidth = 1; 
    const leftSiblingIndex = Math.max(currentPage - sideWidth, 1);
    const rightSiblingIndex = Math.min(currentPage + sideWidth, totalPages);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      let leftItemCount = 3 + 2 * sideWidth;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }
    if (showLeftDots && !showRightDots) {
      let rightItemCount = 3 + 2 * sideWidth;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [1, "...", ...rightRange];
    }
    if (showLeftDots && showRightDots) {
       let middleRange = Array.from({ length: (rightSiblingIndex - leftSiblingIndex) + 1 }, (_, i) => leftSiblingIndex + i);
       return ["...", ...middleRange, "...", totalPages];
    }
    return [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans bg-gray-50/50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Categories</h3>
              <button onClick={() => { setSelectedCategory("All Products"); setPriceRange([0, 600]); }} className="text-xs text-pink-500 font-medium hover:underline">Clear</button>
            </div>
            <ul className="space-y-1 text-sm">
              {["All Products", ...CATEGORIES_LIST].map((catName) => {
                const count = catName === "All Products" ? ALL_PRODUCTS_LIST.length : ALL_PRODUCTS_LIST.filter(p => p.category === catName).length;
                return (
                  <li key={catName}>
                    <button onClick={() => setSelectedCategory(catName)} className={`w-full flex justify-between items-center py-2 px-2 rounded-lg transition-colors ${selectedCategory === catName ? "text-pink-500 font-bold bg-pink-50" : "text-gray-600 hover:text-pink-500 hover:bg-gray-50"}`}>
                      <span>{catName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === catName ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-400"}`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="border border-gray-200 rounded-lg px-3 py-2 w-full"><span className="text-xs text-gray-400 mr-1">$</span><input type="number" value={priceRange[0]} readOnly className="w-full text-sm font-bold text-gray-700 outline-none"/></div>
              <span className="text-gray-300">-</span>
              <div className="border border-gray-200 rounded-lg px-3 py-2 w-full"><span className="text-xs text-gray-400 mr-1">$</span><input type="number" value={priceRange[1]} readOnly className="w-full text-sm font-bold text-gray-700 outline-none"/></div>
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full mb-2">
               <div className="absolute h-full bg-pink-500 rounded-full" style={{ left: `${(priceRange[0] / 600) * 100}%`, right: `${100 - (priceRange[1] / 600) * 100}%` }}></div>
               <input type="range" min="0" max="600" value={priceRange[0]} onChange={(e) => handlePriceChange(e, 'min')} className="absolute w-full h-full opacity-0 cursor-pointer z-10"/>
               <input type="range" min="0" max="600" value={priceRange[1]} onChange={(e) => handlePriceChange(e, 'max')} className="absolute w-full h-full opacity-0 cursor-pointer z-10"/>
               <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 border-2 border-white rounded-full shadow-md pointer-events-none" style={{ left: `${(priceRange[0] / 600) * 100}%` }}></div>
               <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 border-2 border-white rounded-full shadow-md pointer-events-none" style={{ left: `${(priceRange[1] / 600) * 100}%` }}></div>

            </div>
          </div>
        </aside>


        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          
          {/* --- HEADER CONTROLS (Updated) --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
            
            <div className="flex items-center gap-3">
               {/* Sort By Dropdown */}
               <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                 <span className="text-gray-400">Sort by:</span>
                 <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer hover:text-pink-500 transition-colors"
                 >
                   <option value="Featured">Featured</option>
                   <option value="Price: Low to High">Price: Low to High</option>
                   <option value="Price: High to Low">Price: High to Low</option>
                 </select>
               </div>

               {/* Grid Icon */}
               <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm">
                  <LayoutGrid size={20} />
               </button>
               
               {/* Product Count Badge */}
               <button className="px-4 py-2.5 bg-pink-500 text-white rounded-xl shadow-md shadow-pink-200 transition-transform active:scale-95">
                  <span className="font-bold text-xs tracking-wide">{filteredProducts.length} Products</span>
               </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
               <Search size={48} className="text-gray-200 mb-4" />
               <h3 className="text-lg font-bold text-gray-900">No products match your filters</h3>
               <p className="text-gray-500">Try adjusting the price range or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="mt-auto flex justify-center pt-8 border-t border-gray-50 select-none">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><ChevronLeft size={14} /></button>
                {getPaginationRange().map((item, index) => {
                   if (item === "...") return <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">...</span>;
                   return (
                     <button key={item} onClick={() => setCurrentPage(item as number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${currentPage === item ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>{item}</button>
                   );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}


// ================= SIMPLIFIED PRODUCT CARD =================
function ProductCard({ product }: { product: any }) {
  return (
    // UPDATED: Tightened the pink shadow so it spreads less and stays closer to the bottom of the card.
    <div className="flex flex-col group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-transparent hover:shadow-[0_14px_24px_-10px_rgba(236,72,153,0.6)]">
      
      {/* 1. IMAGE SECTION */}
      <div className="relative aspect-square bg-gray-50">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        </Link>
        {product.badge && <span className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold rounded text-white ${product.badge.color}`}>{product.badge.text}</span>}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
           <button className="p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-pink-500 hover:bg-white shadow-sm transition-colors"><Heart size={14} /></button>
           <button className="p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-pink-500 hover:bg-white shadow-sm transition-colors"><Share2 size={14} /></button>
        </div>
      </div>

      {/* 2. DETAILS SECTION */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-1.5">
        
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 mt-1">
          {product.category}
        </span>
        
        <Link href={`/AllProducts/${product.id}`} className="mb-2">
           <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-pink-500 transition-colors">
             {product.title}
           </h3>
        </Link>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
           {product.tags?.slice(0, 2).map((tag: string) => (
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

