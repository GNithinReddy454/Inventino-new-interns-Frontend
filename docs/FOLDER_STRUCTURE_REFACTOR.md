## API Folder Structure Refactor - Complete

**Date:** Feb 24, 2026  
**Pattern:** One Base Global Hook + All Business Logic in Services

---

### ✅ Changes Completed

#### 1. **hooks/useApi.ts** - Simplified to Base Global Hooks ONLY

**REMOVED (Domain-Specific Hooks):**

- ❌ `useProducts()`
- ❌ `useProduct(id)`
- ❌ `useProductsInfinite()`
- ❌ `useCart()`
- ❌ `useAddresses()`
- ❌ `useOrderSummary()`

**KEPT (Base Global Hooks):**

- ✅ `useFetch<T>(key, config?)` - Generic GET with SWR caching
- ✅ `useInfiniteFetch<T>(key, config?)` - Paginated GET for large datasets
- ✅ `useMutate { post, put, patch, delete }` - Mutation wrapper
- ✅ `swrMutate(key)` - Cache invalidation utility
- ✅ `swrConfig` - Global SWR configuration
- ✅ `fetcher()` - GET helper for SWR
- ✅ `apiMethods` - All 5 HTTP verbs

---

#### 2. **lib/hooks.ts** - DEPRECATED

**Status:** Marked for deprecation  
**Action:** All logic moved to services  
**Backward Compatibility:** Re-exports from services for now

```ts
// Deprecated - use services instead
export { cartService } from "@/services/cart.service";
export { authService } from "@/services/auth.service";
```

---

#### 3. **services/** folder - Comprehensive Services Created

##### **product.service.ts** (Enhanced)

```ts
✅ getAll(params?)              // With filters/pagination
✅ getById(id)                  // Single product
✅ search(query)                // Search products
✅ getByCategory(category)      // Filter by category
✅ getFeatured()                // Featured products
✅ getBestSellers()             // Trending products
✅ create(data)                 // Create (ADMIN)
✅ update(id, data)             // Full update (ADMIN)
✅ patch(id, data)              // Partial update (ADMIN)
✅ delete(id)                   // Delete (ADMIN)
✅ getReviews(id)               // Get product reviews
✅ addReview(id, review)        // Add product review
✅ getImages(id)                // Get product images
✅ getInventory(id)             // Check stock
✅ getRelated(id)               // Related products
```

##### **cart.service.ts** (NEW)

```ts
✅ getCart()                    // Get all items
✅ addToCart(productId, qty)   // Add product
✅ updateCartQuantity(id, qty) // Update qty
✅ removeFromCart(productId)    // Remove item
✅ clearCart()                  // Clear entire cart
✅ applyPromoCode(code)         // Apply discount
```

##### **auth.service.ts** (NEW)

```ts
✅ loginUser(credentials)       // Log in user
✅ registerUser(userData)       // Register new user
✅ logoutUser()                 // Log out + clean localStorage
✅ refreshToken()               // Refresh auth token
✅ verifyEmail(email, otp)      // Email verification
✅ requestPasswordReset(email)  // Password reset request
✅ resetPassword(email, token, pwd) // Complete password reset
✅ getCurrentUser()              // Get profile
✅ updateProfile(userData)       // Update profile
```

##### **order.service.ts** (NEW)

```ts
✅ placeOrder(address, payment) // Place order (with formatting)
✅ getOrders()                  // Order history
✅ getOrderDetails(orderId)     // Single order details
✅ cancelOrder(orderId, reason) // Cancel order
✅ trackOrder(orderId)          // Track shipment
✅ getOrderSummary()            // Totals + tax + shipping
✅ applyDiscount(code)          // Apply discount code
✅ getReturns()                 // Return history
✅ requestReturn(orderId, itemId) // Request return
```

##### **address.service.ts** (NEW)

```ts
✅ getAddresses()               // Get all addresses
✅ getAddressById(id)           // Single address
✅ addAddress(data)             // Add new address
✅ updateAddress(id, data)      // Update address
✅ deleteAddress(id)            // Delete address
✅ setDefaultAddress(id)        // Set as default
✅ getDefaultAddress()          // Get default address
✅ validateAddress(data)        // Validate address format
```

---

#### 4. **lib/api.ts** - Unchanged

- ✅ Axios instance configuration
- ✅ Authentication interceptor
- ✅ Error handling interceptor
- ✅ `fetcher()` function for SWR
- ✅ `apiMethods` for all HTTP verbs

---

#### 5. **README.md** - Updated

**New Documentation Includes:**

- ✅ Folder structure diagram
- ✅ API pattern explanation
- ✅ Quick usage examples
- ✅ Service reference guide
- ✅ Do's and Don'ts checklist
- ✅ Troubleshooting section

---

### 🎯 New Usage Pattern

#### **Before (Domain-Specific Hooks):**

```tsx
import { useProducts, useCart, useAddresses } from "@/hooks/useApi";

const { products, isLoading } = useProducts();
const { cartItems } = useCart();
const { addresses } = useAddresses();
```

#### **After (Base Hook + Services):**

```tsx
import { useFetch, swrMutate } from "@/hooks/useApi";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";

// Option 1: Use useFetch for cached reads
const { data: products, isLoading } = useFetch("/api/products");

// Option 2: Use service directly (contains all business logic)
const results = await productService.search("laptop");
await cartService.addToCart(productId, 1);
swrMutate("/api/cart");
```

---

### 📋 Folder Structure (After Refactor)

```
c:\Users\sanjith\Desktop\Inventino-new-interns-Frontend\
│
├── hooks/
│   └── useApi.ts              [SIMPLIFIED] Only base global hooks
│
├── lib/
│   ├── api.ts                 [UNCHANGED] Axios + interceptors
│   └── hooks.ts               [DEPRECATED] Redirects to services
│
├── services/                  [REORGANIZED] All business logic
│   ├── product.service.ts     [ENHANCED] 14+ methods
│   ├── cart.service.ts        [NEW] 6 methods
│   ├── auth.service.ts        [NEW] 9 methods
│   ├── order.service.ts       [NEW] 9 methods
│   └── address.service.ts     [NEW] 8 methods
│
├── README.md                  [UPDATED] New pattern documentation
│
└── docs/
    └── api-integration-architecture-documenation.md (Previous file)
```

---

### ✅ Benefits of This Structure

1. **Single Responsibility**:
   - Hooks = data fetching only
   - Services = all business logic

2. **Easier to Maintain**:
   - Related operations grouped in services
   - No scattered utility hooks

3. **Better Performance**:
   - SWR caching centralized via `<SWRConfig>`
   - Deduplication automatic for all GET requests

4. **Scalability**:
   - Adding new domain = create one service file
   - No need to create multiple hooks

5. **Developer Experience**:
   - Services are just async functions → Use directly in components
   - No hook rules to remember
   - Clear API surface

---

### 🚀 Quick Navigation

**To fetch data with caching:**

```tsx
import { useFetch } from "@/hooks/useApi";
const { data, isLoading } = useFetch("/api/products");
```

**To perform business operations:**

```tsx
import { cartService } from "@/services/cart.service";
await cartService.addToCart(productId, 1);
```

**To refresh cache after mutations:**

```tsx
import { swrMutate } from "@/hooks/useApi";
swrMutate("/api/cart");
```

---

### 📝 Next Steps for Components

Teams should update their components to:

1. Replace domain-specific hook imports with service imports
2. Call `useFetch()` for GET operations that need caching
3. Call services directly for mutations (POST/PUT/PATCH/DELETE)
4. Always call `swrMutate()` after mutations to refresh SWR cache

Example migration:

```tsx
// Before
import { useProducts, useCart } from "@/hooks/useApi";
const { products } = useProducts();
const { cartItems } = useCart();

// After
import { useFetch } from "@/hooks/useApi";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";

const { data: products } = useFetch("/api/products");
const cartItems = await cartService.getCart();
```

---

**Created:** 2025-02-24  
**Pattern:** One Base Global Hook + Services for Business Logic  
**Status:** ✅ Complete and Ready for Use
