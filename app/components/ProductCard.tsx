"use client";
import { useState, useRef, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { useCart, Product } from "@/lib/cartContext";
import { useToast } from "@/app/components/GlobalToast";
import { Roboto } from "next/font/google";
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
  buttonBg?: string;
}

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
            width="11"
            height="11"
            viewBox="0 0 24 24"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id={`star-grad-${star}-${rating}`}>
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
                    ? `url(#star-grad-${star}-${rating})`
                    : "#e5e7eb"
              }
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

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400",
];

export default function ProductCard({
  product,
  onAdd,
  buttonBg = "#E8456A",
}: ProductCardProps) {
  const { handleSaved, savedItems } = useStore();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();

  const isSaved = savedItems.some((item) => item.id === product.id);

  const images: string[] =
    product.images?.length && product.images.length > 1
      ? product.images
      : product.image
        ? [product.image, ...MOCK_IMAGES.slice(1)]
        : MOCK_IMAGES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setCurrentSlide(0);
  }, []);

  const productName = product.name || product.title || "";
  const tags: string[] =
    product.tags ?? [product.category ?? "", "Adjustable"].filter(Boolean);

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

  const [localQuantity, setLocalQuantity] = useState(1);

  const handleIncreaseLocal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalQuantity((prev) => prev + 1);
  };

  const handleDecreaseLocal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localQuantity > 0) {
      setLocalQuantity((prev) => prev - 1);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(cartProduct, 1);
    onAdd?.(productName);
    showToast("Success!", "Added to bag ", "success");
  };

  const rating = typeof product.rating === "number" ? product.rating : 4.7;
  const reviews = typeof product.reviews === "number" ? product.reviews : 5.0;
  const badgeText = getBadgeText(product.badge);
  let displayText = badgeText;
  let badgeColor = "bg-pink-500";

  if (badgeText) {
    const upper = badgeText.toUpperCase();
    if (upper === "BESTSELLER" || upper === "BEST SELLER") badgeColor = "bg-yellow-400";
    else if (upper === "SALE") {
      displayText = "HOT DEALS";
      badgeColor = "bg-red-500";
    }
  }

  const hasDiscount =
    !!product.originalPrice && product.originalPrice > product.price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex flex-col cursor-pointer h-full"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* ── IMAGE AREA ── */}
      <div
        className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-t-2xl bg-gray-50 shrink-0"
        onMouseEnter={startScroll}
        onMouseLeave={stopScroll}
      >
        {/* Badge — top left */}
        {badgeText && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span
              className={`text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm ${badgeColor}`}
            >
              {displayText}
            </span>
          </div>
        )}

        {/* Heart + Share — top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaved(cartProduct as any);
              if (!isSaved) {
                showToast("Success!", "Added to wishlist", "success");
              } else {
                showToast("Removed", "Removed from wishlist", "info");
              }
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${isSaved
              ? "bg-[#E8456A] text-white"
              : "bg-white text-gray-400 hover:text-[#E8456A] hover:bg-pink-50"
              }`}
          >
            <Heart
              size={14}
              fill={isSaved ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-400 hover:text-[#E8456A] hover:bg-pink-50 transition-all duration-200"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* Images */}
        <div className="absolute inset-0 block pointer-events-none">
          {images.map((img, idx) => {
            const isBraceletsCharm = img.includes("bracelets-charm");
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
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 4,
              zIndex: 10,
            }}
          >
            {images.map((_, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 999,
                  background: "white",
                  opacity: idx === currentSlide ? 1 : 0.5,
                  width: idx === currentSlide ? 12 : 6,
                  height: 6,
                  transition: "all 0.3s",
                }}
                className={`rounded-full transition-all duration-500 ${idx === currentSlide
                  ? "w-4 h-1.5 bg-[#E8456A]"
                  : "w-1.5 h-1.5 bg-white/70"
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
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
            <span className="text-[10px] text-gray-500">
              {rating.toFixed(1)} / {reviews.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Product title */}
        <div className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
          {productName}
        </div>

        {/* Description */}
        {product.description && (
          <div className="text-[11px] text-gray-400 leading-snug mb-2 line-clamp-2">
            {product.description}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-sm font-medium"
              >
                {typeof tag === "string"
                  ? tag
                  : ((tag as unknown as { text?: string })?.text ?? "")}
              </span>
            ))}
          </div>
        )}

        {/* ✅ Price + ADD TO BAG — pinned to bottom with mt-auto */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: "auto",  // ✅ KEY FIX: always pushes to bottom
          }}
        >
          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#E8456A", lineHeight: 1 }}>
              INR{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>
                INR{product.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* ADD TO BAG button */}
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: buttonBg,
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              padding: "9px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Add to Bag
          </button>
        </div>
      </div>
    </Link>
  );
}
