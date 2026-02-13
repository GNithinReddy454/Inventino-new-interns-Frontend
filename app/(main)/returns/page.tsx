"use client";

import Link from "next/link";
import { Gem, Sparkles, ArrowRight, PackageCheck, Search, ClipboardCheck, Heart } from "lucide-react";

const returnSteps = [
  { 
    title: "14-Day Grace Period", 
    desc: "We offer a 14-day return window for all unworn jewelry in its original Inventino signature packaging.",
    icon: <PackageCheck className="text-pink-500" size={28} />
  },
  { 
    title: "Artisan Inspection", 
    desc: "Every return is meticulously inspected by our master goldsmiths to ensure the piece remains in pristine condition.",
    icon: <Search className="text-pink-500" size={28} />
  },
  { 
    title: "Seamless Refund", 
    desc: "Approved refunds are processed to your original payment method within 5-7 business days.",
    icon: <ClipboardCheck className="text-pink-500" size={28} />
  },
  { 
    title: "Bespoke Items", 
    desc: "Please note that custom-engraved and personalized pieces are handcrafted for you and are final sale.",
    icon: <Heart className="text-pink-500" size={28} />
  }
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-[#FFF9FA] pb-20">
      {/* 1. ELEGANT HEADER */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="flex justify-center mb-4">
          <Gem className="text-pink-600 w-10 h-10" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-gray-900 mb-6">
          Returns & <span className="text-pink-600 italic">Exchanges</span>
        </h1>
        <div className="w-24 h-1 bg-pink-200 mx-auto mb-8 rounded-full"></div>
        <p className="text-gray-500 font-light text-lg max-w-2xl mx-auto leading-relaxed">
          Your satisfaction is our priority. If your handmade treasure isn&apos;t perfect, our concierge team is here to assist.
        </p>
      </section>

      {/* 2. ICON GRID - Clean & Spaced */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {returnSteps.map((item, index) => (
          <div key={index} className="group bg-white p-10 rounded-[32px] border border-pink-100/50 hover:border-pink-300 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-100/30 text-center">
            <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{item.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-light">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 3. THE "ROYAL" MIDNIGHT CONCIERGE BOX */}
      <section className="max-w-5xl mx-auto px-6 mt-24">
        <div className="p-16 rounded-[50px] bg-[#1A0F13] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-serif font-medium mb-4">Start Your Return</h2>
              <p className="text-pink-100/60 max-w-sm text-lg font-light">
                Contact our concierge with your order ID to begin your return journey.
              </p>
            </div>
            <Link href="/contact">
              <button className="group bg-white text-gray-900 px-10 py-5 rounded-2xl font-semibold hover:bg-pink-600 hover:text-white transition-all duration-500 flex items-center gap-3">
                Contact Concierge
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          {/* LUXURY DECORATION */}
          <Sparkles className="absolute -top-10 -right-10 w-48 h-48 text-pink-500/10 rotate-12" />
        </div>
      </section>
    </main>
  );
}

