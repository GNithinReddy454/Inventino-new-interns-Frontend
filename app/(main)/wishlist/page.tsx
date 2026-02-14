"use client";

import { useStore } from "@/lib/storeContext"; //
import { Heart, ShoppingBag, Trash2, ChevronLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const { savedItems, handleSaved, handleBag } = useStore(); //

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 font-sans min-h-screen">
      {/* Header Section from Figma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            My Wishlist <span className="text-pink-500 text-2xl">❤️</span>
          </h1>
          <p className="text-gray-500 mt-2">Your favorite handmade treasures, saved for later.</p>
        </div>
        <Link 
          href="/AllProducts" 
          className="inline-flex items-center gap-2 text-pink-500 font-bold hover:gap-3 transition-all"
        >
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>

      {/* Empty State Logic */}
      {savedItems.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2 mb-8">Start adding some sparkle to your collection!</p>
          <Link 
            href="/AllProducts" 
            className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
          >
            Explore Jewelry
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {savedItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-500 flex flex-col"
            >
              {/* Image Area */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Link href={`/AllProducts/${item.id}`} className="block w-full h-full">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </Link>
                <button 
                  onClick={() => handleSaved(item)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-2">
                  {item.category}
                </span>
                <Link href={`/AllProducts/${item.id}`}>
                  <h3 className="font-bold text-gray-900 leading-tight hover:text-pink-500 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => handleBag(item, 1)}
                    className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-pink-600 shadow-lg shadow-pink-100 transition-all active:scale-95"
                  >
                    <ShoppingBag size={16} /> Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}