"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, X, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";

export default function BagPage() {
  // Ensure we are destructuring correctly from the context
  const { cart = [], removeFromCart, updateQuantity, cartTotal = 0 } = useCart();
  const { handleSaved, savedItems = [] } = useStore();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<{id: number, type: 'wishlist' | 'remove'} | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleAction = (item: any, type: 'wishlist' | 'remove') => {
    setAnimatingItem({ id: item.id, type });
    
    setTimeout(() => {
      if (type === 'wishlist') {
        if (!savedItems.some((si: any) => si.id === item.id)) {
          handleSaved(item);
        }
      }
      removeFromCart(item.id);
      setAnimatingItem(null);
    }, 400);
  };

  if (!isLoaded) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 pt-24 pb-20 overflow-hidden">
        <div className="bg-gray-50/50 p-8 md:p-20 rounded-[2.5rem] md:rounded-[3rem] text-center border-2 border-dashed border-gray-100 max-w-2xl w-full">
          <div className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
             <ShoppingBag size={32} className="text-gray-200" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 font-serif">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 md:mb-10 max-w-sm mx-auto text-sm md:text-base font-sans">Looks like you haven't added any treasures yet.</p>
          <Link href="/AllProducts" className="bg-[#D94F7A] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-[#b83d63] transition-all inline-flex items-center gap-2 shadow-lg text-sm md:text-base">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    /* SCROLL PREVENTION: Added w-full and overflow-x-hidden.
      This stops the page from wiggling left and right on mobile.
    */
    <div className="bg-[#fafafa] min-h-screen w-full max-w-[100vw] overflow-x-hidden py-8 md:py-12 px-4 md:px-12 font-sans pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2 font-bold tracking-tight text-center md:text-left">Your Shopping Cart</h1>
        <p className="text-gray-500 text-xs md:text-sm mb-8 md:mb-10 font-sans text-center md:text-left uppercase tracking-widest font-bold">Review items and checkout</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-white">
              <span className="font-bold text-gray-900 uppercase text-[10px] md:text-xs tracking-widest">Cart Items</span>
              <span className="bg-pink-50 text-[#D94F7A] text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {cart.map((item) => {
                const isAnimating = animatingItem?.id === item.id;
                const actionType = animatingItem?.type;

                return (
                  <div 
                    key={item.id} 
                    className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 border-b border-gray-50 last:border-0 transition-all duration-400 ease-in-out ${
                      isAnimating 
                        ? actionType === 'wishlist' 
                          ? "opacity-0 -translate-y-16 scale-90" 
                          : "opacity-0 -translate-x-full"       
                        : "opacity-100 translate-x-0 translate-y-0"
                    }`}
                  >
                    <Link href={`/AllProducts/${item.id}`} className="block group shrink-0 mx-auto md:mx-0">
                      <div className="w-32 h-32 md:w-28 md:h-28 bg-gray-50 rounded-2xl overflow-hidden border border-pink-50 transition-transform group-hover:scale-105 duration-500 shadow-inner">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                          <Link 
                            href={`/AllProducts/${item.id}`} 
                            className="text-gray-900 hover:text-[#D94F7A] transition-colors duration-300"
                          >
                            <h3 className="font-bold text-lg md:text-xl leading-tight font-sans truncate">
                              {item.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center justify-center md:justify-start gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-300">
                            <button 
                              onClick={() => handleAction(item, 'wishlist')}
                              className="hover:text-[#D94F7A] flex items-center gap-1.5 transition-all"
                            >
                              <Heart size={12} className={isAnimating && actionType === 'wishlist' ? "fill-[#D94F7A]" : ""} /> Wishlist
                            </button>
                            <span className="h-3 w-[1px] bg-gray-200"></span>
                            <button 
                              onClick={() => handleAction(item, 'remove')} 
                              className="hover:text-red-500 flex items-center gap-1.5 transition-all"
                            >
                              <X size={12} /> Remove
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-900 font-black text-xl mt-3 md:mt-1 font-sans">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex justify-center md:justify-end mt-6 md:mt-2">
                        <div className="flex items-center bg-[#FFF1F2] rounded-full p-1 border border-pink-50 shadow-sm h-12 w-fit">
                          <button 
                            /* FIXED: Calling updateQuantity carefully */
                            onClick={() => updateQuantity && updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="font-bold text-gray-900 w-12 text-center text-lg px-1">
                            {item.quantity || 1}
                          </span>
                          <button 
                            /* FIXED: Calling updateQuantity carefully */
                            onClick={() => updateQuantity && updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm hover:scale-110 active:scale-95 transition-all"
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

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm lg:sticky lg:top-32 h-fit mb-10 overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-6 md:mb-8 font-serif text-2xl text-center md:text-left">Order Summary</h3>
            <div className="space-y-4 mb-8 border-b border-gray-50 pb-8 text-sm md:text-base">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Shipping</span>
                <span className="text-green-500 font-black uppercase tracking-widest text-[10px]">Free</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Estimated Tax</span>
                <span className="text-gray-900 font-bold">${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8 md:mb-10">
              <span className="font-bold text-gray-900 text-xl font-serif">Total</span>
              <span className="font-black text-[#D94F7A] text-2xl md:text-3xl tracking-tight">${(cartTotal * 1.08).toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="block">
                <button className="w-full bg-[#D94F7A] text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-bold shadow-xl shadow-pink-100 hover:bg-[#b83d63] transition-all active:scale-[0.98] uppercase text-[10px] md:text-xs tracking-widest">
                Proceed to Checkout
                </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}