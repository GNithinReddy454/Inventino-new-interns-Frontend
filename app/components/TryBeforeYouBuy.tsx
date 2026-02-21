'use client';

import ClientOnly from './ClientOnly';

const features = [
  {
    title: "Virtual Try-On",
    description: "Use your camera to see how it looks on you in real-time.",
    icon: "🪞",
    cta: "Comming Soon",
  },
  {
    title: "Book Try at Home",
    description: "Schedule a doorstep trial of your favorite jewellery.",
    icon: "🏠",
    cta: "Comming Soon",
  },
  {
    title: "Talk to an Expert",
    description: "Need guidance? Speak to our jewellery consultant.",
    icon: "💬",
    cta: "Comming Soon",
  },
  {
    title: "Live Styling Help",
    description: "Talk to a jewellery stylist via video call.",
    icon: "✨",
    cta: "Comming Soon",
  },
];

export default function TryBeforeYouBuy() {
  return (
    <section className="w-full bg-white px-6 md:px-16 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
            Try Before You Buy – Virtually!
          </h2>
          <p className="text-sm text-gray-500">Experience jewellery without leaving your home</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center bg-pink-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100 hover:border-pink-300"
            >
              {/* Icon circle */}
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-pink-50 transition-colors">
                {feature.icon}
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{feature.description}</p>

              <ClientOnly>
                <button className="text-pink-500 font-semibold text-xs hover:text-pink-700 transition-colors">
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
