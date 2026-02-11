'use client';

import ClientOnly from './ClientOnly';

export default function TryBeforeYouBuy() {
  const features = [
    {
      title: "Virtual Try-On",
      description: "Use our cutting-edge AR technology to see how jewelry looks on you",
      icon: "🎯",
      cta: "Coming Soon",
    },
    {
      title: "Live Styling Help",
      description: "Talk to a jewelry stylist in real-time for personalized advice",
      icon: "💬",
      cta: "Coming Soon",
    },
    {
      title: "Book Try at Home",
      description: "Schedule a beautiful pop-up visit to your home or office",
      icon: "🏠",
      cta: "Coming Soon",
    },
    {
      title: "Talk to an Expert",
      description: "Need guidance? Speak directly with our jewelry specialists",
      icon: "👥",
      cta: "Coming Soon",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-pink-50 to-white px-4 md:px-6 lg:px-12 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
            Try Before You Buy – Virtually!
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full mx-auto mb-3"></div>
          <p className="text-center text-gray-600 text-xs md:text-sm">
            Experience jewelry without leaving your home
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group text-center bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 border border-pink-100/30 hover:border-pink-300">
              <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{feature.icon}</div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm mb-5 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
              <ClientOnly>
                <button className="text-pink-600 font-bold text-xs md:text-sm hover:text-pink-700 transition-colors duration-300 uppercase tracking-wide hover:underline underline-offset-2">
                  {feature.cta}
                </button>
              </ClientOnly>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
