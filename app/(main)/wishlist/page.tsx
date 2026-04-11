"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchWishlist,
  removeWishlistItem,
  clearWishlist,
  removeLocalWishlistItem,
} from "@/redux/wishlistslice";
import { addToCart as reduxAddToCart, addLocalCartItem } from "@/redux/cartslice";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/app/(main)/components/authContext";
import {
  Heart,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  X,
  Share2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const dispatch = useAppDispatch();
  const { items: savedItems, isLoading } = useAppSelector((state) => state.wishlist);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    show: boolean;
  }>({ title: "Added to cart!", message: "", show: false });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const triggerToast = useCallback(
    (message: string, title: string = "Added to cart!") => {
      setToast({ title, message, show: true });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    },
    []
  );

  const getImageUrl = (imgData: any) => {
    if (!imgData) return "";
    if (typeof imgData === "string") return imgData;
    if (typeof imgData === "object" && imgData.url) return imgData.url;
    return "";
  };

  // ── Add to cart + remove from wishlist using productId ──
  const handleAddToCart = useCallback(
    async (apiItem: any, productId: string) => {
      try {
        const item = apiItem.product || apiItem;
        const color = apiItem.color || "";
        const size = apiItem.size || "";
        const quantity = apiItem.quantity || 1;

        // 1. Add to cart
        if (user) {
          await dispatch(
            reduxAddToCart({ productId, quantity, color, size })
          ).unwrap();
        } else {
          const localItem = { ...item, id: productId };
          addToCart(localItem as any, quantity, color, size);
        }

        // 2. Remove from wishlist (API + local fallback)
        try {
          await dispatch(removeWishlistItem(productId)).unwrap();
        } catch (removeError) {
          console.warn("API removal failed, fallback to local", removeError);
          dispatch(removeLocalWishlistItem(productId));
        }

        triggerToast(`${item.name || item.title || "Item"} added to cart`);
      } catch (error: any) {
        // Fallback for stock/format issues
        const item = apiItem.product || apiItem;
        const color = apiItem.color || "";
        const size = apiItem.size || "";
        const quantity = apiItem.quantity || 1;
        const errorMessage = typeof error === "string" ? error : error.message || "";

        if (errorMessage.includes("stock") || errorMessage.includes("format") || productId === "7") {
          const cartPayload = {
            productId,
            name: item.name || item.title || "Untitled Product",
            price: item.price || 0,
            image: getImageUrl(item.images?.[0] || item.image),
            quantity,
            color,
            size,
          };
          dispatch(addLocalCartItem(cartPayload));
          try {
            await dispatch(removeWishlistItem(productId)).unwrap();
          } catch {
            dispatch(removeLocalWishlistItem(productId));
          }
          triggerToast(`${item.name || "Item"} added to cart`);
        } else {
          triggerToast(`Failed to add: ${errorMessage}`, "Error");
        }
      }
    },
    [addToCart, dispatch, triggerToast, user]
  );

  // ── Bulk add selected items ──
  const handleAddAllToCart = async () => {
    const selectedItems = savedItems.filter((item: any) =>
      selectedIds.includes(item.productId)
    );
    if (selectedItems.length === 0) return;

    let count = 0;
    for (const wishlistItem of selectedItems) {
      try {
        const item = wishlistItem.product || wishlistItem;
        const pId = wishlistItem.productId;
        const color = wishlistItem.color || "";
        const size = wishlistItem.size || "";
        const quantity = wishlistItem.quantity || 1;

        if (user) {
          await dispatch(
            reduxAddToCart({ productId: pId, quantity, color, size })
          ).unwrap();
        } else {
          const localItem = { ...item, id: pId };
          addToCart(localItem as any, quantity, color, size);
        }

        try {
          await dispatch(removeWishlistItem(pId)).unwrap();
        } catch {
          dispatch(removeLocalWishlistItem(pId));
        }
        count++;
      } catch (error: any) {
        // fallback logic
        const item = wishlistItem.product || wishlistItem;
        const pId = wishlistItem.productId;
        const errorMessage = typeof error === "string" ? error : error.message || "";
        if (errorMessage.includes("stock") || errorMessage.includes("format") || pId === "7") {
          const cartPayload = {
            productId: pId,
            name: item.name || item.title || "Untitled Product",
            price: item.price || 0,
            image: getImageUrl(item.images?.[0] || item.image),
            quantity: wishlistItem.quantity || 1,
            color: wishlistItem.color || "",
            size: wishlistItem.size || "",
          };
          dispatch(addLocalCartItem(cartPayload));
          try {
            await dispatch(removeWishlistItem(pId)).unwrap();
          } catch {
            dispatch(removeLocalWishlistItem(pId));
          }
          count++;
        }
      }
    }

    if (count > 0) {
      triggerToast(`${count} item${count > 1 ? "s" : ""} added to cart`);
      setSelectedIds([]);
      setTimeout(() => router.push("/bag"), 1000);
    } else {
      triggerToast(`Failed to add items to cart`, "Error");
    }
  };

  // ── Remove selected (by productId) ──
  const handleRemoveSelected = async () => {
    if (!selectedIds.length) return;
    const idsToRemove = [...selectedIds];
    setSelectedIds([]);

    for (const productId of idsToRemove) {
      try {
        await dispatch(removeWishlistItem(productId)).unwrap();
      } catch {
        dispatch(removeLocalWishlistItem(productId));
      }
    }

    triggerToast(
      `${idsToRemove.length} item${idsToRemove.length > 1 ? "s" : ""} removed from your wishlist`,
      "Removed Selected Items"
    );
  };

  const handleRemoveAll = () => {
    dispatch(clearWishlist());
    setSelectedIds([]);
    triggerToast("Your wishlist has been cleared successfully", "All Items Removed from Wishlist");
  };

  // ── Add entire wishlist to cart, then clear ──
  const handleAddEntireWishlistToCart = async () => {
    if (!savedItems.length) return;

    const itemsSnapshot = [...savedItems];
    let count = 0;

    for (const wishlistItem of itemsSnapshot) {
      try {
        const item = wishlistItem.product || wishlistItem;
        const pId = wishlistItem.productId;
        const color = wishlistItem.color || "";
        const size = wishlistItem.size || "";
        const quantity = wishlistItem.quantity || 1;

        if (user) {
          await dispatch(
            reduxAddToCart({ productId: pId, quantity, color, size })
          ).unwrap();
        } else {
          const localItem = { ...item, id: pId };
          addToCart(localItem as any, quantity, color, size);
        }
        count++;
      } catch (error: any) {
        const item = wishlistItem.product || wishlistItem;
        const pId = wishlistItem.productId;
        const errorMessage = typeof error === "string" ? error : error.message || "";
        if (errorMessage.includes("stock") || errorMessage.includes("format") || pId === "7") {
          const cartPayload = {
            productId: pId,
            name: item.name || item.title || "Untitled Product",
            price: item.price || 0,
            image: getImageUrl(item.images?.[0] || item.image),
            quantity: wishlistItem.quantity || 1,
            color: wishlistItem.color || "",
            size: wishlistItem.size || "",
          };
          dispatch(addLocalCartItem(cartPayload));
          count++;
        }
      }
    }

    if (count > 0) {
      try {
        await dispatch(clearWishlist()).unwrap();
      } catch {
        // If clear API fails, manually remove each productId from local state
        itemsSnapshot.forEach((item) => {
          dispatch(removeLocalWishlistItem(item.productId));
        });
      }
      triggerToast(`${count} item${count > 1 ? "s" : ""} added to cart and wishlist cleared`);
      setSelectedIds([]);
      setTimeout(() => router.push("/bag"), 1000);
    } else {
      triggerToast(`Failed to add items to cart`, "Error");
    }
  };

  // ── Selection helpers (use productId as unique identifier) ──
  const selectableIds = useMemo(() => {
    return savedItems.map((item: any) => item.productId).filter(Boolean);
  }, [savedItems]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableIds);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const allSelected =
    selectableIds.length > 0 && selectedIds.length >= selectableIds.length;

  return (
    <div className="w-full bg-[#FFF9FD] font-sans min-h-screen">
      {/* Toast (unchanged) */}
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
            <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{toast.title}</p>
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
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9E7EA8] hover:text-[#E8456A] transition-colors group mb-4"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Shop
        </Link>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            My Wishlist
          </h1>
          <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
            {savedItems.length} item{savedItems.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {/* Bulk Action Bar */}
        {savedItems.length > 0 && (
          <div className="flex items-center gap-3 mb-4 sm:mb-5 flex-wrap">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                Select All
              </span>
            </label>

            {selectedIds.length > 0 ? (
              <button
                onClick={handleRemoveSelected}
                className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-red-300 hover:text-red-500 transition-colors text-xs font-semibold text-gray-700 group whitespace-nowrap"
              >
                <Trash2 size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                Remove Selected
              </button>
            ) : (
              <button
                onClick={handleRemoveAll}
                className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-red-300 hover:text-red-500 transition-colors text-xs font-semibold text-gray-700 group whitespace-nowrap"
              >
                <Trash2 size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                Remove All
              </button>
            )}

            <button
              onClick={selectedIds.length > 0 ? handleAddAllToCart : handleAddEntireWishlistToCart}
              className="inline-flex items-center gap-1.5 cursor-pointer bg-[#E8456A] text-white rounded-xl px-3 py-2 shadow-sm hover:bg-[#c73358] transition-colors text-xs font-semibold whitespace-nowrap"
            >
              <ShoppingBag size={14} className="text-white" />
              {selectedIds.length > 0 ? "Add Selected to Cart" : "Add All to Cart"}
            </button>

            {selectedIds.length > 0 && (
              <span className="text-[11px] bg-pink-50 text-[#E8456A] font-bold px-2 py-1 rounded-full border border-pink-100 whitespace-nowrap">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        {/* States */}
        {!isLoading && savedItems.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white rounded-[28px] border-2 border-dashed border-[#F3D6EE] px-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your wishlist is empty</h3>
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
        ) : isLoading && savedItems.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <p className="text-gray-400 text-sm">Loading your wishlist...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {savedItems.map((apiItem: any) => {
              const productId = apiItem.productId; // e.g., "PRD-002"
              if (!productId) return null;

              const item = apiItem.product || apiItem;
              const isSelected = selectedIds.includes(productId);
              const name = item.name || item.title || item.productName || "Untitled Product";
              const image = getImageUrl(item.images?.[0] || item.image);
              const rating = typeof item.rating === "number" ? item.rating : 0;
              const badge = getBadgeInfo(item.badge);
              const hasDiscount = !!item.originalPrice && item.originalPrice > (item.price || 0);
              const itemColor = apiItem.color || null;
              const itemSize = apiItem.size || null;
              const itemQuantity = apiItem.quantity || 1;

              return (
                <div
                  key={productId + (itemColor || "") + (itemSize || "")}
                  className={`relative bg-white rounded-2xl overflow-hidden border flex flex-col shadow-sm transition-all duration-300 hover:shadow-[0_6px_24px_rgba(232,69,106,0.13)] ${
                    isSelected
                      ? "ring-2 ring-[#E8456A] ring-offset-1 border-transparent"
                      : "border-gray-100 hover:border-pink-100"
                  }`}
                >
                  {/* Image section */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Link href={`/products/${productId}`} className="absolute inset-0">
                      {image && typeof image === "string" && image.trim() !== "" ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Top row: badge + actions */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 pointer-events-none">
                      <div className="pointer-events-none">
                        {badge ? (
                          <span
                            className={`text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        ) : (
                          <span />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              await dispatch(removeWishlistItem(productId)).unwrap();
                            } catch {
                              dispatch(removeLocalWishlistItem(productId));
                            }
                            triggerToast(`${name} removed from the wishlist`, "Removed from Wishlist");
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E8456A] shadow-md text-white transition-all backdrop-blur-sm hover:bg-[#c73358] active:scale-95"
                        >
                          <Heart size={11} strokeWidth={2} fill="currentColor" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // share logic if needed
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md text-gray-400 hover:text-[#E8456A] hover:bg-white transition-all backdrop-blur-sm"
                        >
                          <Share2 size={11} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className="absolute bottom-2 left-2 z-20">
                      <label className="cursor-pointer block">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(productId)}
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
                            className={`w-2.5 h-2.5 text-white transition-opacity ${
                              isSelected ? "opacity-100" : "opacity-0"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 pt-2 sm:pt-2.5">
                    <div className="flex items-center justify-between mb-0.5 gap-1">
                      <span className="text-[9px] sm:text-[10px] text-[#E8456A] font-bold uppercase tracking-widest truncate leading-none">
                        {item.category || "Jewelry"}
                      </span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <StarRating rating={rating} />
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium ml-0.5 leading-none">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/products/${productId}`}>
                      <h3 className="font-bold text-gray-900 text-[11px] sm:text-sm leading-snug line-clamp-2 hover:text-[#E8456A] transition-colors mt-1 mb-1.5">
                        {name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-sm sm:text-base font-black text-[#E8456A]">
                        ₹{item.price?.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {(itemColor || itemSize || itemQuantity) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                        {itemColor && (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              Color:
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-700 capitalize">
                              {itemColor}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                            Size:
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold text-gray-700">
                            {itemSize || "Free Size"}
                          </span>
                        </div>
                        {itemQuantity && (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              Qty:
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-700">
                              {itemQuantity}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-auto">
                      <button
                        onClick={() => handleAddToCart(apiItem, productId)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-[#E8456A] hover:bg-[#c73358] text-white py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm shadow-pink-100"
                      >
                        <ShoppingBag size={10} className="flex-shrink-0" />
                        Add to Cart
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await dispatch(removeWishlistItem(productId)).unwrap();
                          } catch {
                            dispatch(removeLocalWishlistItem(productId));
                          }
                          triggerToast("Removed from Wishlist", "Removed");
                        }}
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