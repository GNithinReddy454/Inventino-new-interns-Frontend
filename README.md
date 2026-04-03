# Inventino Frontend

# Inventino Frontend

A modern e-commerce platform built with **Next.js 13+**, **TypeScript**, **SWR**, and **Axios**.

---

## 📌 Business Overview

**Inventino** is an e-commerce platform that enables users to:

- Browse and search products
- Manage shopping cart
- Place orders with multiple payment methods
- Track shipments and manage returns
- Handle user accounts and addresses
- Admin dashboard for product management

**Tech Stack:** Next.js (App Router) | TypeScript | SWR | Axios | Tailwind CSS

---

## 🏗️ Technical Architecture - API Layer

### Three-Layer Model

```
┌─────────────────────────────────────────────────┐
│          UI Layer (Components)                   │
│  - Display data                                 │
│  - Call services directly or use useFetch()    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Service Layer (Business Logic)              │
│  - productService, cartService, authService    │
│  - All API operations (GET, POST, PUT, etc.)   │
│  - Data validation and transformations         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│     HTTP Layer (Axios + Interceptors)            │
│  - Base URL configuration                       │
│  - Authentication token attachment             │
│  - Global error handling (401, 500, etc.)      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│          Backend API                             │
└─────────────────────────────────────────────────┘
```

### Folder Structure

```
lib/api.ts                    → Axios configuration + HTTP methods
services/
  ├── product.service.ts      → Product operations
  ├── cart.service.ts         → Cart operations
  ├── auth.service.ts         → Authentication
  ├── order.service.ts        → Orders
  └── address.service.ts      → Addresses
hooks/useApi.ts               → Base data-fetching hooks (SWR)
```

---

## 🚀 Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Service Layer Reference

All API operations are in `services/` folder. Components import services directly.

### Product Service

```tsx
import { productService } from "@/services/product.service";

await productService.getAll(); // Get all products
await productService.getById(id); // Single product
await productService.search("laptop"); // Search
await productService.getByCategory("electronics"); // Filter by category
await productService.create(data); // Create (ADMIN)
await productService.update(id, data); // Update (ADMIN)
await productService.delete(id); // Delete (ADMIN)
```

### Cart Service

```tsx
import { cartService } from "@/services/cart.service";

await cartService.getCart(); // Get items
await cartService.addToCart(productId, qty); // Add to cart
await cartService.updateCartQuantity(id, qty); // Update quantity
await cartService.removeFromCart(productId); // Remove item
await cartService.applyPromoCode(code); // Apply promo
```

### Auth Service

```tsx
import { authService } from "@/services/auth.service";

await authService.loginUser(credentials); // Login
await authService.registerUser(data); // Register
await authService.logoutUser(); // Logout
await authService.getCurrentUser(); // Get profile
await authService.resetPassword(email, token, pwd);
```

### Order Service

```tsx
import { orderService } from "@/services/order.service";

await orderService.placeOrder(address, payment); // Place order
await orderService.getOrders(); // Order history
await orderService.trackOrder(orderId); // Track order
await orderService.cancelOrder(orderId); // Cancel
await orderService.requestReturn(orderId, itemId);
```

### Address Service

```tsx
import { addressService } from "@/services/address.service";

await addressService.getAddresses(); // Get all
await addressService.addAddress(data); // Add new
await addressService.updateAddress(id, data); // Update
await addressService.deleteAddress(id); // Delete
```

---

## 💡 Common Usage Patterns

### Pattern 1: Fetch and Display Data

```tsx
"use client";
import { useFetch } from "@/hooks/useApi";

export default function ProductsPage() {
  const { data, isLoading, error } = useFetch("/api/products");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading</p>;

  return (
    <div>
      {data?.data?.items?.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Call Service and Mutate

```tsx
"use client";
import { cartService } from "@/services/cart.service";
import { swrMutate } from "@/hooks/useApi";

export default function AddToCart({ productId }) {
  const handleClick = async () => {
    await cartService.addToCart(productId, 1);
    swrMutate("/api/cart"); // Refresh cart cache
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### Pattern 3: Complex Operations

```tsx
"use client";
import { orderService } from "@/services/order.service";
import { useFetch } from "@/hooks/useApi";

export default function Checkout() {
  const { data: cart } = useFetch("/api/cart");

  const handlePlaceOrder = async (address, paymentMethod) => {
    // Service handles all business logic
    const result = await orderService.placeOrder(address, paymentMethod);
    if (result.status === "success") {
      alert("Order placed!");
    }
  };

  return (
    <button onClick={() => handlePlaceOrder(addr, payment)}>Checkout</button>
  );
}
```

---

## ✅ Guidelines

### DO

- ✅ Use services for all API operations
- ✅ Use `useFetch()` for cached reads
- ✅ Call `swrMutate(key)` after mutations
- ✅ Keep components focused on UI

### DON'T

- ❌ Call Axios directly in components
- ❌ Skip cache invalidation
- ❌ Put business logic in components
- ❌ Hardcode API URLs

---

## 🛠️ Troubleshooting

**Data not updating after mutation**  
→ Did you call `swrMutate("/api/cart")`?

**401 Unauthorized errors**  
→ Token is attached automatically. Check localStorage for "token".

**Type errors**  
→ Import types from `lib/types.ts`

---

**Last Updated:** Feb 24, 2026  
**Maintainer:** Frontend Team
 
 
