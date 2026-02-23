"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, X, Heart, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";

export default function BagPage() {
  const { cart = [], removeFromCart, updateQuantity, cartTotal = 0 } = useCart();
  const { handleSaved, savedItems = [] } = useStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<{ id: number; type: "wishlist" | "remove" } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => { setIsLoaded(true); }, []);

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

  const discount = promoApplied ? cartTotal * 0.1 : 0;
  const discountedTotal = cartTotal - discount;
  const tax = discountedTotal * 0.08;
  const finalTotal = discountedTotal + tax;

  if (!isLoaded) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pt-24 pb-20 overflow-hidden">
        <div className="bg-card p-8 md:p-20 rounded-[2.5rem] md:rounded-[3rem] text-center border-2 border-dashed border-border max-w-2xl w-full shadow-sm">
          <div className="bg-background w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
            <ShoppingBag size={32} className="text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 font-serif">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 md:mb-10 max-w-sm mx-auto text-sm md:text-base font-sans">Looks like you haven't added any treasures yet.</p>
          <Link href="/AllProducts" className="bg-primary text-primary-foreground px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-lg shadow-pink-200 text-sm md:text-base">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full max-w-[100vw] overflow-x-hidden py-8 md:py-12 px-4 md:px-12 font-sans pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2 font-bold tracking-tight text-center md:text-left">Your Shopping Cart</h1>
        <p className="text-muted-foreground text-xs md:text-sm mb-8 md:mb-10 font-sans text-center md:text-left uppercase tracking-widest font-bold">Review items and checkout</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">

          <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden h-fit">
            <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-card">
              <span className="font-bold text-foreground uppercase text-[10px] md:text-xs tracking-widest">Cart Items</span>
              <span className="bg-accent text-primary-dark text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="divide-y divide-border">
              {cart.map((item) => {
                const isAnimating = animatingItem?.id === item.id;
                const actionType = animatingItem?.type;

                return (
                  <div
                    key={item.id}
                    className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-400 ease-in-out ${isAnimating
                      ? actionType === 'wishlist'
                        ? "opacity-0 -translate-y-16 scale-90"
                        : "opacity-0 -translate-x-full"
                      : "opacity-100 translate-x-0 translate-y-0"
                      }`}
                  >
                    <Link href={`/AllProducts/${item.id}`} className="block group shrink-0 mx-auto md:mx-0">
                      <div className="w-32 h-32 md:w-28 md:h-28 bg-muted rounded-2xl overflow-hidden border border-border transition-transform group-hover:scale-105 duration-500 shadow-inner">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                          <Link
                            href={`/AllProducts/${item.id}`}
                            className="text-foreground hover:text-primary-dark transition-colors duration-300"
                          >
                            <h3 className="font-bold text-lg md:text-xl leading-tight font-sans truncate">
                              {item.name}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-center md:justify-start gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <button
                              onClick={() => handleAction(item, 'wishlist')}
                              className="hover:text-primary-dark flex items-center gap-1.5 transition-all"
                            >
                              <Heart size={12} className={isAnimating && actionType === 'wishlist' ? "fill-primary-dark" : ""} /> Wishlist
                            </button>
                            <span className="h-3 w-[1px] bg-border"></span>
                            <button
                              onClick={() => handleAction(item, 'remove')}
                              className="hover:text-destructive flex items-center gap-1.5 transition-all"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                        <p className="text-foreground font-black text-xl mt-3 md:mt-1 font-sans">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex justify-center md:justify-end mt-6 md:mt-2">
                        <div className="flex items-center bg-accent rounded-full p-1 border border-border shadow-sm h-12 w-fit">
                          <button
                            onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-primary-dark shadow-sm hover:scale-110 active:scale-95 transition-all"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="font-bold text-foreground w-12 text-center text-lg px-1">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity && updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-primary-dark shadow-sm hover:scale-110 active:scale-95 transition-all"
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

          {/* ── Promo Code — matches Figma ── */}
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={15} className="text-[#D94F7A]" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Promo Code</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); setPromoApplied(false); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D94F7A] transition-colors"
              />
              <button
                onClick={handleApplyPromo}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
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
              <p className="text-red-400 text-xs font-medium mt-2">{promoError}</p>
            )}
          </div>
        </div>

        {/* ── Order Summary — mt-8 added to create space from the grid above ── */}
        <div className="mt-8 bg-card rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-border shadow-sm lg:sticky lg:top-32 h-fit mb-10 overflow-hidden">
          <h3 className="font-bold text-foreground mb-6 md:mb-8 font-serif text-2xl text-center md:text-left">Order Summary</h3>
          <div className="space-y-4 mb-8 border-b border-border pb-8 text-sm md:text-base">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Subtotal</span>
              <span className="text-foreground font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Shipping</span>
              <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Free</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Estimated Tax</span>
              <span className="text-foreground font-bold">${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-8 md:mb-10">
            <span className="font-bold text-foreground text-xl font-serif">Total</span>
            <span className="font-black text-primary-dark text-2xl md:text-3xl tracking-tight">${(cartTotal * 1.08).toFixed(2)}</span>
          </div>

          <Link href="/checkout" className="block">
            <button className="w-full bg-primary text-primary-foreground py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-bold shadow-xl shadow-pink-200 hover:bg-primary-dark transition-all active:scale-[0.98] uppercase text-sm tracking-widest">
              Proceed to Checkout
            </button>
          </Link>

          {/* Added mt-3 gap between the two buttons */}
          <Link href="/AllProducts" className="block mt-3">
            <button className="w-full border border-[#D94F7A] text-[#D94F7A] py-4 rounded-2xl font-bold hover:bg-pink-50 transition-all active:scale-[0.98] text-sm tracking-widest uppercase">
              Continue Shopping
            </button>
          </Link>

          {/* Trust badges */}
          <div className="mt-6 space-y-2">
            {["Secure checkout with SSL encryption", "Shipped with care and love", "30-day returns policy"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className="text-green-400">✓</span>
                {text}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}