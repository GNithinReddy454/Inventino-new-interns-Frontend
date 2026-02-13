"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import { useParams } from "next/navigation"; 
import productsData from "@/lib/products.json"; // <--- IMPORTING THE JSON

export default function ProductDetailsPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      // LOGIC: Map the URL ID (e.g. "150") to one of our 3 real products
      // We subtract 1 because arrays start at 0
      const index = (Number(params.id) - 1) % productsData.length;
      const foundProduct = productsData[index];
      
      setProduct(foundProduct);
    }
  }, [params.id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: IMAGES */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
             <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover"/>
             <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-pink-500"><Heart size={20} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === idx ? 'border-pink-500' : 'border-transparent'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col gap-6">
           <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">{product.category}</span>
           <h1 className="text-4xl font-serif text-gray-900">{product.title}</h1>
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-pink-500">${product.price}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>}
           </div>
           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-6">{product.description}</p>
<<<<<<< HEAD:app/AllProducts/[id]/page.tsx
           
           <div className="flex gap-4 pt-4">
=======

           <div className="space-y-3">
             <h3 className="font-bold text-sm text-gray-900">Key Features</h3>
             <ul className="space-y-2">
               {product.features.map((feat: string, i: number) => (
                 <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                   <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">✓</div> {feat}
                 </li>
               ))}
             </ul>
           </div>

           <div className="flex flex-col gap-4 pt-2">
             <div>
               <span className="text-sm font-bold text-gray-900 block mb-2">Choose Color</span>
               <div className="flex gap-3">
                 {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                   <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx ? 'border-gray-800 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: col }}/>
                 ))}
               </div>
             </div>
           </div>

           <div className="flex gap-4 pt-2 border-t border-gray-100">
>>>>>>> 7a3ffb0 (Refactor: Successfully moved pages to (main) and (auth) route groups):app/(main)/AllProducts/[id]/page.tsx
              <div className="flex items-center border border-gray-200 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus size={16}/></button>
                 <span className="font-bold w-8 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-3"><Plus size={16}/></button>
              </div>
              <button className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-all">
                 <ShoppingBag size={18} /> Add to Cart
              </button>
           </div>
        </div>
      </div>
<<<<<<< HEAD:app/AllProducts/[id]/page.tsx
      
      {/* ADD YOUR STORY SECTION & SIMILAR PRODUCTS HERE (Reuse previous code) */}
=======

      {/* ================= MIDDLE SECTION: THE STORY ================= */}
      <div className="bg-[#1a1a1a] text-white py-20 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-serif mb-4">The Story Behind <span className="text-pink-500">This Treasure</span></h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-sm">Every piece we create carries a unique journey from concept to creation</p>
            </div>
         </div>
      </div>

      {/* ================= BOTTOM SECTION: SIMILAR PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-20 bg-gray-50">
         <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             {/* Filter out the current product, then map the rest */}
             {ALL_PRODUCTS.filter(p => p.id !== product.id).map((similarProduct) => (
                 <SimilarProductCard key={similarProduct.id} product={similarProduct} />
             ))}
         </div>
      </div>

    </div>
  );
}

// ================= SIMILAR PRODUCT CARD COMPONENT =================
function SimilarProductCard({ product }: { product: any }) {
  // Use Next.js Link for navigation
  const Link = require("next/link").default; 

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
           <img 
             src={product.images[0]} 
             alt={product.title} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
        </Link>
        <div className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-600 shadow-sm">
           <Heart size={16} />
        </div>
        {/* Sale Badge if applicable */}
        {product.originalPrice && (
           <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
             Sale
           </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</span>
         <Link href={`/AllProducts/${product.id}`}>
            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 hover:text-pink-500 transition-colors line-clamp-2">
              {product.title}
            </h4>
         </Link>
         
         <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex flex-col">
               <span className="font-bold text-pink-500">${product.price}</span>
               {product.originalPrice && (
                 <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
               )}
            </div>
            <button className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold px-3 py-2 rounded-full shadow-md transition-colors uppercase tracking-wide">
               Add to Bag
            </button>
         </div>
      </div>
>>>>>>> 7a3ffb0 (Refactor: Successfully moved pages to (main) and (auth) route groups):app/(main)/AllProducts/[id]/page.tsx
    </div>
  );
}

