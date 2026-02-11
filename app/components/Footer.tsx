'use client';

import ClientOnly from './ClientOnly';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-gray-900 via-pink-900 to-gray-950 text-gray-200 px-12 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-5 gap-10 mb-16">
          {/* Brand Section */}
          <div className="col-span-1">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text text-transparent mb-4">
              Inventino
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Crafting timeless elegance with passion and dedication. Every piece tells a story of artistry and love.
            </p>
            <div className="flex gap-4 text-lg">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">f</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">𝕏</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">📷</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">▶</a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-400 to-pink-600 rounded"></span>
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/shop/hair-accessories" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Hair Accessories</a></li>
              <li><a href="/shop/bracelets" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Bracelets</a></li>
              <li><a href="/shop/bag-charms" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Bag Charms</a></li>
              <li><a href="/shop/kids-jewelry" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Kids Jewelry</a></li>
              <li><a href="/shop/shoe-charms" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Shoe Charms</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-400 to-pink-600 rounded"></span>
              About
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Our Story</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Craftsmanship</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Sustainability</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-400 to-pink-600 rounded"></span>
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">FAQs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Shipping</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Returns</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-400 to-pink-600 rounded"></span>
              Newsletter
            </h4>
            <p className="text-gray-300 text-sm mb-5">Subscribe for exclusive offers and new collection launches</p>
            <ClientOnly>
              <div className="flex gap-1">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300 placeholder-gray-500"
                />
                <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-5 py-3 rounded-lg transition-all duration-300 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30">
                  →
                </button>
              </div>
            </ClientOnly>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm">
            © 2026 Inventino. All rights reserved. | Handcrafted with ❤️
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
