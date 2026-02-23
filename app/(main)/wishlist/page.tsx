"use client";

import { useState } from "react";
import { useStore } from "@/lib/storeContext";
import { Heart, ShoppingBag, Trash2, ArrowLeft, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import ProductCard from "@/app/components/ProductCard";

export default function WishlistPage() {
  const { savedItems, handleSaved } = useStore();
  const { addToCart } = useCart();

  const [toast, setToast] = useState<{ name: string; show: boolean }>({ name: "", show: false });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const triggerToast = (name: string) => {
    setToast({ name, show: true });
    setTimeout(() => setToast({ name: "", show: false }), 3500);
  };

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

  const handleAddAllToCart = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      const item = savedItems.find((p) => p.id === id);
      if (item) addToCart(item, 1);
    });
    triggerToast(`${selectedIds.length} items added to cart`);
    setSelectedIds([]);
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      const item = savedItems.find((p) => p.id === id);
      if (item) handleSaved(item);
    });
    setSelectedIds([]);
  };

  const allSelected = selectedIds.length === savedItems.length && savedItems.length > 0;

  return (
    <div className="w-full overflow-x-clip bg-[#FFF9FD] font-sans flex flex-col min-h-screen relative">

      {/*
        ── GLOBAL STYLES for wishlist card overrides ──
        Applied only inside .wishlist-grid so ProductCard elsewhere is unaffected.

        1. Hide the heart/wishlist button (first button in top-right flex col)
        2. Hide the "Add to Bag" button row at the bottom (mt-auto div containing price + button)
           We keep the price visible but hide only the button inside it.
      */}
      <style>{`
        .wishlist-grid .group .absolute.top-3.right-3 > button:first-child {
          display: none !important;
        }
        .wishlist-grid .group .mt-auto button {
          display: none !important;
        }
      `}</style>

      {/* ── TOASTER — Figma card style ── */}
      <div
        className={`fixed bottom-10 right-8 z-[100] transition-all duration-500 transform ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl py-4 px-5 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 min-w-[260px]">
          <div className="bg-[#E91E8C] w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <CheckCircle2 size={18} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-bold text-gray-900 leading-tight">Success!</span>
            <span className="text-xs text-gray-400 mt-0.5">Item added to cart</span>
          </div>
          <button
            onClick={() => setToast({ name: "", show: false })}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 w-full">

        {/* ── BACK BUTTON — left aligned ── */}
        <div className="flex items-start mb-6">
          <Link
            href="/AllProducts"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9E7EA8] hover:text-[#E91E8C] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
        </div>

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 font-serif">
            My Wishlist <span className="text-2xl">💗</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Your favorite handmade treasures, saved for later</p>
        </div>

        {/* ── BULK ACTION BAR ── */}
        {savedItems.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4 border border-[#F3D6EE] shadow-sm">
            <div className="flex items-center gap-3">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-full border-2 border-[#F3D6EE] bg-white peer-checked:border-[#E91E8C] peer-checked:bg-[#E91E8C] transition-all flex items-center justify-center shadow-sm">
                  <svg
                    className={`w-3 h-3 text-white transition-opacity ${allSelected ? "opacity-100" : "opacity-0"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </label>
              <span className="text-sm font-semibold text-gray-700">Select All</span>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-[#FCE4F3] text-[#E91E8C] font-bold px-2 py-0.5 rounded-full">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 bg-[#E91E8C] hover:bg-[#c4177a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-pink-100"
              >
                <ShoppingBag size={13} /> Add All to Cart
              </button>
              <button
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FFF0FA] disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Trash2 size={13} /> Remove Selected
              </button>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {savedItems.length === 0 ? (
          <div className="mx-auto w-full text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-[#F3D6EE] px-6">
            <Heart size={48} className="text-[#F3D6EE] mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 font-serif">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mt-2 mb-8">Save items you love and come back to them anytime.</p>
            <Link
              href="/AllProducts"
              className="inline-block bg-[#E91E8C] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#c4177a] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
            >
              Explore Treasures
            </Link>
          </div>
        ) : (
          /* wishlist-grid class scopes our CSS overrides above */
          <div className="wishlist-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {savedItems.map((item: any) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                    isSelected ? "ring-2 ring-[#E91E8C] ring-offset-2" : ""
                  }`}
                >
                  {/*
                    ── Rounded checkbox — positioned below badge (top-10) ──
                    Badge sits at top-3 left-3, so we push checkbox to top-10
                    so they never overlap. If no badge, it still looks fine.
                  */}
                  <div className="absolute top-10 left-3 z-20">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-full border-2 bg-white border-white shadow-md peer-checked:border-[#E91E8C] peer-checked:bg-[#E91E8C] transition-all flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </label>
                  </div>

                  {/* ProductCard — unchanged, heart + Add to Bag hidden via CSS above */}
                  <div className="flex-1">
                    <ProductCard
                      product={item}
                      onAdd={(name) => triggerToast(name)}
                    />
                  </div>

                  {/* ── Figma Buttons: Add to Cart (filled) + Remove (outlined) ── */}
                  <div className="flex items-center gap-2 px-4 pb-4 -mt-2 bg-white rounded-b-2xl border border-t-0 border-gray-100">
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        triggerToast(item.name);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#E91E8C] hover:bg-[#c4177a] text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95"
                    >
                      <ShoppingBag size={13} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleSaved(item)}
                      className="inline-flex items-center justify-center gap-1.5 border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FFF0FA] px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
