"use client";

import { useStore } from "@/lib/storeContext"; 
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { savedItems, handleSaved, handleBag } = useStore(); 

  return (
    /* FIXED: 
       1. 'overflow-x-clip' prevents horizontal wobble.
       2. Removed 'min-h-screen' and replaced with 'flex-grow' logic to ensure 
          it doesn't push below the footer.
    */
    <div className="w-full overflow-x-clip bg-white font-sans flex flex-col">
      {/* FIXED: Adjusted top padding 'pt-24' to ensure content starts 
         exactly below the fixed navbar.
      */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-20 box-border w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
          <div className="max-w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              My Wishlist <span className="text-pink-500 text-2xl">❤️</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Your favorite handmade treasures, saved for later.</p>
          </div>
          <Link 
            href="/AllProducts" 
            className="inline-flex items-center gap-2 text-pink-500 font-bold hover:gap-3 transition-all text-sm whitespace-nowrap"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

        {/* Empty State Logic */}
        {savedItems.length === 0 ? (
          /* FIXED: Set a 'max-w-full' and 'px-6' to keep the dashed border 
             inside the mobile screen edges.
          */
          <div className="mx-auto w-full max-w-full text-center py-16 md:py-32 bg-gray-50 rounded-2xl md:rounded-[40px] border-2 border-dashed border-gray-200 px-6 box-border">
            <div className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Heart size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-gray-500 mt-2 mb-8 text-sm">Start adding some sparkle to your collection!</p>
            <Link 
              href="/AllProducts" 
              className="inline-block bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
            >
              Explore Jewelry
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {savedItems.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Link href={`/AllProducts/${item.id}`} className="block w-full h-full">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </Link>
                  <button 
                    onClick={() => handleSaved(item)}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <span className="text-[9px] md:text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1 md:mb-2">
                    {item.category}
                  </span>
                  <Link href={`/AllProducts/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight hover:text-pink-500 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 md:pt-6 flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleBag(item, 1)}
                      className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs hover:bg-pink-600 transition-all active:scale-95"
                    >
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}