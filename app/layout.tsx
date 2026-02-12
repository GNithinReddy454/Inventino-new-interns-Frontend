import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css"; // Only one import needed

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {

  title: "Inventino Jewels",
  description: "Premium Jewellery Store",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <CartProvider>
          {/* Navbar at the top */}
          <Navbar />

          {/* Main content stretches to push footer down */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer at the bottom */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}