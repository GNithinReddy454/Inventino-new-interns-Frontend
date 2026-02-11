"use client";
import { useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";

const images = ["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    images.forEach((img) => {
      const imgElement = new Image();
      imgElement.src = img;
      imgElement.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // Trigger text animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <section className="w-full">
      {/* Carousel Section */}
      <div className="relative w-full h-screen bg-pink-100 overflow-hidden">
        {/* Loading Skeleton */}
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-pink-100 animate-pulse z-10"></div>
        )}

        {/* Carousel Images */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Carousel slide ${index + 1} - Timeless Elegance Bracelets`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Gradient overlay behind text for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/30"></div>

        {/* Text Overlay with fade-in animation */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center text-center z-20 px-4 md:px-8 transition-all duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 md:mb-4 drop-shadow-2xl tracking-tight leading-tight">
            Timeless Elegance
          </h1>
          <div className="h-1 md:h-1.5 w-20 md:w-28 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300 rounded-full mx-auto mb-4 md:mb-6 shadow-lg"></div>
          <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-pink-50 font-light drop-shadow-lg mb-8 md:mb-12 tracking-wide">
            Made with love just for you
          </p>
          <ClientOnly>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 md:px-10 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider">
                Shop Now
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 md:px-10 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm border-2 border-white/50 hover:border-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm uppercase tracking-wider">
                Learn Our Story
              </button>
            </div>
          </ClientOnly>
        </div>

        {/* Left Arrow */}
        <ClientOnly>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition-all duration-200 hover:shadow-lg hover:scale-110 active:scale-95"
            aria-label="Previous carousel slide"
          >
            ❮
          </button>
        </ClientOnly>

        {/* Right Arrow */}
        <ClientOnly>
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition-all duration-200 hover:shadow-lg hover:scale-110 active:scale-95"
            aria-label="Next carousel slide"
          >
            ❯
          </button>
        </ClientOnly>

        {/* Dots Indicator */}
        <ClientOnly>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? "bg-pink-500 scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to carousel slide ${index + 1}`}
              />
            ))}
          </div>
        </ClientOnly>
      </div>
    </section>
  );
}
