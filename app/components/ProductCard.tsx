"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
// import { addWishlistItem, removeWishlistItem } from "@/redux/wishlistslice";
// import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { useCart, Product } from "@/lib/cartContext";
import { useToast } from "@/app/components/GlobalToast";

export interface ProductCardProduct extends Product {
  title?: string;
  images?: string[];
  description?: string;
  tags?: string[];
  originalPrice?: number | null;
  stock?: number;
  variants?: any[];
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
        return (
          <svg key={star} width="11" height="11" viewBox="0 0 24 24" className="flex-shrink-0">
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? "#FFD700" : "#e5e7eb"}
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

const COLOR_DUMMY_IMAGES: Record<string, string[]> = {
  gold: [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400"
  ],
  silver: [
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
    "https://images.unsplash.com/photo-1627250645069-424a73e6d625?w=400"
  ],
  "rose gold": [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400"
  ],
  pink: [
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400"
  ],
};

const getDummyImagesForColor = (colorName: string): string[] => {
  const key = colorName.toLowerCase().trim();
  if (COLOR_DUMMY_IMAGES[key]) return COLOR_DUMMY_IMAGES[key];
  return [`https://placehold.co/400x400/f8f9fa/D94F7A?text=${encodeURIComponent(colorName)}`];
};

export default function ProductCard({ product, onAdd, buttonBg = "#E8456A" }: ProductCardProps) {
  const dispatch = useAppDispatch();
  // const { items: wishlistItems = [] } = useAppSelector((state: any) => state.wishlist);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  // const isSaved = wishlistItems.some((wItem: any) =>
  //   wItem.product?._id === product.id || wItem.product?.id === product.id
  // );
  const isSaved = false; // Wishlist disabled

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getImageUrl = (imgData: any) => {
    if (!imgData) return "";
    if (typeof imgData === "string") {
      // Resolve relative URLs if needed (consistent with BestSellers/FeaturedCollection)
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";
      if (imgData.startsWith("/") && !imgData.startsWith("//")) {
        return `${BASE_URL}${imgData}`;
      }
      return imgData;
    }
    if (typeof imgData === "object" && imgData.url) return getImageUrl(imgData.url);
    return "";
  };

  const images: string[] =
    product.images?.length && product.images.length > 0
      ? product.images.map(img => getImageUrl(img)).filter(Boolean)
      : product.image
        ? [getImageUrl(product.image), ...MOCK_IMAGES.slice(1)]
        : MOCK_IMAGES;

  // Derive active product data based on selected color variant
  const activeProductData = useMemo(() => {
    if (!activeVariant) return null;
    
    // Support either 'products' or 'sizes' array from backend
    const variantsList = activeVariant.products || activeVariant.sizes || [];
    const firstVariant = variantsList.length > 0 ? variantsList[0] : null;

    return {
      price: firstVariant?.price ?? activeVariant.price ?? product.price,
      originalPrice: firstVariant?.originalPrice ?? activeVariant.originalPrice ?? product.originalPrice,
      stock: firstVariant?.stock ?? activeVariant.stock ?? product.stock,
      images: activeVariant.images?.length > 0 
        ? activeVariant.images.map((img: any) => getImageUrl(img)).filter(Boolean)
        : firstVariant?.images?.length > 0
          ? firstVariant.images.map((img: any) => getImageUrl(img)).filter(Boolean)
          : getDummyImagesForColor(activeVariant.color || activeVariant.colorName || ""),
      id: firstVariant?._id || firstVariant?.id || activeVariant._id || activeVariant.id || product.id
    };
  }, [activeVariant, product]);

  const activeImages = useMemo(() => {
    if (activeProductData?.images && activeProductData.images.length > 0) {
      return activeProductData.images;
    }
    return images;
  }, [activeProductData, images]);

  const displayPrice = activeProductData?.price ?? product.price;
  const displayOriginalPrice = activeProductData?.originalPrice ?? product.originalPrice;
  const displayStock = activeProductData?.stock ?? product.stock;

  const startScroll = useCallback(() => {
    if (activeImages.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeImages.length);
    }, 3000);
  }, [activeImages.length]);

  const stopScroll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setCurrentSlide(0);
  }, []);

  const activate = useCallback(() => { setIsHovered(true); startScroll(); }, [startScroll]);
  const deactivate = useCallback(() => { setIsHovered(false); stopScroll(); }, [stopScroll]);

  const productName = product.name || product.title || "";
  const tags: string[] = product.tags ?? [product.category ?? "", "Adjustable"].filter(Boolean);

  const cartProduct: Product = {
    id: activeProductData?.id ?? product.id, 
    name: productName, 
    image: activeImages[0] ?? "",
    price: displayPrice, 
    category: product.category,
    badge: product.badge, 
    rating: product.rating, 
    reviews: product.reviews,
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (added) return;
    // addToCart(cartProduct, 1);
    // dispatch(reduxAddToCart({ productId: String(product.id), quantity: 1 }));
    // onAdd?.(productName);
    // showToast("Success!", "Added to bag", "success");
    // setAdded(true);
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
  const hasDiscount = !!displayOriginalPrice && displayOriginalPrice > displayPrice;
  const isOutOfStock = displayStock !== undefined && displayStock <= 0;

  return (
    <div
      className="relative h-full"
      style={{ borderRadius: 16, overflow: "visible" }}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onTouchStart={activate}
      onTouchEnd={deactivate}
      onTouchCancel={deactivate}
    >
      <Link
        href={`/products/${activeProductData?.id ?? product.id}`}
        className="flex flex-col h-full w-full bg-white"
        style={{
          borderRadius: 12,
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          background: "#fff",
          boxShadow: isHovered
            ? "0 0 0 0.5px #ec4899, 0 8px 28px rgba(236,72,153,0.28), 0 2px 8px rgba(236,72,153,0.15)"
            : "0 2px 16px rgba(0,0,0,0.10)",
          transform: isHovered ? "scale(1.035)" : "scale(1)",
          transition: "outline 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
          willChange: "transform",
        }}
      >
        {/* IMAGE */}
        <div
          className="relative w-full shrink-0 bg-gray-50"
          style={{ aspectRatio: "1/1", overflow: "hidden" }}
        >
          {badgeText && !isOutOfStock && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className={`text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${badgeColor}`}>
                {displayText}
              </span>
            </div>
          )}

          {/* OUT OF STOCK BADGE */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm" style={{ backgroundColor: "#DC2626" }}>
                Out of Stock
              </span>
            </div>
          )}

         

          {/* WISHLIST & SHARE BUTTONS — commented out */}
          {/* <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleWishlistToggle}
              className={`w-7 h-7 flex items-center justify-center rounded-full shadow-md transition-all duration-200 bg-white ${
                isSaved ? "text-[#E8456A]" : "text-gray-400"
              }`}
            >
              <Heart size={13} fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md text-gray-400"
            >
              <Share2 size={13} />
            </button>
          </div> */}

          <div className="absolute inset-0 pointer-events-none">
            {activeImages.map((img: string, idx: number) => (
              <img
                key={idx} src={img} alt={productName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>

          {activeImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {activeImages.map((_: any, idx: number) => (
                <div key={idx} className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-3 h-1.5 bg-[#E8456A]" : "w-1.5 h-1.5 bg-white/70"}`} />
              ))}
            </div>
          )}
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#E8456A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            {product.category || "EXCLUSIVE"}
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4, marginBottom: 4 }}>
            {productName}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Color Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex gap-1.5 mb-3" onClick={(e) => e.preventDefault()}>
              {product.variants.map((v: any, idx: number) => (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    setActiveVariant(v);
                    setCurrentSlide(0);
                  }}
                  onMouseLeave={() => {
                    setActiveVariant(null);
                    setCurrentSlide(0);
                  }}
                  className={`w-4 h-4 rounded-full border border-gray-200 cursor-pointer transition-transform hover:scale-125 ${
                    activeVariant?.color === v.color ? "ring-2 ring-pink-400 ring-offset-1" : ""
                  }`}
                  style={{ backgroundColor: v.colorCode || "#ccc" }}
                  title={v.color}
                />
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 10 }}>
            <StarRating rating={rating} />
            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 2 }}>{(rating || 0).toFixed(1)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
                ₹{(displayPrice || 0).toFixed(0)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>
                  ₹{(displayOriginalPrice || 0).toFixed(0)}
                </span>
              )}
            </div>

            {/* VIEW DETAILS BUTTON */}
            <span
              style={{
                backgroundColor: isHovered ? buttonBg : "transparent",
                color: isHovered ? "#fff" : buttonBg,
                fontSize: 9,
                fontWeight: 800,
                padding: "7px 10px",
                borderRadius: 999,
                border: `1.5px solid ${buttonBg}`,
                cursor: "pointer",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap" as const,
                flexShrink: 0,
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
            >
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}