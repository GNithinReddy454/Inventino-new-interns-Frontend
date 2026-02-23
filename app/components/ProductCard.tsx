"use client";

import { useState, useRef, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { useCart, Product } from "@/lib/cartContext";

export interface ProductCardProduct extends Product {
  title?: string;
  images?: string[];
  description?: string;
  tags?: string[];
  originalPrice?: number;
}

interface ProductCardProps {
  product: ProductCardProduct;
  onAdd?: (name: string) => void;
  buttonBg?: string; // ← new prop
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const partial = !filled && rating > star - 1;
        return (
          <svg key={star} width="11" height="11" viewBox="0 0 24 24" className="flex-shrink-0">
            <defs>
              <linearGradient id={`star-grad-${star}-${rating}`}>
                <stop offset={`${partial ? Math.round((rating - (star - 1)) * 100) : 0}%`} stopColor="#E8456A" />
                <stop offset={`${partial ? Math.round((rating - (star - 1)) * 100) : 0}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? "#E8456A" : partial ? `url(#star-grad-${star}-${rating})` : "#e5e7eb"}
            />
          </svg>
        );
      })}
    </div>
  );
}

function getBadgeText(badge: any): string | null {
  if (!badge) return null;
  if (typeof badge === "string") return badge;
  if (typeof badge === "object" && badge.text) return String(badge.text);
  return null;
}

export default function ProductCard({ product, onAdd, buttonBg = "#E8456A" }: ProductCardProps) {
  const { handleSaved, savedItems } = useStore();
  const { addToCart } = useCart();
  const isSaved = savedItems.some((item) => item.id === product.id);

  const images: string[] =
    product.images?.length
      ? product.images
      : [product.image].filter(Boolean) as string[];

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hover to start slideshow, 3 seconds per slide ────────────────────────
  const startScroll = useCallback(() => {
    if (images.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
  }, [images.length]);

  const stopScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const productName = product.name || product.title || "";
  const tags: string[] = product.tags ?? [product.category ?? "", "Adjustable"].filter(Boolean);

  const cartProduct: Product = {
    id: product.id,
    name: productName,
    image: images[0] ?? "",
    price: product.price,
    category: product.category,
    badge: product.badge,
    rating: product.rating,
    reviews: product.reviews,
  };

  const rating  = typeof product.rating  === "number" ? product.rating  : 4.7;
  const reviews = typeof product.reviews === "number" ? product.reviews : 5.0;

  const badgeText = getBadgeText(product.badge);
  let displayText = badgeText;
  let badgeColor  = "bg-[#E8456A]";
  if (badgeText) {
    const upper = badgeText.toUpperCase();
    if (upper === "BESTSELLER" || upper === "BEST SELLER") badgeColor = "bg-yellow-400";
    else if (upper === "SALE") { displayText = "HOT DEALS"; badgeColor = "bg-red-500"; }
  }

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(217,79,122,0.18)] hover:border-pink-100"
      onMouseEnter={startScroll}
      onMouseLeave={stopScroll}
    >
      {/* ── Image Area — fills container fully ── */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50">

        {/* Badge — top left */}
        {badgeText && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className={`text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm ${badgeColor}`}>
              {displayText}
            </span>
          </div>
        )}

        {/* Heart + Share — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaved(cartProduct as any); }}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
              isSaved ? "bg-[#E8456A] text-white" : "bg-white text-gray-400 hover:text-[#E8456A] hover:bg-pink-50"
            }`}
          >
            <Heart size={14} fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-400 hover:text-[#E8456A] hover:bg-pink-50 transition-all duration-200"
          >
            <Share2 size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Images — fully covers container */}
        <Link href={`/AllProducts/${product.id}`} className="absolute inset-0 block">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </Link>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-500 ${
                  idx === currentSlide ? "w-4 h-1.5 bg-[#E8456A]" : "w-1.5 h-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-3">

        {/* Category + Stars */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#E8456A] font-bold uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
            <span className="text-[10px] text-gray-400 font-medium">
              {rating.toFixed(1)} / {reviews.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/AllProducts/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-[#E8456A] transition-colors mb-1.5">
            {productName}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-sm font-medium">
                {typeof tag === "string" ? tag : (tag as any)?.text ?? ""}
              </span>
            ))}
          </div>
        )}

        {/* ── Price | ~~Original~~ | Add to Bag — single row ── */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          {/* Discounted / current price */}
          <span className="text-base font-black text-[#E8456A] shrink-0">
            ${product.price.toFixed(2)}
          </span>

          {/* Strikethrough original price — sits between price and button */}
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through shrink-0">
              ${product.originalPrice!.toFixed(2)}
            </span>
          )}

          {/* Add to Bag — pushed to far right, uses buttonBg prop */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(cartProduct, 1);
              onAdd?.(productName);
            }}
            style={{ backgroundColor: buttonBg }}
            className="ml-auto shrink-0 text-white text-[10px] font-bold px-3 py-2 rounded-lg uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm whitespace-nowrap hover:opacity-90"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
