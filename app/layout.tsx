import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/lib/storeContext"; // Main logic file
import { AuthProvider } from "@/app/(main)/components/authContext";
import { CartProvider } from "@/lib/cartContext"; // FIXED: Added this to stop the runtime crash
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* We wrap everything in CartProvider first so the useCart hook works */}
        <CartProvider>
          <StoreProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </StoreProvider>
        </CartProvider>
        
      </body>
    </html>
  );
}