"use client";

import { useState } from "react";
import { Heart, Share2, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/components/wishlistContext";
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
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
        <div className="flex flex-col lg:flex-row gap-8">

<<<<<<< HEAD
          {/* ================= SIDEBAR ================= */}

          {/* SIDEBAR */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between text-pink-500 font-medium cursor-pointer">All Products <span className="bg-pink-100 text-pink-600 px-2 rounded-full text-xs">156</span></li>
                {['Bracelets', 'Necklaces', 'Earrings', 'Rings'].map(cat => <li key={cat} className="text-gray-600 hover:text-pink-500 cursor-pointer">{cat}</li>)}
              </ul>
=======
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
>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
              <div className="flex items-center gap-2 mb-4">
                <input type="text" placeholder="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm text-center focus:outline-pink-500" />
                <span className="text-gray-400">-</span>
                <input type="text" placeholder="500" className="w-full border border-gray-200 rounded-lg p-2 text-sm text-center focus:outline-pink-500" />
              </div>
              {/* Simple mock slider track */}
              <div className="h-1 bg-gray-200 rounded-full relative mt-6">
                <div className="absolute left-1/4 right-0 h-1 bg-pink-500 rounded-full"></div>
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow"></div>
              </div>
            </div>
<<<<<<< HEAD
          </aside>

          {/* MAIN CONTENT */}
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
                  156 Products
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {/* Duplicating for grid visuals to match your screenshot */}
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id + 'dup'} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
=======
          )}

        </main>
>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
      </div>
    </div>
  );
}

<<<<<<< HEAD
interface Product {
  id: number;
  badge?: { text: string; color: string };
  category: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  originalPrice?: number | null;
  image: string;
}

// ================= PRODUCT CARD COMPONENT =================
function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist } = useWishlist();

=======

// ================= SIMPLIFIED PRODUCT CARD =================
function ProductCard({ product }: { product: any }) {
>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-pink-100 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {product.badge && (
          <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider rounded-full text-white ${product.badge.color}`}>
            {product.badge.text}
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => addToWishlist(product)}
            aria-label="Add to wishlist"
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:scale-110 transition-all shadow-sm"
          >
            <Heart size={16} />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:scale-110 transition-all shadow-sm">
            <Share2 size={16} />
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-4 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <span className="text-[10px] text-gray-400 font-semibold tracking-wider mb-1 uppercase">{product.category}</span>
        <Link href={`/AllProducts/${product.id}`} className="hover:text-pink-500">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 cursor-pointer">{product.title}</h3>
        </Link>
<<<<<<< HEAD

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
              {tag}
            </span>
          ))}
=======
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
           {product.tags?.slice(0, 2).map((tag: string) => (
             <span key={tag} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded">
               {tag}
             </span>
           ))}

>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
<<<<<<< HEAD
            <span className="text-lg font-bold text-pink-500">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>

          <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-pink-200 transition-colors">
            ADD TO BAG
=======

            <span className="text-lg font-bold text-pink-500">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-xs text-gray-300 line-through">${product.originalPrice}</span>}
          </div>
          <button className="bg-pink-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95 uppercase tracking-wide">
            Add to Bag

>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
          </button>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 42ffa9bdbd15dc7eef859d7fb4acf6b2e98acbea
