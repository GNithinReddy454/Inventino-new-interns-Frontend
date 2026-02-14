"use client";

import Link from "next/link";
import { Minus, Plus, X, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/lib/cartContext";

export default function BagPage() {
  const { cart, addToCart, removeFromCart } = useCart();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 500 ? 0 : 0;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif mb-4 text-gray-800">
          Your Shopping Cart is Empty
        </h2>
        <Link href="/AllProducts" className="text-pink-500 font-bold underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fdf8f9] min-h-screen py-12 px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-gray-800 mb-2">
          Your Shopping Cart
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          Review your items and proceed to checkout
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
                <span className="font-bold text-gray-700">Cart Items</span>
                <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full font-bold">
                  {cart.length} Items
                </span>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="p-6 flex gap-6 border-b border-gray-50 last:border-0 relative">
                  
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {item.name}
                        </h3>

                        {/* Remove completely */}
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-gray-300 hover:text-pink-500 flex items-center gap-1 text-[10px] uppercase font-bold transition-colors"
                        >
                          <X size={12} /> Remove
                        </button>
                      </div>

                      <p className="text-pink-500 font-bold text-sm mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex justify-end mt-2">
                      <div className="flex items-center border border-gray-100 rounded-full px-2 py-1 bg-white shadow-sm">
                        
                        <button 
                          onClick={() =>
                            item.quantity && item.quantity > 1
                              ? addToCart(item, -1)
                              : removeFromCart(item.id)
                          }
                          className="p-1 text-gray-400 hover:text-pink-500"
                        >
                          <Minus size={14}/>
                        </button>

                        <span className="font-bold text-gray-700 w-8 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button 
                          onClick={() => addToCart(item, 1)}
                          className="p-1 text-gray-400 hover:text-pink-500"
                        >
                          <Plus size={14}/>
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-pink-100 shadow-sm sticky top-32">
              <h3 className="font-bold text-gray-800 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 border-b border-gray-50 pb-6 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-800 font-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold uppercase">
                    Free
                  </span>
                </div>

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Estimated Tax</span>
                  <span className="text-gray-800 font-bold">
                    ${estimatedTax.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-gray-800 text-lg">Total</span>
                <span className="font-bold text-pink-500 text-xl">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Link href="/checkout" className="w-full">
              <button className="w-full bg-pink-500 text-white py-4 rounded-full font-bold shadow-lg hover:bg-pink-600 transition-all active:scale-95">
                Proceed to Checkout
              </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
