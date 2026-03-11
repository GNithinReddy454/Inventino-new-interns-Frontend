"use client";
import { useState, useRef, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem } from "@/redux/wishlistslice";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { useCart, Product } from "@/lib/cartContext";
import { useToast } from "@/app/components/GlobalToast";

export interface ProductCardProduct extends Product {
  title?: string;
  images?: string[];
  description?: string;
  tags?: string[];
  originalPrice?: number | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  onAdd?: (name: string) => void;
  buttonBg?: string;
}

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

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400",
];

export default function ProductCard({ product, onAdd, buttonBg = "#E8456A" }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { items: wishlistItems = [] } = useAppSelector((state: any) => state.wishlist);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = wishlistItems.some((wItem: any) =>
    wItem.product?._id === product.id || wItem.product?.id === product.id
  );

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
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setCurrentSlide(0);
  }, []);

  const activate = useCallback(() => { setIsHovered(true); startScroll(); }, [startScroll]);
  const deactivate = useCallback(() => { setIsHovered(false); stopScroll(); }, [stopScroll]);

  const productName = product.name || product.title || "";
  const tags: string[] = product.tags ?? [product.category ?? "", "Adjustable"].filter(Boolean);

  const cartProduct: Product = {
    id: product.id, name: productName, image: images[0] ?? "",
    price: product.price, category: product.category,
    badge: product.badge, rating: product.rating, reviews: product.reviews,
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(cartProduct, 1);
    dispatch(reduxAddToCart({ productId: String(product.id), quantity: 1 }));
    onAdd?.(productName);
    showToast("Success!", "Added to bag", "success");
  };

  const rating = typeof product.rating === "number" ? product.rating : 4.7;
  const badgeText = getBadgeText(product.badge);
  let displayText = badgeText;
  let badgeColor = "bg-pink-500";
  if (badgeText) {
    const upper = badgeText.toUpperCase();
    if (upper === "BESTSELLER" || upper === "BEST SELLER") badgeColor = "bg-yellow-400";
    else if (upper === "SALE") { displayText = "HOT DEALS"; badgeColor = "bg-red-500"; }
  }
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      className="relative h-full"
      style={{ borderRadius: 16, overflow: "visible" }}
      // Desktop hover
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      // Mobile touch — same activate/deactivate
      onTouchStart={activate}
      onTouchEnd={deactivate}
      onTouchCancel={deactivate}
    >
      <Link
        href={`/products/${product.id}`}
        className="flex flex-col h-full w-full"
        style={{
          borderRadius: 16,
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          background: isHovered ? "#ffe0eb" : "#fff0f5",
          boxShadow: isHovered
            ? "0 8px 32px rgba(232,69,106,0.22)"
            : "0 2px 16px rgba(0,0,0,0.10)",
          transform: isHovered ? "scale(1.035)" : "scale(1)",
          transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
          willChange: "transform",
        }}
      >
        {/* IMAGE */}
        <div
          className="relative w-full shrink-0 bg-gray-50"
          style={{ aspectRatio: "1/1", overflow: "hidden" }}
        >
          {badgeText && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className={`text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${badgeColor}`}>
                {displayText}
              </span>
            </div>
          )}

          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                if (!isSaved) {
                  dispatch(addWishlistItem(String(product.id)));
                  showToast("Success!", "Added to wishlist", "success");
                } else {
                  dispatch(removeWishlistItem(String(product.id)));
                  showToast("Removed", "Removed from wishlist", "info");
                }
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${isSaved ? "bg-[#E8456A] text-white" : "bg-white text-gray-400"}`}
            >
              <Heart size={13} fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md text-gray-400"
            >
              <Share2 size={13} />
            </button>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {images.map((img, idx) => (
              <img
                key={idx} src={img} alt={productName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div key={idx} className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-3 h-1.5 bg-[#E8456A]" : "w-1.5 h-1.5 bg-white/70"}`} />
              ))}
            </div>
          )}
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 4 }}>
            <span style={{ fontSize: 9, color: "#E8456A", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {product.category}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <StarRating rating={rating} />
              <span style={{ fontSize: 9, color: "#6b7280", whiteSpace: "nowrap" }}>{rating.toFixed(1)}</span>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {productName}
          </div>

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} style={{ fontSize: 9, color: "#6b7280", background: "#f3f4f6", padding: "2px 6px", borderRadius: 3, fontWeight: 500 }}>
                  {typeof tag === "string" ? tag : ((tag as any)?.text ?? "")}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#E8456A", lineHeight: 1, whiteSpace: "nowrap" }}>
                ₹{product.price.toFixed(0)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: 10, color: "#9ca3af", textDecoration: "line-through", whiteSpace: "nowrap" }}>
                  ₹{product.originalPrice!.toFixed(0)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: buttonBg, color: "#fff",
                fontSize: 9, fontWeight: 800, padding: "7px 10px",
                borderRadius: 999, border: "none", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.06em",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}