"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import productsData from "@/lib/products.json"; 

// --- CONSTANTS ---
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

// --- HELPER: Generate Product Data by ID ---
// We use this for the main product AND the similar products to ensure consistency
const getProductById = (id: number) => {
  // 1. Get template (loop through 3 templates)
  const templateIndex = (id - 1) % productsData.length;
  const template = productsData[templateIndex];

  // 2. Get category (loop through 5 categories)
  const categoryIndex = (id - 1) % CATEGORIES_LIST.length;
  const category = CATEGORIES_LIST[categoryIndex];

  // 3. Calculate Price (Deterministic Math - Matches List Page)
  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: category,
    price: stablePrice + 0.99,
    originalPrice: stablePrice + 20.99,
    image: template.images[0], // Use first image as main
    images: template.images,   // Pass all images
    rating: 4.5 + (id % 5) * 0.1, // Variation in rating
    reviews: 50 + (id * 3),       // Variation in reviews
  };
};

export default function ProductDetailsPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  // Load Main Product
  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string);
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans">
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-pink-500 transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      {/* ================= TOP SECTION: DETAILS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
             <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover"/>
             <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-pink-500 transition-colors"><Heart size={20} /></button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-pink-500' : 'border-transparent'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-2">
             <span className="text-pink-500 text-xs font-bold uppercase">{product.category}</span>
             <div className="flex items-center text-yellow-400 text-xs ml-auto"><Star fill="currentColor" size={12} /> <span className="text-gray-500 ml-1 font-medium">{product.rating.toFixed(1)} ({product.reviews} reviews)</span></div>
           </div>
           
           <h1 className="text-4xl font-serif text-gray-900">{product.title}</h1>
           
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-pink-500">${product.price.toFixed(2)}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>}
             <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">SALE</span>
           </div>

           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-6">{product.description}</p>
           
           {/* Color Selector */}
           <div className="flex flex-col gap-4 pt-2">
             <span className="text-sm font-bold text-gray-900 block">Choose Color</span>
             <div className="flex gap-3">
               {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                 <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx ? 'border-gray-800 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: col }}/>
               ))}
             </div>
           </div>

           {/* Add to Cart */}
           <div className="flex gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-200 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:text-pink-500"><Minus size={16}/></button>
                 <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:text-pink-500"><Plus size={16}/></button>
              </div>
              <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                 <ShoppingBag size={18} /> Add to Cart
              </button>
           </div>
           
           {/* Trust Badges */}
           <div className="grid grid-cols-3 gap-4 pt-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><Truck size={16} className="text-pink-500"/> Free Shipping</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-pink-500"/> 2 Year Warranty</div>
              <div className="flex items-center gap-2"><RefreshCw size={16} className="text-pink-500"/> Easy Returns</div>
           </div>
        </div>
      </div>

      {/* ================= MIDDLE SECTION: THE STORY ================= */}
      <div className="bg-[#1a1a1a] text-white py-20 px-4 mt-12">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-serif mb-4">The Story Behind <span className="text-pink-500">This Treasure</span></h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-sm">Every piece we create carries a unique journey from concept to creation</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white/10">
                  <img src={product.images[0]} alt="Story" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-6 left-6 bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                     <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">SA</div>
                     <div><p className="font-bold text-xs">Sarah Anderson</p><p className="text-[10px] text-gray-500">Master Artisan</p></div>
                  </div>
               </div>
               <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed text-sm">This beautiful piece is the result of over 20 years of craftsmanship perfected by Sarah Anderson, a third-generation jewelry maker.</p>
                  <blockquote className="border-l-4 border-pink-500 pl-4 py-2 my-6 bg-white/5 rounded-r-lg">
                    <p className="italic text-gray-200 text-sm">"Every piece I create is infused with love and intention. I want the wearer to feel special and confident."</p>
                  </blockquote>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                     {[1,2,3].map(step => (
                        <div key={step} className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm mb-3">0{step}</div>
                           <h4 className="font-bold text-xs mb-1">{step === 1 ? 'Design' : step === 2 ? 'Craft' : 'Quality'}</h4>
                           <p className="text-[10px] text-gray-400">Meticulous attention to every detail.</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ================= BOTTOM SECTION: SIMILAR PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-20">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif text-gray-900">Similar Products</h3>
            <Link href="/products" className="text-sm font-bold text-pink-500 hover:text-pink-600">View All</Link>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
             {/* Generate 3 "Similar" products by looking at the next 3 IDs */}
             {[1, 2, 3].map((offset) => (
                 <SimilarProductCard key={offset} product={getProductById(product.id + offset)} />
             ))}
         </div>
      </div>

    </div>
  );
}

// ================= COMPONENT: SIMILAR PRODUCT CARD =================
function SimilarProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
           <img 
             src={product.image} 
             alt={product.title} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
        </Link>
        <div className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-600 shadow-sm hover:text-pink-500 cursor-pointer">
           <Heart size={16} />
        </div>
        {/* Randomly show badge based on ID logic to simulate variety */}
        {product.id % 3 === 0 && (
           <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Sale</div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</span>
         <Link href={`/products/${product.id}`}>
            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 hover:text-pink-500 transition-colors line-clamp-2">
              {product.title}
            </h4>
         </Link>
         
         <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex flex-col">
               <span className="font-bold text-pink-500">${product.price.toFixed(2)}</span>
            </div>
            <button className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md transition-colors uppercase tracking-wide">
               Add
            </button>
         </div>
      </div>
    </div>
  );
}