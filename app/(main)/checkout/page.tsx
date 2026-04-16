"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutFlow from "@/app/components/CheckoutFlow";
import { hasUserSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const allowCheckout = hasUserSession();

  useEffect(() => {
    if (!allowCheckout) {
      const returnUrl = encodeURIComponent("/checkout");
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [allowCheckout, router]);

  if (!allowCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D94F7A] rounded-full animate-spin" />
      </div>
    );
  }

  return <CheckoutFlow />;
}
