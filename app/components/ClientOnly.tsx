"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
}
