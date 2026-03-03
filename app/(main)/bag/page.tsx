"use client";
import { Roboto } from "next/font/google";
import { Button } from "@/app/components/ui/button";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";
import { useRouter } from "next/navigation";

export default function BagPage() {
  const {
    cart = [],
    removeFromCart,
    updateQuantity,
    cartTotal = 0,
    clearCart,
  } = useCart();
  const { handleSaved, savedItems = [] } = useStore();
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<{
    id: number;
    type: "wishlist" | "remove";
  } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    show: boolean;
  }>({ title: "Moved to Wishlist!", message: "", show: false });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const triggerToast = useCallback(
    (message: string, title: string = "Moved to Wishlist!") => {
      setToast({ title, message, show: true });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    },
    [],
  );

  const handleAction = (item: any, type: "wishlist" | "remove") => {
    setAnimatingItem({ id: item.id, type });
    setTimeout(() => {
      if (type === "wishlist") {
        if (!savedItems.some((si: any) => si.id === item.id)) handleSaved(item);
      }
      removeFromCart(item.id);
      setAnimatingItem(null);
    }, 400);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code. Try SAVE10.");
    }
  };

  const handleAddAllToWishlist = () => {
    let count = 0;
    cart.forEach((item) => {
      if (!savedItems.some((si: any) => si.id === item.id)) {
        handleSaved(item as any);
        count++;
      }
    });
    if (cart.length > 0) {
      triggerToast(
        `${cart.length} item${cart.length > 1 ? "s" : ""} added to your wishlist`,
      );
    } else {
      triggerToast("No items in cart to move", "Cart is empty");
    }
  };

  const handleRemoveAllFromCart = () => {
    if (clearCart) {
      clearCart();
    }
  };

  const discount = promoApplied ? cartTotal * 0.1 : 0;
  const discountedTotal = cartTotal - discount;
  const tax = discountedTotal * 0.08;
  const finalTotal = discountedTotal + tax;

  if (!isLoaded) return null;

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
            Looks like you haven't added any treasures yet.
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
      {/* ── Toast ── */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-8 z-[100] transition-all duration-300 ${toast.show
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

      <div className="max-w-7xl mx-auto">
        {/* ── Back ── */}
        <Link
          href="/all-products"
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
          {/* ── LEFT: Cart Items + Promo Code ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Cart Items */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <span className="font-bold text-gray-900 uppercase text-[10px] md:text-xs tracking-widest">
                    Cart Items
                  </span>
                  <span className="bg-pink-50 text-[#D94F7A] text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* ── Bulk Actions ── */}
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

              <div className="divide-y divide-gray-50">
                {cart.map((item) => {
                  const isAnimating = animatingItem?.id === item.id;
                  const actionType = animatingItem?.type;
                  return (
                    <div
                      key={item.id}
                      className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-400 ease-in-out ${isAnimating
                          ? actionType === "wishlist"
                            ? "opacity-0 -translate-y-16 scale-90"
                            : "opacity-0 -translate-x-full"
                          : "opacity-100 translate-x-0 translate-y-0"
                        }`}
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.id}`}
                        className="block group shrink-0 mx-auto md:mx-0"
                      >
                        <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-50 rounded-2xl overflow-hidden border border-pink-50 transition-transform group-hover:scale-105 duration-500">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:justify-between gap-2">
                            <Link
                              href={`/products/${item.id}`}
                              className="text-gray-900 hover:text-[#E8456A] transition-colors duration-300"
                            >
                              <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>

                            {/* Actions on Desktop */}
                            <div className="flex items-center justify-center md:justify-start gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-300 shrink-0">
                              <button
                                onClick={() => handleAction(item, "wishlist")}
                                className="hover:text-[#E8456A] flex items-center gap-1.5 transition-all"
                              >
                                <Heart
                                  size={12}
                                  className={
                                    isAnimating && actionType === "wishlist"
                                      ? "fill-[#E8456A]"
                                      : ""
                                  }
                                />
                                Back to Wishlist
                              </button>
                              <span className="h-3 w-[1px] bg-gray-200" />
                              <button
                                onClick={() => handleAction(item, "remove")}
                                className="shrink-0 text-gray-300 hover:text-red-400 transition-colors ml-1"
                                aria-label="Remove item"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 mt-2 justify-center md:justify-start">
                            <span className="text-[#E8456A] font-black text-xl">
                              ₹{item.price.toFixed(2)}
                            </span>
                            {(item as any).originalPrice &&
                              (item as any).originalPrice > item.price && (
                                <span className="text-gray-400 line-through text-sm">
                                  ₹{(item as any).originalPrice.toFixed(2)}
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex justify-center md:justify-start mt-4 md:mt-0 items-center">
                          <div className="flex items-center bg-[#FFF1F2] rounded-full p-0.5 border border-pink-50 shadow-sm h-10 w-fit">
                            <button
                              onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="font-bold text-gray-900 w-10 text-center text-sm px-1 text-lg">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity && updateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Promo Code ── */}
            <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm p-6 md:p-8">
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
                    setPromoApplied(false);
                  }}
                  className="w-full sm:flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
                />
                <button
                  onClick={handleApplyPromo}
                  className="w-full sm:w-auto bg-[#D94F7A] hover:bg-[#b83d63] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                >
                  Apply Code
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                  ✓ Promo applied! 10% discount added.
                </p>
              )}
              {promoError && (
                <p className="text-red-400 text-xs font-medium mt-2">
                  {promoError}
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm lg:sticky lg:top-8 h-fit">
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
              {promoApplied && (
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
              <button className="w-full border border-[#D94F7A] text-[#D94F7A] py-4 rounded-2xl font-bold hover:bg-pink-50 transition-all active:scale-[0.98] text-sm tracking-widest uppercase">
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
