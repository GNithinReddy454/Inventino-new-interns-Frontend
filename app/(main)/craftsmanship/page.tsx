"use client";

import { Hammer, Ruler, Sparkles, Gem } from "lucide-react";
import Image from "next/image";

const processes = [
  {
    title: "Hand-Sketched Designs",
    desc: "Every treasure begins with a pencil and paper. Our designers spend weeks refining a single curve to ensure perfect balance.",
    icon: <Ruler className="text-pink-500" size={28} />,
    image: "/sketch-hero.png" 
  },
  {
    title: "Sustainable Sourcing",
    desc: "We only work with ethically sourced gemstones and recycled precious metals to ensure your beauty doesn't cost the earth.",
    icon: <Gem className="text-pink-500" size={28} />,
    image: "/sustainability.png" 
  },
  {
    title: "The Goldsmith's Touch",
    desc: "Using techniques passed down through generations, our artisans hand-forge and set every stone by eye, not by machine.",
    icon: <Hammer className="text-pink-500" size={28} />,
    image: "/artisan-work.png" // Updated to .png
  },
  {
    title: "The Final Polish",
    desc: "Before a piece leaves our hands, it undergoes a multi-stage hand-polishing process to give it the signature Inventino glow.",
    icon: <Sparkles className="text-pink-500" size={28} />,
    image: "/final-polish.png" // Updated to .png
  }
];

export default function CraftsmanshipPage() {
  return (
    <main className="min-h-screen bg-[#FFF9FA] pb-20 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="text-center mb-24">
          <h1 className="text-5xl md:text-8xl font-serif font-light text-gray-900 mb-6">
            Our <span className="text-pink-600 italic">Craft</span>
          </h1>
          <div className="w-20 h-1 bg-pink-200 mx-auto mb-10"></div>
          <p className="text-gray-500 text-xl font-light max-w-3xl mx-auto leading-relaxed">
            In a world of mass production, we choose the slow path. Every Inventino piece is a labor of love, crafted by hand to last a lifetime.
          </p>
        </section>

        {/* PROCESS STEPS */}
        <div className="space-y-32">
          {processes.map((item, index) => (
            <div 
              key={index} 
              className={`flex flex-col md:flex-row items-center gap-12 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* TEXT BOX */}
              <div className="flex-1 bg-white p-10 md:p-14 rounded-[50px] shadow-xl shadow-pink-100/10 border border-pink-50 self-stretch flex flex-col justify-center">
                <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                  {item.icon}
                </div>
                <h2 className="text-3xl font-serif font-medium text-gray-900 mb-6">{item.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed font-light">{item.desc}</p>
              </div>
              
              {/* IMAGE CONTAINER - FULL BLEED LUXURY VERSION */}
              <div className="flex-1 w-full h-[450px] relative rounded-[50px] overflow-hidden shadow-2xl group bg-white border border-pink-50">
                    {item.image ? (
                      <Image 
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority={index < 2} // Pre-loads first two images for better performance
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-pink-50">
                        <span className="text-pink-300 font-serif italic text-xl">Artisan Imagery</span>
                      </div>
                    )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

