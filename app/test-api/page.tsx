"use client";

import { useState } from "react";
import { 
  useProducts, 
  useCart, 
  useAddresses, 
  loginUser, 
  addToCart 
} from "@/lib/hooks";

export default function TestApiPage() {
  // --- 1. LOCAL STATE FOR LOGS ---
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  // --- 2. SWR HOOKS (Run automatically) ---
  const { products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { cartItems, cartTotal, isLoading: cartLoading, isError: cartError } = useCart();
  const { addresses, isLoading: addressLoading, isError: addressError } = useAddresses();

  // --- 3. ACTIONS ---

  // TEST LOGIN
  const handleLogin = async () => {
    addLog("⏳ Attempting Login...");
    try {
      // Replace with a valid user from your database
      const res = await loginUser({
        email: "test@example.com", 
        password: "password123"
      });
      addLog(`✅ Login Success! Token: ${res.data.token.substring(0, 15)}...`);
      // Force reload to pick up token in SWR
      window.location.reload(); 
    } catch (err: any) {
      addLog(`❌ Login Failed: ${err.message}`);
      console.error(err);
    }
  };

  // TEST ADD TO CART
  const handleAddToCart = async () => {
    if (products.length === 0) return addLog("❌ No products available to add.");
    
    const productToAdd = products[0]; // Pick the first product
    addLog(`⏳ Adding "${productToAdd.name}" to cart...`);

    try {
      await addToCart(productToAdd._id, 1);
      addLog("✅ Added to Cart Successfully!");
    } catch (err: any) {
      addLog(`❌ Add to Cart Failed: ${err.message}`);
    }
  };

  return (
    <div className="p-10 font-mono text-sm max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-4">🔌 API Integration Test</h1>

      {/* --- SECTION 1: AUTH --- */}
      <section className="p-4 border rounded bg-gray-50">
        <h2 className="font-bold text-lg mb-2">1. Authentication</h2>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Login (test@example.com)
          </button>
          <div className="text-gray-600">
            Token Status: {typeof window !== 'undefined' && localStorage.getItem("token") 
              ? "✅ Present" 
              : "❌ Missing"}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: PRODUCTS (Public Route) --- */}
      <section className="p-4 border rounded bg-gray-50">
        <h2 className="font-bold text-lg mb-2">2. Products (GET /api/products)</h2>
        {productsLoading && <p>Loading products...</p>}
        {productsError && <p className="text-red-500">Error fetching products</p>}
        
        {products.length > 0 ? (
          <div className="bg-white p-2 border rounded max-h-40 overflow-auto">
            <p className="text-green-600 font-bold">Found {products.length} products:</p>
            <pre>{JSON.stringify(products[0], null, 2)}</pre>
          </div>
        ) : (
          <p>No products found.</p>
        )}
      </section>

      {/* --- SECTION 3: CART (Protected Route) --- */}
      <section className="p-4 border rounded bg-gray-50">
        <h2 className="font-bold text-lg mb-2">3. Cart (GET & POST /api/cart)</h2>
        <div className="mb-4">
           <button 
             onClick={handleAddToCart}
             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
           >
             Add First Product to Cart
           </button>
        </div>

        {cartLoading && <p>Loading cart...</p>}
        {cartError && <p className="text-red-500">Error fetching cart (Are you logged in?)</p>}
        
        <div className="bg-white p-2 border rounded">
           <p>Total Items: {cartItems.length}</p>
           <p>Total Value: ${cartTotal}</p>
        </div>
      </section>

      {/* --- SECTION 4: ADDRESSES (Protected Route) --- */}
      <section className="p-4 border rounded bg-gray-50">
        <h2 className="font-bold text-lg mb-2">4. Addresses (GET /api/addresses)</h2>
        {addressLoading && <p>Loading addresses...</p>}
        {addressError && <p className="text-red-500">Error fetching addresses</p>}
        
        <div className="bg-white p-2 border rounded">
           <pre>{JSON.stringify(addresses, null, 2)}</pre>
        </div>
      </section>

      {/* --- CONSOLE LOGS --- */}
      <div className="mt-8">
        <h3 className="font-bold border-b pb-2 mb-2">Activity Logs:</h3>
        <div className="bg-black text-green-400 p-4 rounded h-64 overflow-auto">
          {logs.length === 0 && <span className="opacity-50">// Actions will appear here...</span>}
          {logs.map((log, i) => (
            <div key={i} className="mb-1">{">"} {log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}