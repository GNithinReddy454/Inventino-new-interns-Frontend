"use client";

import { useState } from "react";
import { useStore } from "@/lib/storeContext"; 
import { Heart, ShoppingBag, Trash2, ArrowRight, Share2, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";

export default function WishlistPage() {
  const { savedItems, handleSaved } = useStore();
  const { addToCart } = useCart();

  // States for Toaster and Selection
  const [toast, setToast] = useState<{ name: string; show: boolean }>({ name: "", show: false });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Compact Toaster Trigger
  const triggerToast = (name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: "", show: false }), 3500);
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === savedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(savedItems.map((item) => item.id));
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // UPDATED: Function to add to cart AND remove from wishlist
  const handleAddToCartAndRemove = (item: any) => {
    addToCart(item, 1); // Add to bag context
    handleSaved(item); // This toggles/removes it from wishlist context
    triggerToast(item.name); // Success notification
  };

  // UPDATED: Bulk add to cart and bulk remove from wishlist
  const handleAddAllToCart = () => {
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
      const item = savedItems.find(p => p.id === id);
      if (item) {
        addToCart(item, 1);
        handleSaved(item); // Clears it from wishlist
      }
    });
    
    triggerToast(`${selectedIds.length} items moved to bag`);
    setSelectedIds([]); // Clear selection state
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      const item = savedItems.find(p => p.id === id);
      if (item) handleSaved(item);
    });
    setSelectedIds([]);
  };

  return (
    <div className="w-full overflow-x-clip bg-white font-sans flex flex-col min-h-screen relative">
      
      {/* COMPACT TOASTER (BOTTOM RIGHT) */}
      <div className={`fixed bottom-12 right-8 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-full py-2.5 px-5 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-50 border-l-4 border-l-[#D94F7A]">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white flex-shrink-0 shadow-sm">
            <CheckCircle2 size={16} strokeWidth={3} />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="flex flex-col border-r border-gray-100 pr-3">
              <span className="text-[10px] font-black text-[#D94F7A] uppercase tracking-widest leading-none mb-1">Success!</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Moved to cart</span>
            </div>
            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[150px]">
              {toast.name}
            </span>
          </div>
          <button onClick={() => setToast({ name: "", show: false })} className="ml-1 text-gray-300 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 md:pt-32 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 font-serif">
              My Wishlist <span className="text-pink-500 text-2xl">❤️</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Review your saved items and move them to your bag.</p>
          </div>
          <Link href="/AllProducts" className="inline-flex items-center gap-2 text-[#D94F7A] font-bold hover:gap-3 transition-all text-sm uppercase tracking-wide">
            Back to Shop <ArrowRight size={18} />
          </Link>
        </div>

        {savedItems.length > 0 && (
          <div className="bg-pink-50/50 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4 border border-pink-100/50">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedIds.length === savedItems.length && savedItems.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded accent-[#D94F7A] cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700 font-serif">Select All ({savedItems.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAddAllToCart}
                className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                <ShoppingBag size={14} /> Move All to Bag
              </button>
              <button 
                onClick={handleRemoveSelected}
                className="bg-white border border-gray-200 text-red-600 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-all active:scale-95"
              >
                Remove Selected
              </button>
            </div>
          </div>
        )}

        {savedItems.length === 0 ? (
          <div className="mx-auto w-full text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 px-6">
            <Heart size={48} className="text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 font-serif">Your wishlist is empty</h3>
            <Link href="/AllProducts" className="mt-8 inline-block bg-[#D94F7A] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#b83d63] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs">
              Explore Treasures
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {savedItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 flex flex-col relative">
                
                <div className="absolute top-4 left-4 z-20">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelectProduct(item.id)}
                    className="w-5 h-5 rounded accent-[#D94F7A] cursor-pointer shadow-sm"
                  />
                </div>

                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Link href={`/AllProducts/${item.id}`} className="block w-full h-full">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </Link>
                  <button className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-gray-500 rounded-full shadow-md hover:text-[#D94F7A] opacity-0 group-hover:opacity-100 transition-all">
                    <Share2 size={16} />
                  </button>
                  <button onClick={() => handleSaved(item)} className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white z-20 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] text-[#D94F7A] font-bold uppercase tracking-widest mb-2 font-serif">{item.category}</span>
                  <Link href={`/AllProducts/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-[#D94F7A] transition-colors line-clamp-2 mb-4">{item.name}</h3>
                  </Link>
                  
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-xl font-black text-gray-900 font-serif">${item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleAddToCartAndRemove(item)}
                      className="flex-1 bg-[#D94F7A] text-white py-2 rounded-xl font-bold text-[10px] hover:bg-[#b83d63] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      <ShoppingBag size={14} /> Add to Bag
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