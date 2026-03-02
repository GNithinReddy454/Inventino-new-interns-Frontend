"use client";
import { useState, useRef, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { useCart, Product } from "@/lib/cartContext";
import { useToast } from "@/app/components/GlobalToast";

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
          <svg key={star} className="w-3 h-3" viewBox="0 0 20 20" fill="none">
            {partial ? (
              <>
                <defs>
                  <linearGradient id={`grad-${star}`}>
                    <stop offset={`${(rating - (star - 1)) * 100}%`} stopColor="#FBBF24" />
                    <stop offset={`${(rating - (star - 1)) * 100}%`} stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
                  fill={`url(#grad-${star})`}
                />
              </>
            ) : (
              <path
                d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
                fill={filled ? "#FBBF24" : "#D1D5DB"}
              />
            )}
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
        ? [product.image, ...MOCK_IMAGES.slice(1)] // keep real image + add mocks
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
    showToast("Success!", "Action completed", "success");
  };

  const rating = typeof product.rating === "number" ? product.rating : 4.7;
  const reviews = typeof product.reviews === "number" ? product.reviews : 5.0;
  const badgeText = getBadgeText(product.badge);
  let displayText = badgeText;
  let badgeBg = "#E8456A";
  if (badgeText) {
    const upper = badgeText.toUpperCase();
    if (upper === "BESTSELLER" || upper === "BEST SELLER") badgeBg = "#EAB308";
    else if (upper === "SALE") { displayText = "HOT DEALS"; badgeBg = "#EF4444"; }
    if (upper === "BESTSELLER" || upper === "BEST SELLER")
      badgeColor = "bg-yellow-400";
    else if (upper === "SALE") {
      displayText = "HOT DEALS";
      badgeColor = "bg-red-500";
    }
  }

  const hasDiscount =
    !!product.originalPrice && product.originalPrice > product.price;

  return (
    <Link
      href={`/product/${product.id}`}
      className="block cursor-pointer"
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
        className="relative w-full"
        style={{ aspectRatio: "1/1", background: "#f3f4f6", overflow: "hidden" }}
        onMouseEnter={startScroll}
        onMouseLeave={stopScroll}
      >
        {/* Badge — top left, pill, colored */}
        {badgeText && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 10,
              backgroundColor: badgeBg,
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: "999px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {displayText}
      {/* ── Image Area ── */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-t-2xl bg-gray-50 shrink-0">
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

        {/* Heart — top right */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
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
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.13)",
              color: isSaved ? "#E8456A" : "#9CA3AF",
            }}
          >
            <Heart
              size={15}
              fill={isSaved ? "#E8456A" : "none"}
              stroke={isSaved ? "#E8456A" : "#9CA3AF"}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
              isSaved
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
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.13)",
              color: "#9CA3AF",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-400 hover:text-[#E8456A] hover:bg-pink-50 transition-all duration-200"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* Slideshow images */}
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={productName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: idx === currentSlide ? 1 : 0,
              transition: "opacity 0.7s",
            }}
          />
        ))}
        {/* Images — fully covers container */}
        <Link
          href={`/products/${product.id}`}
          className="absolute inset-0 block"
        >
          {images.map((img, idx) => {
            const isBraceletsCharm = img.includes("bracelets-charm");
            return (
              <img
                key={idx}
                src={img}
                alt={productName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  idx === currentSlide ? "opacity-100" : "opacity-0"
                } ${isBraceletsCharm ? "scale-[1.06]" : ""}`}
              />
            );
          })}
        </Link>

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
                className={`rounded-full transition-all duration-500 ${
                  idx === currentSlide
                    ? "w-4 h-1.5 bg-[#E8456A]"
                    : "w-1.5 h-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── WHITE CONTENT AREA ── */}
      <div style={{ background: "#fff", padding: "12px 14px 14px 14px" }}>

        {/* Row 1: Category (pink bold) + Stars + rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#E8456A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-3">
        {/* Category + Stars */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#E8456A] font-bold uppercase tracking-widest line-clamp-1">
            {product.category}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={rating} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>
              {rating.toFixed(1)} / {reviews.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Row 2: Product title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {productName}
        </div>

        {/* Row 3: Description */}
        {product.description && (
          <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </div>
        )}

        {/* Row 4: Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#FFF0F3",
                  color: "#6B7280",
                  fontWeight: 500,
                  border: "none",
                }}
              >
                {typeof tag === "string" ? tag : (tag as any)?.text ?? ""}
                className="text-[10px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-sm font-medium"
              >
                {typeof tag === "string"
                  ? tag
                  : ((tag as unknown as { text?: string })?.text ?? "")}
              </span>
            ))}
          </div>
        )}

        {/* Row 5: Price (big pink bold) + ADD TO BAG (pill button) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#E8456A", lineHeight: 1 }}>
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>
                ${product.originalPrice!.toFixed(2)}
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