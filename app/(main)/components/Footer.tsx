"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { newsletterService } from "@/services/newsletter.service";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await newsletterService.subscribe(email);
      setIsSubscribed(true);
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#1f2937] text-gray-300 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - Logo & Description */}
          <div className="space-y-5">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Inventino"
                width={120}
                height={40}
                className="object-contain mb-2"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting memories, one piece at a time. Every handmade treasure
              tells a unique story of passion and dedication.
            </p>
          </div>

          {/* Column 2 - About */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white">About</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/stories" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/craftsmanship" className="hover:text-white transition-colors">
                  Craftsmanship
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white">Stay in Touch</h3>

            {isSubscribed ? (
              <div className="bg-white/10 p-4 rounded-lg border border-pink-400/40">
                <p className="text-pink-400 font-medium text-sm">
                  ✨ Thank you for joining our newsletter!
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm">
                  Get the latest arrivals and special offers.
                </p>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/40 p-3 rounded-lg text-sm text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-3 w-full max-w-sm">
                  <div className="flex items-stretch">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-5 py-3 bg-[#111827] border border-gray-600 rounded-l-full text-gray-200 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-12 flex items-center justify-center bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed rounded-r-full transition-colors duration-300"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-16 pt-8 text-center text-gray-500 text-sm">
          © 2026 Inventino. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;