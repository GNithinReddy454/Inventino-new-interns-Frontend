"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag, 
  Heart, 
  Share2, 
  LayoutGrid, 
  List
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: 'NEW' | 'SALE' | 'BESTSELLER';
  description: string;
  attributes: string[];
}

const ShopPage: React.FC = () => {
  const [priceRange, setPriceRange] = useState(500);

  const categories = [
    { name: 'Bracelets', count: 42 },
    { name: 'Necklaces', count: 32 },
    { name: 'Earrings', count: 28 },
    { name: 'Rings', count: 24 },
    { name: 'Accessories', count: 24 },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: "Gold Diamond Bangle",
      category: "BRACELETS",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500",
      tag: 'NEW',
      description: "Handcrafted with natural threads passed down through generations.",
      attributes: ["Gold Tone", "Adjustable"]
    },
    {
      id: 2,
      name: "Pearl Layered Necklace Set",
      category: "NECKLACES",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500",
      tag: 'SALE',
      description: "Elegant pearl design perfect for any occasion.",
      attributes: ["Pearl", "Layered"]
    },
    {
      id: 3,
      name: "Classic Emerald Pendant",
      category: "NECKLACES",
      price: 64.99,
      /* UPDATED IMAGE: Focused emerald jewelry piece */
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=500",
      tag: 'BESTSELLER',
      description: "Natural stones with gold tone beading for a unique look.",
      attributes: ["Gold Tone", "Natural Stones"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F9] pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation Header - Integrated with your global navbar spacing */}
        <div className="mb-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#D63384] hover:border-[#D63384] transition-all shadow-sm"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-xs">Back to Home</span>
          </Link>

          <Link 
            href="/stories" 
            className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#D63384] hover:border-[#D63384] transition-all shadow-sm"
          >
            <span className="font-semibold text-xs">Our Stories</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50">
                <h2 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest">Categories</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center text-[#D63384] font-bold bg-[#FFF0F3] p-3 rounded-2xl cursor-pointer text-xs">
                    <span>All Products</span>
                    <span className="opacity-70">156</span>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.name} className="flex justify-between items-center text-gray-500 hover:text-[#D63384] transition-all p-3 px-4 cursor-pointer hover:bg-pink-50 rounded-2xl text-xs">
                      <span>{cat.name}</span>
                      <span className="opacity-40">{cat.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50">
                <h2 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest">Filter by Price</h2>
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                      <span className="text-[9px] text-gray-400 block font-bold">MIN</span>
                      <span className="text-sm font-bold text-gray-700">$0</span>
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                      <span className="text-[9px] text-gray-400 block font-bold">MAX</span>
                      <span className="text-sm font-bold text-gray-700">${priceRange}</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-[#D63384]" 
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <main className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Collections</h1>
              <div className="h-px flex-1 bg-gray-100"></div>
              <div className="flex gap-2">
                <button className="p-2 text-[#D63384] bg-white border border-pink-100 rounded-xl shadow-sm"><LayoutGrid size={18}/></button>
                <button className="p-2 text-gray-400 bg-white border border-gray-100 rounded-xl shadow-sm"><List size={18}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-50">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    {product.tag && (
                      <span className="absolute top-5 left-5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-white bg-[#D63384] shadow-md">
                        {product.tag}
                      </span>
                    )}
                    <div className="absolute top-5 right-5 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                      <button className="p-2.5 bg-white rounded-full text-gray-600 hover:text-red-500 shadow-md transition-all active:scale-90"><Heart size={18}/></button>
                      <button className="p-2.5 bg-white rounded-full text-gray-600 hover:text-[#D63384] shadow-md transition-all active:scale-90"><Share2 size={18}/></button>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-[10px] font-bold text-[#D63384] tracking-[0.2em] uppercase">{product.category}</p>
                    <h3 className="font-bold text-gray-800 leading-tight min-h-[3rem] group-hover:text-[#D63384] transition-colors">{product.name}</h3>
                    <div className="flex justify-between items-center pt-5 mt-2 border-t border-gray-50">
                      <span className="text-xl font-black text-gray-900">${product.price}</span>
                      <button className="flex items-center gap-2 bg-[#D63384] text-white px-5 py-2.5 rounded-full text-[10px] font-black tracking-wider hover:bg-black transition-all active:scale-95 shadow-lg shadow-pink-100">
                        <ShoppingBag size={14} />
                        ADD TO BAG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;