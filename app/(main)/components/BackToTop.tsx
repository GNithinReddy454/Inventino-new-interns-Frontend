"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Button appears only after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center bg-white rounded-full border border-pink-100 shadow-sm hover:bg-pink-50 transition-all duration-300 active:scale-90"
      aria-label="Back to top"
    >
      {/* Light pink arrow to match your luxury aesthetic */}
      <ArrowUp size={20} className="text-[#f1c2bd]" strokeWidth={3} />
    </button>
  );
}