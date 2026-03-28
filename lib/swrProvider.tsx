"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/api";

const swrConfig = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 2000,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ ...swrConfig, fetcher }}>
      {children}
    </SWRConfig>
  );
}
