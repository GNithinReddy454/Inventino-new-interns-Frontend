"use client";

import React, { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag, ChevronLeft, ChevronRight, Share2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import productsData from "@/lib/products.json"; 
import { useCart } from "@/lib/cartContext"; 
import ProductReviews from "@/app/components/ProductReviews"; 
import { useStore } from "@/lib/storeContext";

// --- HELPERS ---
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const getProductById = (id: number) => {
  const templateIndex = (id - 1) % productsData.length;
  const template = productsData[templateIndex] as any;
  const categoryIndex = (id - 1) % CATEGORIES_LIST.length;
  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: CATEGORIES_LIST[categoryIndex],
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
  const { addToCart } = useCart(); 
  const { handleSaved, savedItems = [] } = useStore(); 
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string);
      setProduct(getProductById(id));
    }
  }, [params.id]);

  if (!product) return null;

  const isSaved = savedItems.some((item: any) => item.id === product.id);
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    // Success state duration for the floating pill
    setTimeout(() => setIsAdded(false), 5000);
  };

  const nextSlide = () => setSelectedImage((prev) => (prev + 1) % product.images.length);
  const prevSlide = () => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  return (
    <div className="bg-white font-sans overflow-x-hidden min-h-screen relative">
      
      {/* JET BLACK LIGHTWEIGHT FLOATING PILL */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out ${isAdded ? 'opacity-100 translate-y-0 scale-100 animate-float' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
        <Link href="/bag" className="bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] flex items-center gap-4 font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all group">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white shadow-lg shadow-pink-900/20">
            <ShoppingBag size={14} />
          </div>
          <span className="text-sm tracking-wide font-medium">View Shopping Bag</span>
          <ArrowRight size={16} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/AllProducts" className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-gray-50">
        
        {/* Main Product Carousel */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-square w-full bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 group shadow-sm">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" />
            
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-800 hover:bg-white z-20"><ChevronLeft size={20} /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-800 hover:bg-white z-20"><ChevronRight size={20} /></button>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {product.images.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${selectedImage === idx ? 'w-8 bg-[#D94F7A]' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
              <button onClick={() => handleSaved(product)} className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white/90 text-gray-400 hover:text-[#D94F7A]'}`}>
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button className="p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#D94F7A]' : 'border-gray-100'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col gap-6">
           <span className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">{product.category}</span>
           <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{product.name}</h1>
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-[#D94F7A]">${product.price.toFixed(2)}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through font-medium">${product.originalPrice.toFixed(2)}</span>}
           </div>

           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-8">{product.description}</p>
           
           <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Choose Color</span>
              <div className="flex gap-3">
                {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                  <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === idx ? 'border-gray-900 scale-110' : 'border-gray-100'}`} style={{ backgroundColor: col }} />
                ))}
              </div>
           </div>

           <div className="flex gap-4 pt-4">
              <div className="flex items-center bg-[#FFF1F2] rounded-full p-1 border border-pink-50 shadow-sm h-14 px-2">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm transition-all hover:scale-110 active:scale-95"><Minus size={16} strokeWidth={3}/></button>
                 <span className="font-bold text-gray-900 w-10 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] shadow-sm transition-all hover:scale-110 active:scale-95"><Plus size={16} strokeWidth={3}/></button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 font-bold py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 h-14 ${
                  isAdded 
                  ? "bg-emerald-600 text-white shadow-emerald-100" 
                  : "bg-[#D94F7A] hover:bg-[#b83d63] text-white"
                }`}
              >
                 {isAdded ? <><CheckCircle2 size={20} strokeWidth={3} /> Added to cart</> : <><ShoppingBag size={20} /> Add to Cart</>}
              </button>
           </div>
        </div>
      </div>

      {/* STORY SECTION */}
      <div className="bg-[#1a1a1a] text-white py-24 px-4">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border-8 border-white/5 shadow-2xl">
               <img src={product.images[0]} alt="Story" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed text-xl font-light italic">&quot;Every piece I create is infused with love and intention.&quot;</p>
              <div className="w-20 h-1 bg-[#D94F7A] rounded-full"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Handmade in London</p>
            </div>
         </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-20">
         <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((offset) => (
               <SimilarProductCard 
                  key={offset} 
                  product={getProductById(product.id + offset)} 
                  addToCart={addToCart}
                  handleSaved={handleSaved}
                  savedItems={savedItems}
               />
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto pb-20 px-4">
        <ProductReviews isLoggedIn={true} hasPurchased={true} />
      </div>

      {/* CUSTOM FLOATING ANIMATION */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// --- SIMILAR PRODUCT CARD ---
function SimilarProductCard({ product, addToCart, handleSaved, savedItems }: any) {
  const isSaved = savedItems.some((item: any) => item.id === product.id);
  const [isLocalAdded, setIsLocalAdded] = useState(false);

  const onAdd = () => {
    addToCart(product, 1);
    setIsLocalAdded(true);
    setTimeout(() => setIsLocalAdded(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all hover:shadow-xl relative">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"/>
        </Link>
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleSaved(product)} className={`p-2 rounded-full shadow-md ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white text-gray-600 hover:text-[#D94F7A]'}`}>
            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:text-[#D94F7A]"><Share2 size={14} /></button>
        </div>
      </div>
      <div className="flex flex-col flex-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{product.category}</span>
         <Link href={`/AllProducts/${product.id}`}><h4 className="font-bold text-gray-900 text-sm mb-2 hover:text-[#D94F7A] line-clamp-2">{product.name}</h4></Link>
         <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-bold text-[#D94F7A]">${product.price.toFixed(2)}</span>
            <button onClick={onAdd} className={`text-[10px] font-bold px-4 py-2 rounded-full transition-all uppercase flex items-center gap-2 ${isLocalAdded ? 'bg-emerald-600 text-white' : 'bg-[#D94F7A] text-white hover:bg-[#b83d63]'}`}>
               {isLocalAdded ? <><CheckCircle2 size={12}/> Added</> : 'Add'}
            </button>
         </div>
      </div>
    </div>
  );
}