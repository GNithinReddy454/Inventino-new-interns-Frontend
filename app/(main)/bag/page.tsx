"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  X,
  Heart,
  ShoppingBag,
  ArrowRight,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, addLocalWishlistItem } from "@/redux/wishlistslice";
import { fetchCart, removeFromCart, updateCartQuantity, clearCart, applyPromoCode, removeLocalCartItem, updateLocalCartItemQuantity } from "@/redux/cartslice";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/app/(main)/components/authContext";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  originalPrice?: number;
  color?: string;
  size?: string;
}

interface ToastState {
  title?: string;
  message: string;
  show: boolean;
}

interface AnimatingItem {
  id: string;
  type: "wishlist" | "remove";
}

export default function BagPage() {
  const dispatch = useAppDispatch();
  const { items: reduxCart = [], totalAmount: reduxCartTotal = 0, discount: storeDiscount = 0, promoCode: storePromoCode } = useAppSelector((state: any) => state.cart);
  const { items: savedItems = [] } = useAppSelector((state: any) => state.wishlist);
  const router = useRouter();
  const { user } = useAuth();
  const { cart: localCart, cartTotal: localCartTotal, updateQuantity: updateLocalQuantity, removeFromCart: removeLocalCart, clearCart: clearLocalCart } = useCart();

  const getImageUrl = (imgData: any) => {
    if (!imgData) return "";
    if (typeof imgData === "string") return imgData;
    if (typeof imgData === "object" && imgData.url) return imgData.url;
    return "";
  };

  const mappedRedux = reduxCart.map((item: any) => ({
    productId: String(item.productId || item.product?._id || item._id),
    name: item.productName || item.name || item.product?.name || item.product?.title || "Untitled Product",
    price: item.pricing?.price ?? item.price ?? item.product?.price ?? 0,
    image: getImageUrl(item.media?.mainImage || item.media?.images?.[0] || item.image || item.product?.images?.[0] || item.product?.image),
    quantity: item.quantity || 1,
    originalPrice: item.pricing?.originalPrice ?? item.originalPrice ?? item.product?.originalPrice,
    color: item.selectedVariant?.color || item.color,
    size: item.selectedVariant?.size || item.size,
    id: item.productId || item.product?._id || item._id, // Backwards compatibility for removal
  }));

  const mappedLocal = localCart.map((item: any) => ({
    productId: String(item.id),
    name: item.name || item.title || "Untitled Product",
    price: item.price || 0,
    image: getImageUrl(
      item.image ||
        item.images?.[0] ||
        item.product?.images?.[0] ||
        item.product?.image
    ),
    quantity: item.quantity || 1,
    originalPrice: item.originalPrice,
    color: item.color,
    size: item.size,
    id: item.id, // Keep original ID for filter
  }));

  const cart = user
    ? [...mappedRedux, ...mappedLocal.filter(l => !mappedRedux.some((r: any) => r.productId === l.productId))]
    : mappedLocal;

  const cartTotal = cart.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [animatingItem, setAnimatingItem] = useState<AnimatingItem | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [toast, setToast] = useState<ToastState>({
    title: "Moved to Wishlist!",
    message: "",
    show: false,
  });

  const triggerToast = useCallback(
    (message: string, title: string = "Moved to Wishlist!") => {
      setToast({ title, message, show: true });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    },
    [],
  );

  const isAuthOrSessionError = (errorMessage: string) => {
    const msg = (errorMessage || "").toLowerCase();
    return (
      msg.includes("user not found") ||
      msg.includes("unauthorized") ||
      msg.includes("invalid") ||
      msg.includes("token") ||
      msg.includes("session")
    );
  };

  const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
    const productId = String(item.productId || (item as any)._id || (item as any).id);
    const color = item.color || "";
    const size = item.size || "";
    const requestedQuantity = Number(nextQuantity);

    // If quantity goes to 0 (or below), remove the item from cart.
    if (requestedQuantity <= 0) {
      if (!user) {
        removeLocalCart((item as any).id || productId);
        dispatch(removeLocalCartItem(productId));
        return;
      }

      try {
        await dispatch(
          removeFromCart({ productId, color, size })
        ).unwrap();
      } catch {
        dispatch(removeLocalCartItem(productId));
      }

      removeLocalCart((item as any).id || productId);
      return;
    }

    const safeQuantity = Math.max(1, requestedQuantity);

    if (!user) {
      updateLocalQuantity(item.productId as unknown as number, safeQuantity);
      return;
    }

    try {
      await dispatch(
        updateCartQuantity({
          productId,
          quantity: safeQuantity,
          color,
          size,
        })
      ).unwrap();
      updateLocalQuantity(item.productId as unknown as number, safeQuantity);
    } catch (error: any) {
      const errorMessage = typeof error === "string" ? error : error?.message || "";
      if (isAuthOrSessionError(errorMessage)) {
        updateLocalQuantity(item.productId as unknown as number, safeQuantity);
        dispatch(updateLocalCartItemQuantity({ productId, quantity: safeQuantity, color, size }));
      } else {
        triggerToast("Failed to update quantity", "Error");
      }
    }
  };

  const handleAction = (item: CartItem, type: "wishlist" | "remove") => {
    setAnimatingItem({ id: item.productId, type });
    setTimeout(async () => {
      try {
        const itemId = String(item.productId || (item as any)._id || (item as any).id);
        if (type === "wishlist") {
          const exists = savedItems.some((si: any) => 
            String(si.product?.productId || si.product?._id || si.product?.id || si.productId || si._id || si.id) === itemId
          );
          if (!exists) {
            if (user) {
              await dispatch(
                addWishlistItem({
                  productId: itemId,
                  name: item.name || "",
                  price: Number(item.price || 0),
                  image: item.image || "",
                  category: (item as any).category || "",
                  color: item.color || null,
                  size: item.size || null,
                  quantity: item.quantity || 1,
                })
              ).unwrap();
            } else {
              // Now passing full item object for better guest experience
              dispatch(addWishlistItem(item));
            }
          }
          triggerToast(`${item.name} moved to wishlist`, "Saved!");
        } else {
          triggerToast(`${item.name} removed from cart`, "Removed!");
        }

        if (user) {
          // Robust ID check for backend removal
          const removeId = String(item.productId || (item as any).id || (item as any)._id);
          const removeColor = item.color || "";
          const removeSize = item.size || "";
          try {
            await dispatch(
              removeFromCart({ productId: removeId, color: removeColor, size: removeSize })
            ).unwrap();
          } catch (e) {
            // Fallback for mock/invalid IDs that the server rejects
            dispatch(removeLocalCartItem(removeId));
          }
          removeLocalCart((item as any).id || removeId);
        } else {
          // Robust ID check for local removal
          const removeId = String((item as any).id || item.productId || (item as any)._id);
          removeLocalCart(removeId);
        }
        setAnimatingItem(null);
      } catch (err: any) {
        // Fallback for any other unexpected issues to ensure the UI updates
        const removeId = String(item.productId || (item as any).id || (item as any)._id);
        
        if (type === "wishlist" && removeId !== "undefined") {
          dispatch(addLocalWishlistItem({ _id: removeId, product: item, quantity: 1 }));
          triggerToast(`${item.name} moved to wishlist`, "Saved!");
          if (user) {
            const removeColor = item.color || "";
            const removeSize = item.size || "";
            try { 
              await dispatch(
                removeFromCart({ productId: removeId, color: removeColor, size: removeSize })
              ).unwrap(); 
            } catch (e) {
              dispatch(removeLocalCartItem(removeId));
            }
            removeLocalCart((item as any).id || removeId);
          } else {
            removeLocalCart((item as any).id || removeId);
          }
        } else {
          // FORCE removal even on failure to avoid "stuck" items in UI
          if (type === "remove") {
             if (user) {
               dispatch(removeLocalCartItem(removeId));
               removeLocalCart((item as any).id || removeId);
             }
             else removeLocalCart((item as any).id || removeId);
             triggerToast(`${item.name} removed from cart`, "Removed!");
          } else {
             triggerToast(`Failed to ${type === "wishlist" ? "move to wishlist" : "remove item"}`, "Error");
          }
        }
        setAnimatingItem(null);
      }
    }, 400);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().length > 0) {
      dispatch(applyPromoCode(promoCode.trim())).then((action) => {
        if (applyPromoCode.fulfilled.match(action)) {
          setPromoError("");
          triggerToast("Coupon is Applied Successfully", "Success!");
        } else {
          setPromoError((action.payload as string) || "Invalid promo code");
        }
      });
    }
  };

  const handleAddAllToWishlist = async () => {
    if (cart.length === 0) {
      triggerToast("No items in cart to move", "Cart is empty");
      return;
    }

    let successCount = 0;
    // Process all wishlist additions ensuring they complete before clearing the cart
    for (const item of cart) {
      try {
        const itemId = String(item.productId || (item as any)._id || (item as any).id);
        if (itemId === "undefined" || !itemId) continue;

        const exists = savedItems.some((si: any) =>
          String(si.product?.productId || si.product?._id || si.product?.id || si.productId || si._id || si.id) === itemId
        );
        if (!exists) {
          try {
            if (user) {
              await dispatch(
                addWishlistItem({
                  productId: itemId,
                  name: item.name || "",
                  price: Number(item.price || 0),
                  image: item.image || "",
                  category: (item as any).category || "",
                  color: item.color || null,
                  size: item.size || null,
                  quantity: item.quantity || 1,
                })
              ).unwrap();
            } else {
              // Pass full item object
              dispatch(addWishlistItem(item));
            }
          } catch (e) {
            dispatch(addLocalWishlistItem({ _id: itemId, product: item, quantity: 1 }));
          }
        }
        successCount++;
      } catch (err) {
        // Silently skip tracking console.error to avoid React overlays.
      }
    }

    if (successCount > 0) {
      // Clear the entire cart after all items have been moved to wishlist
      if (user) {
        try { await dispatch(clearCart()).unwrap(); } catch (e) { }
      }
      clearLocalCart();

      triggerToast(
        `${successCount} item${successCount > 1 ? "s" : ""} moved to your wishlist`,
        "Moved to Wishlist!"
      );

      // Automatically redirect to wishlist page
      router.push("/wishlist");
    } else {
      triggerToast("No items could be moved to wishlist", "Error");
    }
  };

  const handleRemoveAllFromCart = async () => {
    if (user) {
      try { await dispatch(clearCart()).unwrap(); } catch (e) { }
    }
    clearLocalCart();
    triggerToast("Cart cleared", "Removed!");
  };

  const discount = storePromoCode ? storeDiscount : 0;
  const discountedTotal = cartTotal - discount;
  const tax = discountedTotal * 0.08;
  const finalTotal = discountedTotal + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 pb-20 overflow-hidden">
        <div className="bg-gray-50/50 p-8 md:p-20 rounded-[2.5rem] md:rounded-[3rem] text-center border-2 border-dashed border-gray-100 max-w-2xl w-full">
          <div className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
            <ShoppingBag size={32} className="text-gray-200" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 font-serif">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 md:mb-10 max-w-sm mx-auto text-sm md:text-base font-sans">
            Looks like you haven&apos;t added any treasures yet.
          </p>
          <Link
            href="/products"
            className="bg-[#D94F7A] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-[#b83d63] transition-all inline-flex items-center gap-2 shadow-lg text-sm md:text-base"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen w-full max-w-[100vw] overflow-x-hidden py-6 px-4 md:px-12 font-sans">
      {/* Toast */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-8 z-100 transition-all duration-300 ${toast.show
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <div className="bg-white rounded-2xl py-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-gray-100 min-w-50 max-w-[88vw]">
          <div className="bg-[#E8456A] w-7 h-7 rounded-full flex items-center justify-center shrink-0">
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
            className="text-gray-300 hover:text-gray-500 shrink-0 ml-1"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9E7EA8] hover:text-[#D94F7A] transition-colors group mb-4"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Shop
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1 font-bold tracking-tight text-center md:text-left">
          Your Shopping Cart
        </h1>
        <p className="text-gray-500 text-xs mb-6 font-sans text-center md:text-left uppercase tracking-widest font-bold">
          Review items and checkout
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* LEFT: Cart Items + Promo Code */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Cart Items */}
            <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <span className="font-bold text-gray-900 uppercase text-[10px] md:text-xs tracking-widest">
                    Cart Items
                  </span>
                  <span className="bg-pink-50 text-[#D94F7A] text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddAllToWishlist}
                    className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-[#D94F7A] hover:text-[#D94F7A] transition-colors text-[10px] sm:text-xs font-semibold text-gray-700 group whitespace-nowrap"
                  >
                    <Heart
                      size={14}
                      className="text-gray-400 group-hover:text-[#D94F7A] transition-colors"
                    />
                    Move All to Wishlist
                  </button>
                  <button
                    onClick={handleRemoveAllFromCart}
                    className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-[#F3D6EE] rounded-xl px-3 py-2 shadow-sm hover:border-red-300 hover:text-red-500 transition-colors text-[10px] sm:text-xs font-semibold text-gray-700 group whitespace-nowrap"
                  >
                    <X
                      size={14}
                      className="text-gray-400 group-hover:text-red-500 transition-colors"
                    />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.map((item: CartItem, idx: number) => {
                  const isAnimating = animatingItem?.id === item.productId;
                  const actionType = animatingItem?.type;
                  const itemId = (item as any)._id || item.productId || `item`;
                  return (
                    <div
                      key={`${itemId}-${idx}`}
                      className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-400 ease-in-out ${isAnimating
                        ? actionType === "wishlist"
                          ? "opacity-0 -translate-y-16 scale-90"
                          : "opacity-0 -translate-x-full"
                        : "opacity-100 translate-x-0 translate-y-0"
                        }`}
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="block group shrink-0"
                      >
                        <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-50 rounded-2xl overflow-hidden border border-pink-50 transition-transform group-hover:scale-105 duration-500">
                          {typeof item.image === "string" && item.image.trim() !== "" ? (
                            <Image
                              src={item.image}
                              alt={item.name || "Product"}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 w-full">
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-gray-900 hover:text-[#E8456A] transition-colors duration-300 sm:max-w-[60%]"
                            >
                              <h3 className="font-bold text-sm md:text-lg leading-tight line-clamp-2">
                                {item.name || "Untitled Product"}
                              </h3>
                            </Link>

                            {/* Actions */}
                            <div className="flex flex-row items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mt-1 sm:mt-0">
                              <button
                                onClick={() => handleAction(item, "wishlist")}
                                className="hover:text-[#E8456A] flex items-center gap-1.5 transition-all text-left group"
                              >
                                <Heart
                                  size={14}
                                  className={
                                    isAnimating && actionType === "wishlist"
                                      ? "fill-[#E8456A] text-[#E8456A]"
                                      : "group-hover:text-[#E8456A]"
                                  }
                                />
                                <span>Save for Later</span>
                              </button>
                              <span className="hidden sm:block h-3 w-px bg-gray-200" />
                              <button
                                onClick={() => handleAction(item, "remove")}
                                className="flex items-center gap-1.5 shrink-0 hover:text-red-500 transition-colors text-left group"
                                aria-label="Remove item"
                              >
                                <X size={14} className="group-hover:text-red-500" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 mt-2 justify-center md:justify-start">
                            <span className="text-[#E8456A] font-black text-xl">
                              ₹{item.price.toFixed(2)}
                            </span>
                            {item.originalPrice &&
                              item.originalPrice > item.price && (
                                <span className="text-gray-400 line-through text-sm">
                                  ₹{item.originalPrice.toFixed(2)}
                                </span>
                              )}
                          </div>

                          {/* Color and Size */}
                          {(item.color || item.size) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center md:justify-start">
                              {item.color && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Color:</span>
                                  <span className="text-xs font-bold text-gray-700">{item.color}</span>
                                </div>
                              )}
                              {(item.size || true) && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Size:</span>
                                  <span className="text-xs font-bold text-gray-700">{item.size || "Free Size"}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="flex justify-start mt-2 md:mt-0 items-center">
                          <div className="flex items-center bg-[#FFF1F2] rounded-full p-0.5 border border-pink-50 shadow-sm h-9 md:h-10 w-fit">
                            <button
                              onClick={() => {
                                const newQ = (item.quantity || 1) - 1;
                                handleQuantityChange(item, newQ);
                              }}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="font-bold text-gray-900 w-10 text-center px-1">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => {
                                const newQ = (item.quantity || 1) + 1;
                                handleQuantityChange(item, newQ);
                              }}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Code */}
            {storePromoCode ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-4xl border border-green-200 shadow-sm p-6 md:p-8 transition-all duration-500 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-700">Coupon is Applied Successfully!</p>
                      <p className="text-xs text-green-600 mt-0.5">10% discount has been applied to your order</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-green-200">
                    Applied
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-4xl border border-dashed border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={15} className="text-[#D94F7A]" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">
                    Promo Code
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    className="w-full sm:flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                    aria-label="Promo code"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="w-full sm:w-auto bg-[#D94F7A] hover:bg-[#b83d63] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                  >
                    Apply Code
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-400 text-xs font-medium mt-2">
                    {promoError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm lg:sticky lg:top-8 h-fit">
            <h3 className="font-bold text-gray-900 mb-6 font-serif text-2xl">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
              {storePromoCode && (
                <div className="flex justify-between text-green-500">
                  <span>Discount (10%)</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-500 font-black uppercase tracking-widest text-[10px]">
                  FREE
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Tax</span>
                <span className="text-gray-900 font-bold">
                  ₹{tax.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-5 border-t border-b border-gray-100 mb-6">
              <span className="font-bold text-gray-900 text-lg font-serif">
                Total
              </span>
              <span className="font-black text-[#D94F7A] text-2xl md:text-l tracking-tight">
                ₹{finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="mb-3">
              <button
                onClick={() => {
                  const rawUser = localStorage.getItem("inventino_user");
                  const token = localStorage.getItem("token");
                  if (rawUser && token) {
                    router.push("/checkout");
                  } else {
                    router.push("/login?redirect=/checkout");
                  }
                }}
                className="w-full bg-[#D94F7A] text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-[#b83d63] transition-all active:scale-[0.98] text-sm tracking-widest uppercase"
              >
                Proceed to Checkout
              </button>
            </div>

            <Link href="/products" className="block">
              <button className="w-full border border-[#D94F7A] text-[#D94F7A] py-4 rounded-2xl font-bold hover:bg-[#D94F7A] hover:text-white transition-all active:scale-[0.98] text-sm tracking-widest uppercase shadow-sm hover:shadow-md">
                Continue Shopping
              </button>
            </Link>

            <div className="mt-6 space-y-2">
              {[
                "Secure checkout with SSL encryption",
                "Shipped with care and love",
                "30-day returns policy",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-[11px] text-gray-400"
                >
                  <span className="text-green-400">✓</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
