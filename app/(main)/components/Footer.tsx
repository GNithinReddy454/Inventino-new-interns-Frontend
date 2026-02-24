"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1f2937] text-gray-300 py-10 w-full">
      <div className="w-full flex flex-col md:flex-row justify-between items-start px-6 md:px-12 gap-8">

        {/* LEFT: Logo + Description */}
        <div className="min-w-45 md:max-w-55">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Inventino"
              width={120}
              height={40}
              className="object-contain mb-2"
            />
          </Link>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Crafting memories, one piece at a time. Every handmade treasure tells a unique story of passion and dedication.
          </p>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="flex-1 flex justify-between md:justify-around gap-6 w-full">

          {/** About Section **/}
          <div>
            <h3 className="text-base font-semibold mb-2 text-white">About</h3>
            <ul className="space-y-1 text-sm md:text-base">
              {["Our Story", "Craftsmanship", "Blog", "Careers"].map(item => (
                <li key={item}>
                  <Link
                    href={
                      item === "Craftsmanship" ? "/craftsmanship" :
                        (item === "Our Story" || item === "Blog")
                          ? "/stories"
                          : "/about"
                    }
                    className="relative text-gray-400 hover:text-white transition-colors
                      after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-0.5 after:bg-white after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/** Support Section **/}
          <div>
            <h3 className="text-base font-semibold mb-2 text-white">Support</h3>
            <ul className="space-y-1 text-sm md:text-base">
              {["Contact Us", "FAQs", "Shipping", "Returns"].map(item => (
                <li key={item}>
                  <Link
                    href={
                      item === "Contact Us" ? "/contact" :
                        item === "FAQs" ? "/faq" :
                          item === "Shipping" ? "/shipping" :
                            "/returns"
                    }
                    className="relative text-gray-400 hover:text-white transition-colors
                      after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-0.5 after:bg-white after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Newsletter */}
        <div className="min-w-55">
          <h3 className="text-base font-semibold mb-2 text-white">Stay in Touch</h3>

          {isSubscribed ? (
            <div className="bg-white/50 p-4 rounded-lg border border-pink-200 animate-in fade-in duration-500">
              <p className="text-pink-600 font-medium text-sm">
                ✨ Thank you for joining our newsletter!
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-2">
                Get the latest arrivals and special offers.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-row items-stretch mt-2 group focus-within:ring-2 focus-within:ring-pink-400 rounded-xl bg-transparent sm:bg-[#1E293B] border border-pink-300 overflow-hidden w-full max-w-sm">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-200 placeholder-gray-400 min-h-[48px]"
                />
                <button
                  type="submit"
                  className="px-6 bg-pink-600 hover:bg-pink-700 text-white transition-colors flex items-center justify-center shrink-0 border-l border-pink-600"
                >
                  <ArrowRight size={20} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        © 2026 Inventino. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;