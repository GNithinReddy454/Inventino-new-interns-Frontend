"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, CreditCard, ShieldCheck, Truck, Package, RotateCcw, Heart, Gem, MapPin, Gift, Clock } from "lucide-react";

const faqs = [
  { question: "Do you ship worldwide?", answer: "Yes, we offer insured international shipping. Standard delivery takes 7-12 business days, while domestic orders arrive within 3-5 days.", icon: <Truck size={20} className="text-pink-500" /> },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and secure UPI payments. All transactions are encrypted for your security.", icon: <CreditCard size={20} className="text-pink-500" /> },
  { question: "How do I track my order?", answer: "Once your handmade piece is shipped, you will receive a tracking link via email to follow its journey to your doorstep.", icon: <Package size={20} className="text-pink-500" /> },
  { question: "How is Inventino jewelry handcrafted?", answer: "Our artisans use a meticulous 12-step process, combining traditional goldsmithing with modern precision to ensure every piece is a masterpiece.", icon: <Sparkles size={20} className="text-pink-500" /> },
  { question: "Is your jewelry hypoallergenic?", answer: "Yes, we use skin-friendly, nickel-free materials like 925 Silver and 18K Gold plating to ensure comfort for even the most sensitive skin.", icon: <Heart size={20} className="text-pink-500" /> },
  { question: "Can I return my purchase?", answer: "We offer a 14-day return window for unworn items in their original packaging. Please note that custom-made 'Bespoke' pieces are final sale.", icon: <RotateCcw size={20} className="text-pink-500" /> },
  { question: "How do I care for my jewelry?", answer: "To maintain brilliance, store your pieces in the provided Inventino box and avoid contact with water, perfumes, or harsh chemicals.", icon: <ShieldCheck size={20} className="text-pink-500" /> },
  { question: "What materials do you use?", answer: "We use ethically sourced gemstones, recycled 925 sterling silver, and high-quality 14K-18K gold vermeil for a lasting, royal finish.", icon: <Gem size={20} className="text-pink-500" /> },
  { question: "Do you offer gift wrapping?", answer: "Every Inventino piece arrives in our signature luxury gift box, complete with a certificate of authenticity and a velvet pouch.", icon: <Gift size={20} className="text-pink-500" /> },
  { question: "Where is my order being shipped from?", answer: "Our master studio is located in India, where every piece is hand-finished and dispatched directly to you.", icon: <MapPin size={20} className="text-pink-500" /> },
  { question: "Can I change or cancel my order?", answer: "You can modify or cancel your order within 12 hours of placement. After that, our artisans begin crafting your unique piece.", icon: <Clock size={20} className="text-pink-500" /> },
  { question: "Are the gemstones natural?", answer: "We use both natural earth-mined gems and high-quality lab-grown alternatives. Each product page specifies the exact stone used.", icon: <Sparkles size={20} className="text-pink-500" /> }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 pb-20">
      
      {/* 1. HEADER */}
      <section className="pt-24 pb-12 px-6 text-center">
        <div className="flex justify-center mb-6">
          <Sparkles className="text-pink-400 w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-4">
          Common <span className="text-pink-600 italic underline decoration-pink-200 decoration-4 underline-offset-8">Inquiries</span>
        </h1>
        <p className="mt-8 text-gray-500 font-medium tracking-wide max-w-xl mx-auto">
          Discover the artistry and policies behind our collections.
        </p>
      </section>

      {/* 2. ACCORDION LIST */}
      <section className="max-w-3xl mx-auto px-6 mt-10">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`border rounded-2xl transition-all duration-300 ${
                openIndex === index 
                ? 'border-pink-300 bg-white shadow-xl shadow-pink-200/50' 
                : 'border-pink-100 bg-white/80 hover:border-pink-300 hover:bg-white transition-all'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  {faq.icon}
                  <span className={`text-lg font-semibold ${openIndex === index ? 'text-pink-600' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                </div>
                <ChevronDown 
                  className={`text-pink-400 transition-transform duration-500 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed ml-9">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. UNIFIED MIDNIGHT PLUM CTA BOX */}
      <section className="max-w-4xl mx-auto px-6 mt-24">
        <div className="p-12 rounded-[40px] bg-[#2D1B22] text-white text-center relative overflow-hidden shadow-2xl shadow-pink-200/50 border border-white/10">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold mb-4">Still have questions?</h2>
            <p className="text-pink-100/70 mb-10 max-w-md mx-auto text-lg font-light">
              Our support team is here to help you find the perfect piece for your collection.
            </p>
            <Link href="/contact">
              <button className="bg-pink-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-pink-500 transition-all duration-300 shadow-lg active:scale-95">
                Contact Support
              </button>
            </Link>
          </div>
          {/* DECORATIVE ELEMENTS */}
          <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-pink-400 opacity-10 rotate-12" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </main>
  );
}