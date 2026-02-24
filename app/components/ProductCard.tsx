"use client";

import { useState, useRef, useCallback } from "react";
import { Heart, Share2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const isSaved = savedItems.some((item) => item.id === product.id);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const images: string[] =
    product.images?.length
      ? product.images
      : [product.image].filter(Boolean) as string[];

  const router = useRouter();
  const [localQuantity, setLocalQuantity] = useState(0);
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

  const handleIncreaseLocal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalQuantity(prev => prev + 1);
  };

  const handleDecreaseLocal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localQuantity > 0) {
      setLocalQuantity(prev => prev - 1);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to 1 if localQuantity is 0
    const finalQuantity = localQuantity > 0 ? localQuantity : 1;

    addToCart(cartProduct, finalQuantity);
    onAdd?.(productName);

    // Optional: stay on page to see the success indicator
    // router.push("/bag");
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, quantityInCart - 1);
    }
  };

  const rating = typeof product.rating === "number" ? product.rating : 4.7;
  const reviews = typeof product.reviews === "number" ? product.reviews : 5.0;

  const badgeText = getBadgeText(product.badge);
  let displayText = badgeText;
  let badgeColor = "bg-[#E8456A]";
  if (badgeText) {
    const upper = badgeText.toUpperCase();
    if (upper === "BESTSELLER" || upper === "BEST SELLER") badgeColor = "bg-yellow-400";
    else if (upper === "SALE") { displayText = "HOT DEALS"; badgeColor = "bg-red-500"; }
  }

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(217,79,122,0.18)] hover:border-pink-100 h-full"
      onMouseEnter={startScroll}
      onMouseLeave={stopScroll}
    >
      {/* ── Image Area — fills container fully ── */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-t-2xl bg-gray-50 shrink-0">

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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              handleSaved(cartProduct as any);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${isSaved ? "bg-[#E8456A] text-white" : "bg-white text-gray-400 hover:text-[#E8456A] hover:bg-pink-50"
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
        <Link href={`/all-products/${product.id}`} className="absolute inset-0 block">
          {images.map((img, idx) => {
            const isBraceletsCharm = img.includes('bracelets-charm');
            return (
              <img
                key={idx}
                src={img}
                alt={productName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentSlide ? "opacity-100" : "opacity-0"
                  } ${isBraceletsCharm ? "scale-[1.06]" : ""}`}
              />
            );
          })}
        </Link>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-500 ${idx === currentSlide ? "w-4 h-1.5 bg-[#E8456A]" : "w-1.5 h-1.5 bg-white/70"
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
          <span className="text-[10px] text-[#E8456A] font-bold uppercase tracking-widest line-clamp-1">
            {product.category}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <StarRating rating={rating} />
            <span className="text-[10px] text-gray-400 font-medium">
              {rating.toFixed(1)} / {reviews.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/all-products/${product.id}`}>
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
                {typeof tag === "string" ? tag : (tag as unknown as { text?: string })?.text ?? ""}
              </span>
            ))}
          </div>
        )}

        {/* ── Price | ~~Original~~ | Add to Bag — column right ── */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-1 w-full">
          {/* Prices wrapper */}
          <div className="flex flex-col gap-0.5 shrink-0 mb-[2px]">
            <span className="text-base font-black text-[#E8456A]">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through">
                ${product.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {quantityInCart > 0 ? (
            <div className="flex flex-col items-end gap-1.5 ml-auto shrink-0 w-max">
              <span className="text-[10px] font-bold text-[#E8456A] uppercase tracking-widest px-1">In Bag</span>
              <div className="flex items-center justify-between bg-pink-50 rounded-full h-8 w-[80px] px-1 border border-pink-100 shadow-sm ml-auto">
                <button onClick={handleDecrease} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-[#E8456A] shadow-sm hover:scale-105 transition-transform"><Minus size={12} strokeWidth={3} /></button>
                <span className="text-xs font-bold text-gray-900 w-4 text-center">{quantityInCart}</span>
                <button onClick={handleIncrease} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-[#E8456A] shadow-sm hover:scale-105 transition-transform"><Plus size={12} strokeWidth={3} /></button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1.5 ml-auto shrink-0 w-max">
              <div className="flex items-center justify-between bg-pink-50 rounded-full h-7 w-[72px] px-1 border border-pink-100 shadow-sm ml-auto">
                <button onClick={handleDecreaseLocal} className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-[#E8456A] shadow-sm hover:scale-105 transition-transform"><Minus size={10} strokeWidth={3} /></button>
                <span className="text-[11px] font-bold text-gray-900 w-4 text-center">{localQuantity}</span>
                <button onClick={handleIncreaseLocal} className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-[#E8456A] shadow-sm hover:scale-105 transition-transform"><Plus size={10} strokeWidth={3} /></button>
              </div>

              <button
                onClick={handleAdd}
                style={{ backgroundColor: buttonBg }}
                className="ml-auto text-white text-[10px] items-center justify-center flex font-bold px-3 py-2 rounded-lg uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm whitespace-nowrap hover:opacity-90 w-full"
              >
                Add to Bag
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}