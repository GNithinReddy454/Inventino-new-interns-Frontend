"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/storeContext";
import { useCart } from "@/lib/cartContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  X,
  Share2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const partial = !filled && rating > star - 1;
        return (
          <svg
            key={star}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id={`wl-star-${star}-${Math.round(rating * 10)}`}>
                <stop
                  offset={`${partial ? Math.round((rating - (star - 1)) * 100) : 0}%`}
                  stopColor="#E8456A"
                />
                <stop
                  offset={`${partial ? Math.round((rating - (star - 1)) * 100) : 0}%`}
                  stopColor="#e5e7eb"
                />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={
                filled
                  ? "#E8456A"
                  : partial
                    ? `url(#wl-star-${star}-${Math.round(rating * 10)})`
                    : "#e5e7eb"
              }
            />
          </svg>
        );
      })}
    </div>
  );
}

// ── Badge helper ──────────────────────────────────────────────────────────────
function getBadgeInfo(badge: any): { text: string; color: string } | null {
  if (!badge) return null;
  const text =
    typeof badge === "string" ? badge : badge?.text ? String(badge.text) : null;
  if (!text) return null;
  const upper = text.toUpperCase();
  if (upper === "BESTSELLER" || upper === "BEST SELLER")
    return { text, color: "bg-yellow-400" };
  if (upper === "SALE") return { text: "HOT DEALS", color: "bg-red-500" };
  return { text, color: "bg-[#E8456A]" };
}

export default function WishlistPage() {
  const { savedItems, handleSaved } = useStore();
  const { addToCart } = useCart();

  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    show: boolean;
  }>({ title: "Added to cart!", message: "", show: false });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const triggerToast = useCallback(
    (message: string, title: string = "Added to cart!") => {
      setToast({ title, message, show: true });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    },
    [],
  );

  const handleAddToCart = useCallback(
    (item: any) => {
      addToCart(item, 1);
      handleSaved(item);
      triggerToast(`${item.name || item.title} added to cart`);
    },
    [addToCart, handleSaved, triggerToast],
  );

  const handleAddAllToCart = () => {
    if (!selectedIds.length) return;
    let count = 0;
    selectedIds.forEach((id) => {
      const item = savedItems.find((p) => p.id === id);
      if (item) {
        addToCart(item as any, 1);
        handleSaved(item);
        count++;
      }
    });
    triggerToast(`${count} item${count > 1 ? "s" : ""} added to cart`);
    setSelectedIds([]);
  };

  const handleRemoveSelected = () => {
    if (!selectedIds.length) return;
    selectedIds.forEach((id) => {
      const item = savedItems.find((p) => p.id === id);
      if (item) handleSaved(item);
    });
    setSelectedIds([]);
  };

  const handleRemoveAll = () => {
    savedItems.forEach((item) => handleSaved(item));
    setSelectedIds([]);
  };

  const handleAddEntireWishlistToCart = () => {
    if (!savedItems.length) return;
    let count = 0;
    savedItems.forEach((item) => {
      addToCart(item as any, 1);
      // Remove from wishlist at the same time
      handleSaved(item);
      count++;
    });
    triggerToast(`${count} item${count > 1 ? "s" : ""} added to cart`);
    setSelectedIds([]);
  };

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === savedItems.length
        ? []
        : savedItems.map((i) => i.id),
    );

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const allSelected =
    savedItems.length > 0 && selectedIds.length === savedItems.length;

  return (
    <div className="w-full bg-[#FFF9FD] font-sans min-h-screen">
      {/* ── Toast ── */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-8 z-[100] transition-all duration-300 ${
          toast.show
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl py-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-gray-100 min-w-[200px] max-w-[88vw]">
          <div className="bg-[#E8456A] w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">
              {toast.title}
            </p>
            <p className="text-xs text-gray-400 truncate">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 ml-1"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-16 w-full">
        {/* ── Back ── */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9E7EA8] hover:text-[#E8456A] transition-colors group mb-4"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Shop
        </Link>

        {/* ── Header ── */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            My Wishlist
          </h1>
          <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
            {savedItems.length} item{savedItems.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {/* ── Compact Bulk Action Bar ── */}
        {savedItems.length > 0 && (
          <div className="flex items-center gap-3 mb-4 sm:mb-5 flex-wrap">
            {/* Select All — compact inline style, not full width */}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-[#E8456A] transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="sr-only peer"
              />
              <div className="w-4 h-4 rounded-full border-2 border-[#F3D6EE] bg-white peer-checked:border-[#E8456A] peer-checked:bg-[#E8456A] transition-all flex items-center justify-center flex-shrink-0">
                <svg
                  className={`w-2 h-2 text-white ${allSelected ? "opacity-100" : "opacity-0"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                Select All
              </span>
            </label>

            {/* Remove All */}
            <button
              onClick={handleRemoveAll}
              className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-red-300 hover:text-red-500 transition-colors text-xs font-semibold text-gray-700 group whitespace-nowrap"
            >
              <Trash2
                size={14}
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              />
              Remove All
            </button>

            {/* Add All to Cart */}
            <button
              onClick={handleAddEntireWishlistToCart}
              className="inline-flex items-center gap-1.5 cursor-pointer bg-[#E8456A] text-white rounded-xl px-3 py-2 shadow-sm hover:bg-[#c73358] transition-colors text-xs font-semibold whitespace-nowrap"
            >
              <ShoppingBag size={14} className="text-white" />
              Add All to Cart
            </button>

            {/* Count badge */}
            {selectedIds.length > 0 && (
              <span className="text-[11px] bg-pink-50 text-[#E8456A] font-bold px-2 py-1 rounded-full border border-pink-100 whitespace-nowrap">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {savedItems.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white rounded-[28px] border-2 border-dashed border-[#F3D6EE] px-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="text-gray-400 text-sm mt-2 mb-7">
              Save items you love and come back anytime.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#E8456A] text-white px-8 py-2.5 rounded-2xl font-bold hover:bg-[#c73358] transition-all shadow-md shadow-pink-100 uppercase tracking-widest text-xs"
            >
              Explore Treasures
            </Link>
          </div>
        ) : (
          /* ── Product Grid ── */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {savedItems.map((item: any) => {
              const isSelected = selectedIds.includes(item.id);
              const name = item.name || item.title || "";
              const image = item.images?.[0] || item.image || "";
              const rating =
                typeof item.rating === "number" ? item.rating : 4.7;
              const badge = getBadgeInfo(item.badge);
              const hasDiscount =
                !!item.originalPrice && item.originalPrice > item.price;

              return (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-2xl overflow-hidden border flex flex-col shadow-sm transition-all duration-300 hover:shadow-[0_6px_24px_rgba(232,69,106,0.13)] ${
                    isSelected
                      ? "ring-2 ring-[#E8456A] ring-offset-1 border-transparent"
                      : "border-gray-100 hover:border-pink-100"
                  }`}
                >
                  {/* ── Image ── */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Link
                      href={`/products/${item.id}`}
                      className="absolute inset-0"
                    >
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* ── TOP ROW: badge (left) + share (right) — never collide ── */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 pointer-events-none">
                      {/* Badge — left side */}
                      <div className="pointer-events-none">
                        {badge ? (
                          <span
                            className={`text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        ) : (
                          /* Empty spacer so share stays right-aligned even without badge */
                          <span />
                        )}
                      </div>

                      {/* Actions — right side */}
                      <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaved(item);
                            triggerToast(
                              `${name} removed from the wishlist`,
                              "Removed from Wishlist",
                            );
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E8456A] shadow-md text-white transition-all backdrop-blur-sm hover:bg-[#c73358] active:scale-95"
                        >
                          <Heart
                            size={11}
                            strokeWidth={2}
                            fill="currentColor"
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-400 hover:text-[#E8456A] hover:bg-white transition-all backdrop-blur-sm"
                        >
                          <Share2 size={11} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* ── BOTTOM-LEFT: checkbox — away from badge ── */}
                    <div className="absolute bottom-2 left-2 z-20">
                      <label className="cursor-pointer block">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 shadow transition-all flex items-center justify-center ${
                            isSelected
                              ? "border-[#E8456A] bg-[#E8456A]"
                              : "border-white/80 bg-black/10 hover:bg-white/90 hover:border-[#E8456A]"
                          }`}
                        >
                          <svg
                            className={`w-2.5 h-2.5 text-white transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ── Card Body ── */}
                  <div className="flex flex-col flex-1 px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 pt-2 sm:pt-2.5">
                    {/* Category + Stars */}
                    <div className="flex items-center justify-between mb-0.5 gap-1">
                      <span className="text-[9px] sm:text-[10px] text-[#E8456A] font-bold uppercase tracking-widest truncate leading-none">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <StarRating rating={rating} />
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium ml-0.5 leading-none">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-bold text-gray-900 text-[11px] sm:text-sm leading-snug line-clamp-2 hover:text-[#E8456A] transition-colors mt-1 mb-1.5">
                        {name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-1 mt-auto mb-2">
                      <span className="text-sm sm:text-base font-black text-[#E8456A]">
                        ${item.price?.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-[#E8456A] hover:bg-[#c73358] text-white py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm shadow-pink-100"
                      >
                        <ShoppingBag size={10} className="flex-shrink-0" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleSaved(item)}
                        title="Remove from wishlist"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50 transition-all active:scale-95"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
