"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import productsData from "@/lib/products.json"; 
import { useStore } from "@/lib/storeContext"; // ADDED: Link your store logic
import { Product } from "@/lib/products";

// --- CONSTANTS ---
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

// --- HELPER: Generate Product Data by ID ---
const getProductById = (id: number) => {
  const templateIndex = (id - 1) % productsData.length;
  const template = productsData[templateIndex] as any;
  const categoryIndex = (id - 1) % CATEGORIES_LIST.length;
  const category = CATEGORIES_LIST[categoryIndex];

  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: category,
    price: stablePrice + 0.99,
    originalPrice: stablePrice + 20.99,
    image: template.images ? template.images[0] : template.image,
    images: template.images || [template.image],
    rating: 4.5 + (id % 5) * 0.1,
    reviews: 50 + (id * 3),
    name: template.name || template.title
  };
};

export default function ProductDetailsPage() {
  const params = useParams(); 
  const { handleBag, handleSaved, savedItems } = useStore(); // ADDED: Destructure store functions
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string);
      setProduct(getProductById(id));
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const isSaved = savedItems.some(item => item.id === product.id);

  return (
    <div className="bg-white font-sans">
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/AllProducts" className="inline-flex items-center text-gray-500 hover:text-pink-500 transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      {/* TOP SECTION: DETAILS */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
             <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover"/>
             {/* ADDED: Connected handleSaved here */}
             <button 
                onClick={() => handleSaved(product as Product)}
                className={`absolute top-4 right-4 p-2 rounded-full shadow-sm transition-colors ${isSaved ? 'bg-pink-500 text-white' : 'bg-white text-gray-400 hover:text-pink-500'}`}
             >
               <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
             </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-pink-500' : 'border-transparent'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-2">
             <span className="text-pink-500 text-xs font-bold uppercase">{product.category}</span>
             <div className="flex items-center text-yellow-400 text-xs ml-auto"><Star fill="currentColor" size={12} /> <span className="text-gray-500 ml-1 font-medium">{product.rating.toFixed(1)} ({product.reviews} reviews)</span></div>
           </div>
           
           <h1 className="text-4xl font-serif text-gray-900">{product.name}</h1>
           
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-pink-500">${product.price.toFixed(2)}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>}
             <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">SALE</span>
           </div>

           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-6">{product.description}</p>
           
           <div className="flex flex-col gap-4 pt-2">
             <span className="text-sm font-bold text-gray-900 block">Choose Color</span>
             <div className="flex gap-3">
               {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                 <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx ? 'border-gray-800 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: col }}/>
               ))}
             </div>
           </div>

           {/* Add to Cart Section */}
           <div className="flex gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-200 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:text-pink-500"><Minus size={16}/></button>
                 <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:text-pink-500"><Plus size={16}/></button>
              </div>
              {/* ADDED: Connected handleBag here */}
              <button 
                onClick={() => handleBag(product as Product, quantity)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                 <ShoppingBag size={18} /> Add to Cart
              </button>
           </div>
           
           <div className="grid grid-cols-3 gap-4 pt-2 text-xs text-gray-500">
             <div className="flex items-center gap-2"><Truck size={16} className="text-pink-500"/> Free Shipping</div>
             <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-pink-500"/> 2 Year Warranty</div>
             <div className="flex items-center gap-2"><RefreshCw size={16} className="text-pink-500"/> Easy Returns</div>
           </div>
        </div>
      </div>

      {/* RESTORED MIDDLE SECTION (Story) */}
      <div className="bg-[#1a1a1a] text-white py-20 px-4 mt-12">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">The Story Behind <span className="text-pink-500">This Treasure</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm mb-16">Every piece we create carries a unique journey from concept to creation</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
               <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white/10">
                  <img src={product.images[0]} alt="Story" className="w-full h-full object-cover opacity-90" />
               </div>
               <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed text-sm">This beautiful piece is the result of over 20 years of craftsmanship perfected by Sarah Anderson.</p>
                  <blockquote className="border-l-4 border-pink-500 pl-4 py-2 bg-white/5 italic text-gray-200">"Every piece I create is infused with love and intention."</blockquote>
               </div>
            </div>
         </div>
      </div>

      {/* BOTTOM SECTION: SIMILAR PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-20">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif text-gray-900">Similar Products</h3>
            <Link href="/AllProducts" className="text-sm font-bold text-pink-500 hover:text-pink-600">View All</Link>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
             {[1, 2, 3].map((offset) => (
                 <SimilarProductCard 
                    key={offset} 
                    product={getProductById(product.id + offset)} 
                    handleBag={handleBag} 
                    handleSaved={handleSaved} 
                    savedItems={savedItems} 
                 />
             ))}
         </div>
      </div>
    </div>
  );
}

// --- COMPONENT: SIMILAR PRODUCT CARD ---
function SimilarProductCard({ product, handleBag, handleSaved, savedItems }: any) {
  const isSaved = savedItems.some((item: any) => item.id === product.id);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
        {/* FIXED: Link points to /AllProducts/${id} */}
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"/>
        </Link>
        <button 
          onClick={() => handleSaved(product)} 
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${isSaved ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:text-pink-500'}`}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col flex-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{product.category}</span>
         <Link href={`/AllProducts/${product.id}`}>
            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 hover:text-pink-500 line-clamp-2">{product.name}</h4>
         </Link>
         <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-bold text-pink-500">${product.price.toFixed(2)}</span>
            <button 
              onClick={() => handleBag(product, 1)}
              className="bg-pink-500 text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-pink-600 transition-all uppercase"
            >
              Add
            </button>
         </div>
      </div>
    </div>
  );
}