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
  }

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

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