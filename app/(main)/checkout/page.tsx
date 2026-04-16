"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutFlow from "@/app/components/CheckoutFlow";
import { hasUserSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowCheckout, setAllowCheckout] = useState(false);

  useEffect(() => {
    const isUserSession = hasUserSession();

    if (!isUserSession) {
      const returnUrl = encodeURIComponent("/checkout");
      router.replace(`/login?redirect=${returnUrl}`);
      setReady(true);
      return;
    }

    setAllowCheckout(true);
    setReady(true);
  }, [router]);

  if (!ready || !allowCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D94F7A] rounded-full animate-spin" />
      </div>
    );
  }

  return <CheckoutFlow />;
}
