"use client";
import Link from "next/link";
import ClientOnly from "./ClientOnly";

export default function CorporateGifting() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background:
          "linear-gradient(135deg, #f472b6 0%, #ec4899 40%, #db2777 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Corporate Gifting
        </h2>
        <p className="text-white/90 text-sm md:text-base mb-10">
          Reward your team &amp; clients with the gift of elegance.
        </p>

        <ClientOnly>
          <Link
            href="/contact"
            className="inline-block bg-white text-pink-600 hover:bg-pink-50 px-10 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Enquire Now
          </Link>
        </ClientOnly>
      </div>
    </section>
  );
}
