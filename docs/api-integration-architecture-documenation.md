# API Integration Architecture - Developer Guide

**Project:** Inventino Frontend (Next.js + TypeScript)  
**Pattern:** Simple & Scalable - Services + SWR + Axios  
**Last Updated:** Current Session

---

## Table of Contents

1. [Quick Start (30 seconds)](#quick-start-30-seconds)
2. [Architecture Overview](#architecture-overview)
3. [Layer Responsibilities](#layer-responsibilities)
4. [Folder Structure](#folder-structure)
5. [Service Layer - How It Works](#service-layer---how-it-works)
6. [All 5 HTTP Methods](#all-5-http-methods)
7. [Complete Examples](#complete-examples)
8. [Common Patterns](#common-patterns)
9. [Error Handling](#error-handling)
10. [Do's and Don'ts](#dos-and-donts)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start (30 seconds)

**For experienced developers - add a new domain in 4 steps:**

1. **Type Definition** - `types/cart.types.ts`:

```ts
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}
```

2. **Service** - `services/cart.service.ts` with all 5 methods:

```ts
import apiClient from "@/lib/api";
export const cartService = {
  async getAll() {
    return (await apiClient.get("/cart")).data;
  },
  async create(data) {
    return (await apiClient.post("/cart", data)).data;
  },
  async update(id, data) {
    return (await apiClient.put(`/cart/${id}`, data)).data;
  },
  async patch(id, data) {
    return (await apiClient.patch(`/cart/${id}`, data)).data;
  },
  async delete(id) {
    return (await apiClient.delete(`/cart/${id}`)).data;
  },
};
```

3. **Hook** - In `hooks/useApi.ts`, add:

```ts
export const useCart = () => useFetch("/api/cart");
export const useCartItem = (id: string) => useFetch(`/api/cart/${id}`);
```

4. **Component Usage**:

```tsx
const { data: cart, isLoading } = useCart();
await useMutate.post("/api/cart", { productId: "123", qty: 1 });
swrMutate("/api/cart"); // refresh cache
```

---

## Architecture Overview

### Three-Layer Data Flow

All requests flow through a unified pipeline:

```
UI Component
    ↓ (imports & calls)
Service Methods (cartService.addToCart, productService.getAll, etc.)
    ↓ (uses)
HTTP Layer (Axios instance with interceptors for auth & errors)
    ↓ (makes request with auth token)
Backend API
```

### Global Configuration via SWRConfig

The app is wrapped with `<SWRConfig>` in `app/layout.tsx`:

```tsx
import { swrConfig, fetcher } from "@/hooks/useApi";
import { SWRConfig } from "swr";

export default function RootLayout() {
  return (
    <SWRConfig value={{ ...swrConfig, fetcher }}>
      {/* All components inherit global SWR config */}
      {children}
    </SWRConfig>
  );
}
```

**Global SWR Settings:**

- `dedupingInterval: 2000` - Prevent duplicate requests within 2 seconds
- `revalidateOnFocus: true` - Refresh when window regains focus
- `errorRetryCount: 2` - Retry failed requests up to 2 times
- `errorRetryInterval: 5000` - Wait 5 seconds between retries

---

## Layer Responsibilities

### Layer 1: API Client (`lib/api.ts`)

**Purpose:** Centralized Axios configuration and HTTP methods

**Exports:**

- `apiClient` - Configured Axios instance
- `fetcher(url)` - GET wrapper for SWR (returns response.data)
- `apiMethods { get, post, put, patch, delete }` - All 5 HTTP verbs

**Features:**

- Request interceptor: Attaches Bearer token from localStorage
- Response interceptor: Handles 401 by removing token
- Base URL from environment variables

**Rule:** No business logic here, only HTTP configuration.

### Layer 2: Service Layer (`services/`)

**Purpose:** Domain-specific API operations and business logic

**Pattern:**

```ts
export const productService = {
  async getAll() {
    /* calls apiClient */
  },
  async getById(id) {
    /* calls apiClient */
  },
  async create(data) {
    /* calls apiClient */
  },
  async update(id, data) {
    /* calls apiClient */
  },
  async patch(id, data) {
    /* calls apiClient */
  },
  async delete(id) {
    /* calls apiClient */
  },
};
```

**Requirements for Every Service:**

- All 5 methods (get, getById, create, update, patch, delete)
- Always return `response.data` (not full Axios response)
- Use Axios instance or apiMethods from lib/api
- No state management - just data operations

**Services Created:**

- `product.service.ts` - 14+ product operations
- `cart.service.ts` - 6 cart operations
- `auth.service.ts` - 9 auth operations
- `order.service.ts` - 9 order operations
- `address.service.ts` - 8 address operations

### Layer 3: Hook Layer (`hooks/useApi.ts`)

**Purpose:** Global data-fetching utilities and cache management

**Base Hooks (ONLY exports from useApi.ts):**

- `useFetch<T>(key, config?)` - GET with SWR caching
- `useInfiniteFetch<T>(key, config?)` - Paginated GET
- `useMutate { post, put, patch, delete }` - Mutations (POST/PUT/PATCH/DELETE)
- `swrMutate(key)` - Invalidate cache
- `swrConfig` - Global SWR settings
- `fetcher` - Re-exported from lib/api
- `apiMethods` - Re-exported from lib/api

**No Domain-Specific Hooks** - Instead, components call services directly.

### Layer 4: UI Layer (`app/`)

**Purpose:** Render UI with data from services

**Rules:**

- Import services and use them directly
- For cached reads: Use `useFetch` to wrap service GET calls
- For mutations: Call service method, then `swrMutate()` to refresh
- No direct Axios calls
- Handle loading and error states

---

## Folder Structure

```
project/
├── app/
│   ├── layout.tsx                    # ← SWRConfig provider here
│   ├── (main)/
│   ├── (admin)/
│   └── (auth)/
│
├── lib/
│   ├── api.ts                        # ← Axios + interceptors + 5 HTTP methods
│   ├── types.ts
│   └── utils.ts
│
├── hooks/
│   └── useApi.ts                     # ← Base hooks ONLY (useFetch, useMutate, etc.)
│
├── services/
│   ├── product.service.ts            # ← All business logic
│   ├── cart.service.ts
│   ├── auth.service.ts
│   ├── order.service.ts
│   └── address.service.ts
│
├── types/
│   ├── product.types.ts
│   ├── cart.types.ts
│   └── order.types.ts
│
└── docs/
    └── api-integration-architecture-documenation.md
```

---

## Service Layer - How It Works

Each service encapsulates API calls for one domain.

**Example: productService**

```ts
import apiClient from "@/lib/api";

export const productService = {
  async getAll() {
    const response = await apiClient.get("/products/");
    return response.data; // Always return data only
  },

  async getById(id: number) {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  },

  async create(data: Partial<Product>) {
    const response = await apiClient.post("/products/", data);
    return response.data;
  },

  async update(id: number, data: Partial<Product>) {
    const response = await apiClient.put(`/products/${id}/`, data);
    return response.data;
  },

  async patch(id: number, data: Partial<Product>) {
    const response = await apiClient.patch(`/products/${id}/`, data);
    return response.data;
  },

  async delete(id: number) {
    await apiClient.delete(`/products/${id}/`);
    return { success: true };
  },
};
```

**Component Usage:**

```tsx
// Direct service call
const product = await productService.getById(1);

// For caching reads, wrap with useFetch
const { data } = useFetch("/api/products");

// For mutations
await productService.create({ name: "New" });
swrMutate("/api/products"); // Refresh cache
```

---

## All 5 HTTP Methods

| Method     | Purpose        | Caching   | Usage                                   | After         |
| ---------- | -------------- | --------- | --------------------------------------- | ------------- |
| **GET**    | Read data      | ✅ SWR    | `useFetch("/api/products")`             | -             |
| **POST**   | Create         | ❌ Direct | `await productService.create(data)`     | `swrMutate()` |
| **PUT**    | Replace full   | ❌ Direct | `await productService.update(id, data)` | `swrMutate()` |
| **PATCH**  | Partial update | ❌ Direct | `await productService.patch(id, data)`  | `swrMutate()` |
| **DELETE** | Remove         | ❌ Direct | `await productService.delete(id)`       | `swrMutate()` |

### GET - Read with Caching

**Hook wrapper for caching:**

```tsx
const { data: products, isLoading, error } = useFetch("/api/products");
const { data: product } = useFetch("/api/products/1");
```

**SWR automatically:**

- Deduplicates requests within 2 seconds
- Caches results across components
- Refetches on window focus
- Retries failed requests

### POST - Create Resource

```tsx
const handleCreate = async (data) => {
  const created = await productService.create(data);
  swrMutate("/api/products"); // Refresh list
};
```

### PUT - Replace Entire Resource

```tsx
const handleUpdate = async (id, data) => {
  await productService.update(id, data);
  swrMutate("/api/products");
  swrMutate(`/api/products/${id}`); // Refresh item & list
};
```

### PATCH - Partial Update

```tsx
const handleStatusChange = async (id, status) => {
  await productService.patch(id, { status });
  swrMutate(`/api/products/${id}`);
};
```

### DELETE - Remove Resource

```tsx
const handleDelete = async (id) => {
  await productService.delete(id);
  swrMutate("/api/products"); // Refresh list
};
```

---

## Complete Examples

### Example 1: Product List Page

**Setup types:**

```ts
// types/product.types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  status: "active" | "inactive";
}
```

**Component:**

```tsx
"use client";
import { useFetch } from "@/hooks/useApi";
import { productService } from "@/services/product.service";
import { useMutate, swrMutate } from "@/hooks/useApi";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useFetch("/api/products");

  const handleCreate = async () => {
    const newProduct = await productService.create({
      name: "New Product",
      price: 99.99,
      status: "active",
    });
    swrMutate("/api/products");
  };

  const handleDelete = async (id: number) => {
    await productService.delete(id);
    swrMutate("/api/products");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>
      <button onClick={handleCreate}>Add Product</button>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 2: Add to Cart

```tsx
"use client";
import { cartService } from "@/services/cart.service";
import { swrMutate } from "@/hooks/useApi";

export default function ProductCard({ productId }) {
  const handleAddToCart = async () => {
    await cartService.addToCart(productId, 1);
    swrMutate("/api/cart"); // Refresh cart
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Example 3: Login Flow

```tsx
"use client";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.loginUser(email, password);
      localStorage.setItem("auth_token", response.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;
        handleLogin(email, password);
      }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="email" name="email" placeholder="Email" />
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Common Patterns

### Pattern 1: Fetch and Display

```tsx
const { data, isLoading, error } = useFetch("/api/products");
if (error) return <div>Error loading</div>;
if (isLoading) return <div>Loading...</div>;
return (
  <div>
    {data?.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
);
```

### Pattern 2: Fetch with Search/Filter

```tsx
const [search, setSearch] = useState("");
const { data } = useFetch(
  search ? `/api/products?search=${search}` : "/api/products",
);
```

### Pattern 3: Create and Refresh Cache

```tsx
const handleCreate = async (formData: any) => {
  try {
    await productService.create(formData);
    swrMutate("/api/products"); // Refresh list
    alert("Created successfully");
  } catch (error) {
    alert("Failed to create");
  }
};
```

### Pattern 4: Optimistic Update

```tsx
const handleDelete = async (id: number) => {
  // Optimistically update cache
  mutate((old: any) => old?.filter((item) => item.id !== id), false);
  try {
    await productService.delete(id);
    swrMutate("/api/products"); // Confirm from server
  } catch {
    swrMutate("/api/products"); // Revert on error
  }
};
```

---

## Error Handling

### Global Errors (Handled in lib/api.ts)

**401 Unauthorized:**

- Token is removed from localStorage
- Optionally redirect to login

**400 Bad Request:**

- Validation errors returned

**500 Server Error:**

- Generic error message logged

### Component-Level Error Handling

**For GET requests:**

```tsx
const { data, error } = useFetch("/api/products");
if (error) return <div>Error loading products</div>;
```

**For Mutations:**

```tsx
try {
  await productService.create(data);
  swrMutate("/api/products");
} catch (error: any) {
  const message = error.response?.data?.message || "An error occurred";
  alert(message);
}
```

---

## Do's and Don'ts

### ✅ DO

| Action                                        | Why                                 |
| --------------------------------------------- | ----------------------------------- |
| Use `useFetch()` for reads                    | Automatic caching and deduplication |
| Call services for mutations                   | Centralized business logic          |
| Invalidate cache after mutations              | Keep data fresh                     |
| Handle loading/error states                   | Better UX                           |
| Define types for responses                    | Type safety                         |
| Keep services focused on one domain           | Maintainability                     |
| Use global SWRConfig                          | Consistent behavior                 |
| Call `swrMutate()` after create/update/delete | Refresh cache                       |

### ❌ DON'T

| Action                                   | Why                         |
| ---------------------------------------- | --------------------------- |
| Call Axios directly in components        | Lose caching benefits       |
| Hardcode URLs in components              | Makes refactoring harder    |
| Skip cache invalidation                  | Data becomes stale          |
| Create multiple Axios instances          | Lose centralized auth       |
| Mix API and UI logic                     | Harder to test and maintain |
| Return full Axios response from services | Inconsistent API            |
| Create domain-specific hooks             | Use services instead        |
| Forget to handle errors                  | Poor user experience        |

---

## Troubleshooting

### Data not updating after mutation

**Problem:** Created/updated data but list didn't refresh

**Solution:** Call `swrMutate("/api/endpoint")` after mutation

```tsx
await productService.create(data);
swrMutate("/api/products"); // This tells SWR to refetch
```

### Getting 401 errors

**Problem:** Unauthorized responses

**Solution:** Check localStorage for auth token. Token is attached automatically by interceptor in lib/api.ts

```ts
// Check token in browser DevTools
localStorage.getItem("auth_token");
```

### Hook not updating

**Problem:** useFetch hook not showing new data

**Solution:** Verify the key path matches exactly

```tsx
// ✅ Correct
const { data } = useFetch("/api/products");

// ❌ Wrong - key doesn't match service endpoint
const { data } = useFetch("/api/products/list");
```

### Type errors

**Problem:** TypeScript errors in service usage

**Solution:** Import and use correct types from types/ folder

```ts
import { Product } from "@/types/product.types";

const product: Product = await productService.getById(1);
```

### Lost data after refresh

**Problem:** Optimistic update reverted

**Solution:** Call `swrMutate()` to refresh from server

```tsx
mutate((old) => [...old, newItem], false); // Optimistic
try {
  await createService();
  swrMutate("/api/items"); // Confirm from server
} catch {
  swrMutate("/api/items"); // Revert on error
}
```

---

## Environment Configuration

Create `.env.local` with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

**Rules:**

- Never hardcode URLs
- Use environment variables
- Different envs use different URLs

---

## Key Files Reference

| File                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `lib/api.ts`            | Axios config, interceptors, fetcher, apiMethods  |
| `hooks/useApi.ts`       | useFetch, useInfiniteFetch, useMutate, swrMutate |
| `app/layout.tsx`        | SWRConfig provider                               |
| `services/*.service.ts` | All 5 HTTP methods per domain                    |
| `types/*.types.ts`      | TypeScript interfaces                            |

---

## Quick Reference

**Import patterns:**

```tsx
// Get cached data
import { useFetch } from "@/hooks/useApi";
const { data } = useFetch("/api/products");

// Create/update/delete
import { cartService } from "@/services/cart.service";
await cartService.addToCart(id, qty);

// Refresh cache
import { swrMutate } from "@/hooks/useApi";
swrMutate("/api/cart");

// Get all exports
import {
  useFetch,
  useMutate,
  swrMutate,
  fetcher,
  apiMethods,
  swrConfig,
} from "@/hooks/useApi";
```

---

**Last Updated:** Current Session  
**Maintained By:** Frontend Team  
**Questions?** Check Troubleshooting section above
