"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "./ClientOnly";

const slides = [
  {
    image: "/images/hero1.jpg",
    headline: ["Crafted with", "Love,", "Made for You"],
    pinkWord: "Love,",
    subtitle:
      "Discover unique handmade treasures that tell a story. Each piece is lovingly created to bring joy into your heart and into every detail.",
  },
  {
    image: "/images/hero2.jpg",
    headline: ["Every Piece", "Tells a", "Story"],
    pinkWord: "Tells a",
    subtitle:
      "Handcrafted with passion and care, our jewellery celebrates the artisan spirit and the beauty of imperfection.",
  },
  {
    image: "/images/hero3.jpg",
    headline: ["Timeless", "Elegance,", "Just for You"],
    pinkWord: "Elegance,",
    subtitle:
      "From delicate rings to bold statement pieces — find your perfect match in our curated handmade collection.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === slides.length) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === slides.length) setImagesLoaded(true);
      };
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="w-full">
      <div className="relative w-full h-[75vh] min-h-[500px] overflow-hidden bg-gray-900">
        {/* Loading skeleton */}
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-pink-100 animate-pulse z-10" />
        )}

        {/* Carousel Images */}
        {slides.map((s, index) => (
          <img
            key={index}
            src={s.image}
            alt={`Hero slide ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        {/* Text — left aligned */}
        <div
          className={`absolute inset-0 flex flex-col justify-center z-20 px-8 md:px-16 lg:px-24 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 drop-shadow-2xl tracking-tight leading-tight max-w-xl">
            {slide.headline.map((word, i) =>
              word === slide.pinkWord ? (
                <span key={i} className="text-pink-400">
                  {word}{" "}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-pink-50/90 font-light drop-shadow-lg mb-8 tracking-wide max-w-md leading-relaxed">
            {slide.subtitle}
          </p>

          <ClientOnly>
            <div className="flex flex-row gap-3 md:gap-4">
              <Link
                href="/all-products"
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Shop Collection
              </Link>
              <Link
                href="/stories"
                className="bg-transparent hover:bg-white/10 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-xs md:text-sm border border-white/70 hover:border-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Learn Our Story
              </Link>
            </div>
          </ClientOnly>
        </div>

        {/* Dot Indicators */}
        <ClientOnly>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`rounded-full transition-all duration-300 ${index === current
                    ? "bg-pink-500 w-6 h-2.5"
                    : "bg-white/50 hover:bg-white/70 w-2.5 h-2.5"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </ClientOnly>
      </div>
    </section>
  );
}
