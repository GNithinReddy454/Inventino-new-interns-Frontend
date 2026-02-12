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
    <footer className="bg-pink-100 text-gray-700 py-10 w-full">
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
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            Crafting memories, one piece at a time. Every handmade treasure tells a unique story of passion and dedication.
          </p>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="flex-1 flex justify-between md:justify-around gap-6 w-full">
          {/** Shop Section **/}
          <div>
            <h3 className="text-base font-semibold mb-2 text-pink-600">Shop</h3>
            <ul className="space-y-1 text-sm md:text-base">
              {["Rings","Necklaces","Bracelets","Earrings"].map(item => (
                <li key={item}>
                  <Link 
                    href="/AllProducts" 
                    className="relative text-gray-700 hover:text-pink-600 transition-colors
                      after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-0.5 after:bg-pink-600 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/** About Section **/}
          <div>
            <h3 className="text-base font-semibold mb-2 text-pink-600">About</h3>
            <ul className="space-y-1 text-sm md:text-base">
              {["Our Story","Craftsmanship","Blog","Careers"].map(item => (
                <li key={item}>
                  <Link 
                    href={
                      item === "Craftsmanship" ? "/craftsmanship" :
                      (item === "Our Story" || item === "Blog") 
                        ? "/stories" 
                        : "/about"
                    } 
                    className="relative text-gray-700 hover:text-pink-600 transition-colors
                      after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-0.5 after:bg-pink-600 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/** Support Section **/}
          <div>
            <h3 className="text-base font-semibold mb-2 text-pink-600">Support</h3>
            <ul className="space-y-1 text-sm md:text-base">
              {["Contact Us","FAQs","Shipping","Returns"].map(item => (
                <li key={item}>
                  <Link 
                    href={
                      item === "Contact Us" ? "/contact" :
                      item === "FAQs" ? "/faq" :
                      item === "Shipping" ? "/shipping" :
                      "/returns"
                    } 
                    className="relative text-gray-700 hover:text-pink-600 transition-colors
                      after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-0.5 after:bg-pink-600 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
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
          <h3 className="text-base font-semibold mb-2 text-pink-600">Stay in Touch</h3>
          
          {isSubscribed ? (
            <div className="bg-white/50 p-4 rounded-lg border border-pink-200 animate-in fade-in duration-500">
              <p className="text-pink-600 font-medium text-sm">
                ✨ Thank you for joining our newsletter!
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-sm mb-2">
                Get the latest arrivals and special offers.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors flex items-center justify-center"
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