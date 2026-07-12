"use client";

import ClientOnly from "./ClientOnly";
import { Camera, Home, MessageCircle, Sparkles } from "lucide-react";

const features = [
  {
    title: "Virtual Try-On",
    description: "Use your camera to see how it looks on you in real-time.",
    icon: <Camera className="w-7 h-7 text-pink-500" strokeWidth={1.5} />,
    cta: "Coming Soon",
  },
  {
    title: "Book Try at Home",
    description: "Schedule a doorstep trial of your favorite jewellery.",
    icon: <Home className="w-7 h-7 text-pink-500" strokeWidth={1.5} />,
    cta: "Coming Soon",
  },
  {
    title: "Talk to an Expert",
    description: "Need guidance? Speak to our jewellery consultant.",
    icon: <MessageCircle className="w-7 h-7 text-pink-500" strokeWidth={1.5} />,
    cta: "Coming Soon",
  },
  {
    title: "Live Styling Help",
    description: "Talk to a jewellery stylist via video call.",
    icon: <Sparkles className="w-7 h-7 text-pink-500" strokeWidth={1.5} />,
    cta: "Coming Soon",
  },
];

export default function TryBeforeYouBuy() {
  return (
    <section
      id="try-before-you-buy-section"
      data-cms-features-section="true"
      className="w-full bg-white px-6 md:px-16 py-10 md:py-16"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
            Try Before You Buy – Virtually!
          </h2>
          <p className="text-sm text-gray-500">
            Experience jewellery without leaving your home
          </p>
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

              <h3 className="text-sm font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                {feature.description}
              </p>

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
