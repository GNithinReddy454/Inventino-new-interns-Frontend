'use client';

import ClientOnly from './ClientOnly';

export default function CorporateGifting() {
  return (
    <section className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 md:mb-4">
          Corporate Gifting
        </h2>
        <div className="h-1 w-20 bg-white/60 rounded-full mx-auto mb-4 md:mb-5"></div>
        <p className="text-white/95 text-xs md:text-sm mb-8 md:mb-10 font-light">
          Reward your team & clients with the gift of elegance
        </p>
        
        <ClientOnly>
          <button className="bg-white text-pink-600 hover:bg-pink-50 px-10 md:px-12 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider shadow-lg">
            Getting Started
          </button>
        </ClientOnly>
      </div>
    </section>
  );
}
