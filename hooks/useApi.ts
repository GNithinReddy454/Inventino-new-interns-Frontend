"use client";

import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher, apiMethods } from "@/lib/api";

// ============================================================================
// GLOBAL SWR CONFIGURATION
// ============================================================================
/**
 * Global SWR configuration applied to all hooks via <SWRConfig> provider
 * in app/layout.tsx
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 2000,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
};

// Re-export fetcher, apiMethods, and mutate for global access
export { fetcher } from "@/lib/api";
export { apiMethods } from "@/lib/api";
export { mutate as swrMutate } from "swr";

// ============================================================================
// BASE GLOBAL HOOKS - ONLY GENERIC UTILITIES
// ============================================================================

/**
 * useFetch - Generic GET hook with SWR caching
 *
 * @template T - Response data type
 * @param key - Endpoint URL or null (null = skip fetching)
 * @param config - Optional SWR config override
 *
 * @example
 * const { data, error, isLoading } = useFetch('/api/products');
 *
 * @note All GET operations go through this hook for automatic caching
 */
export const useFetch = <T = any>(
  key: string | null,
  config?: SWRConfiguration,
) => {
  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
  } = useSWR<T>(key, fetcher, Object.assign({}, swrConfig, config));
  return { data, error, isLoading, mutate: mutateData };
};

/**
 * useInfiniteFetch - Infinite scroll/paginated GET hook
 *
 * @template T - Page response data type
 * @param key - Endpoint URL with pagination params
 * @param config - Optional SWR config override
 *
 * @example
 * const { items, size, setSize } = useInfiniteFetch('/api/products?page=');
 *
 * @note For paginated lists that load more as user scrolls
 */
export const useInfiniteFetch = <T = any>(
  key: string,
  config?: SWRConfiguration,
) => {
  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
    size,
    setSize,
  } = useSWRInfinite<T>(
    (index: number, previousPageData: T | null) => {
      if (previousPageData && (previousPageData as any).items?.length === 0)
        return null;
      return `${key}?page=${index + 1}`;
    },
    fetcher,
    Object.assign({}, swrConfig, config),
  );

  const items = data ? data.map((page: any) => page.items).flat() : [];

  return { data, error, isLoading, mutate: mutateData, size, setSize, items };
};

/**
 * useMutate - Global API mutation wrapper
 *
 * Use this for all non-GET operations (POST, PUT, PATCH, DELETE)
 * Always call swrMutate(key) after mutations to refresh cache
 *
 * @example
 * await useMutate.post('/api/products', { name: 'New Product' });
 * swrMutate('/api/products'); // Refresh
 *
 * @note Business logic should be IN SERVICES, not in components
 * Components just call services which use these methods internally
 */
export const useMutate = {
  post: async <T = any>(url: string, data: any): Promise<T> => {
    return apiMethods.post<T>(url, data);
  },

  put: async <T = any>(url: string, data: any): Promise<T> => {
    return apiMethods.put<T>(url, data);
  },

  patch: async <T = any>(url: string, data: any): Promise<T> => {
    return apiMethods.patch<T>(url, data);
  },

  delete: async <T = any>(url: string): Promise<T> => {
    return apiMethods.delete<T>(url);
  },
};
