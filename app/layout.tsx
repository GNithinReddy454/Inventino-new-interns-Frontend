import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/lib/storeContext";
import { AuthProvider } from "@/app/(main)/components/authContext";
import { CartProvider } from "@/lib/cartContext";
import { ReduxProvider } from "@/redux/provider";
import { SWRConfig } from "swr";
import { swrConfig, fetcher } from "@/hooks/useApi";
import { ToastProvider } from "@/app/components/GlobalToast";
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
    // overflow-x-clip instead of overflow-x-hidden:
    // - Both hide horizontal overflow visually
    // - BUT overflow-x-hidden creates a scroll container which BLOCKS touch scroll on iOS
    // - overflow-x-clip does NOT create a scroll container → touch scroll works normally
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ReduxProvider>
          <ToastProvider>
            <CartProvider>
              <StoreProvider>
                <AuthProvider>
                  <SWRConfig value={{ ...swrConfig, fetcher }}>
                    {children}
                  </SWRConfig>
                </AuthProvider>
              </StoreProvider>
            </CartProvider>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}