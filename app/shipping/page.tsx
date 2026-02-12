"use client";

import { Truck, Globe, ShieldCheck, Clock, Sparkles, MapPin } from "lucide-react";

const shippingDetails = [
  { 
    title: "Domestic Delivery", 
    desc: "Free standard shipping on all Indian orders. Delivery usually takes 3-5 business days.",
    icon: <MapPin className="text-pink-500" size={24} /> 
  },
  { 
    title: "International Shipping", 
    desc: "We ship to over 50 countries. International orders arrive within 7-12 business days via insured carriers.",
    icon: <Globe className="text-pink-500" size={24} /> 
  },
  { 
    title: "Order Processing", 
    desc: "Each piece is hand-finished. Please allow 1-2 business days for our artisans to prepare your order.",
    icon: <Clock className="text-pink-500" size={24} /> 
  },
  { 
    title: "Secure Packaging", 
    desc: "Every item is placed in a signature luxury box and shipped in tamper-evident packaging for safety.",
    icon: <ShieldCheck className="text-pink-500" size={24} /> 
  }
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 pb-20">
      {/* HEADER */}
      <section className="pt-24 pb-12 px-6 text-center">
        <div className="flex justify-center mb-6">
          <Truck className="text-pink-400 w-12 h-12 animate-bounce" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-4">
          Shipping <span className="text-pink-600 italic underline decoration-pink-200 decoration-4 underline-offset-8">Policy</span>
        </h1>
        <p className="mt-8 text-gray-500 font-medium tracking-wide max-w-xl mx-auto">
          How we deliver your handcrafted treasures safely to your doorstep.
        </p>
      </section>

      {/* SHIPPING CARDS */}
      <section className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {shippingDetails.map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-pink-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* TRACKING CTA SECTION */}
      <section className="max-w-4xl mx-auto px-6 mt-20">
        <div className="p-12 rounded-[40px] bg-[#2D1B22] text-white text-center relative overflow-hidden shadow-2xl shadow-pink-200/50">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold mb-4">Track Your Treasure</h2>
            <p className="text-pink-100/70 mb-10 max-w-md mx-auto text-lg font-light">
              Enter your unique order ID to follow your handcrafted piece&apos;s journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Order ID (e.g. #INV-123)" 
                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 flex-1 backdrop-blur-sm" 
              />
              <button className="bg-pink-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-pink-500 transition-all duration-300 shadow-lg active:scale-95">
                Track Now
              </button>
            </div>
          </div>
          {/* DECORATIVE ELEMENTS */}
          <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-pink-400 opacity-10 rotate-12" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </main>
  );
}