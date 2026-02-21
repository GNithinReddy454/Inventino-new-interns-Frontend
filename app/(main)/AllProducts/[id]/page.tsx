"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, Heart, ShoppingBag, ChevronLeft, ChevronRight, Share2, CheckCircle2, ArrowRight, ZoomIn, X, ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import productsData from "@/lib/products.json"; 
import { useCart } from "@/lib/cartContext"; 
import { useStore } from "@/lib/storeContext";
import ProductReviews from "@/app/components/ProductReviews"; 

// --- TYPES ---
interface Product {
  id: number;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  name: string;
  description?: string;
  badge?: { text: string; color: string };
  title?: string;
}

// --- HELPERS ---
const CATEGORIES_LIST = ["Bracelets", "Earrings", "Necklaces", "Rings", "Accessories"];

const getProductById = (id: number): Product => {
  const templateIndex = (id - 1) % productsData.length;
  // Use unknown as bridge to prevent type overlap errors
  const template = (productsData as any)[templateIndex];
  const categoryIndex = (id - 1) % CATEGORIES_LIST.length;
  const stablePrice = Math.floor(((id * 17) % 575) + 25);

  return {
    ...template,
    id: id,
    category: CATEGORIES_LIST[categoryIndex],
    price: stablePrice + 0.99,
    originalPrice: template.originalPrice || stablePrice + 20.99,
    image: template.images ? template.images[0] : (template.image || ""),
    images: template.images || [template.image || ""],
    rating: 4.5 + (id % 5) * 0.1,
    reviews: 128,
    name: template.name || template.title || "Jewelry Item"
  };
};

export default function ProductDetailsPage() {
  const params = useParams(); 
  const { addToCart } = useCart(); 
  const { handleSaved, savedItems = [] } = useStore(); 
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const zoomLevel = 1.8; 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarProductsRef = useRef<HTMLDivElement>(null);

  // Initialize product state directly when params change to avoid cascading render warning
  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string);
      const productData = getProductById(id);
      setProduct(productData);
    }
  }, [params.id]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeThumb = scrollContainerRef.current.children[selectedImage] as HTMLElement;
      if (activeThumb) {
        const container = scrollContainerRef.current;
        const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedImage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomMode(!isZoomMode);
  };

  if (!product) return null;

  // Casting savedItems to unknown then Product[] to fix overlap error safely
  const isSaved = (savedItems as unknown as Product[]).some((item: Product) => item.id === product.id);
  
  const handleAddToCart = () => {
    addToCart(product as any, quantity); 
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 5000);
  };

  const nextSlide = () => {
    setIsZoomMode(false);
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };
  
  const prevSlide = () => {
    setIsZoomMode(false);
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const scrollSimilar = (direction: 'left' | 'right') => {
    if (similarProductsRef.current) {
      const { scrollLeft, clientWidth } = similarProductsRef.current;
      const scrollAmount = clientWidth * 0.8; 
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      similarProductsRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white font-sans overflow-x-hidden min-h-screen relative pb-20 md:pb-0">
      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-100 transition-all duration-700 ease-out ${isAdded ? 'opacity-100 translate-y-0 scale-100 animate-float' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
        <Link href="/bag" className="bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-4 font-bold hover:bg-black transition-all group">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white shadow-lg">
            <ShoppingBag size={14} />
          </div>
          <span className="text-sm tracking-wide font-medium whitespace-nowrap">View Shopping Bag</span>
          <ArrowRight size={16} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/AllProducts" className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-gray-100">
        
        <div className="flex flex-col gap-6">
          <div 
            ref={containerRef}
            onClick={toggleZoom}
            className={`relative aspect-square w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 group transition-all duration-300 ${isZoomMode ? 'cursor-zoom-out ring-2 ring-[#D94F7A]/10' : 'cursor-zoom-in'}`}
            onMouseMove={handleMouseMove}
          >
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 pointer-events-none">
              <div className="bg-[#E05C7E] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md inline-block w-fit">
                Bestseller
              </div>
              <div className="bg-[#4CAF50] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md inline-block w-fit">
                New
              </div>
            </div>

            <div 
              className="w-full h-full"
              style={{ 
                transform: isZoomMode ? `scale(${zoomLevel})` : `scale(1)`,
                transformOrigin: isZoomMode ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
                transition: isZoomMode ? 'transform 0.1s ease-out' : 'transform 0.3s ease-in-out'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isZoomMode ? 'opacity-0' : 'group-hover:opacity-100 opacity-0'}`}>
              <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
                <ZoomIn size={18} className="text-white" />
                <span className="text-white text-sm font-medium">Click to Zoom</span>
              </div>
            </div>

            {isZoomMode && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in slide-in-from-top-2">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
                  <X size={14} className="text-[#D94F7A]" />
                  <span className="text-gray-900 text-[10px] font-bold uppercase tracking-widest">Click to Exit Zoom</span>
                </div>
              </div>
            )}

            {!isZoomMode && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-800 hover:bg-white z-20"><ChevronLeft size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-800 hover:bg-white z-20"><ChevronRight size={20} /></button>
              </>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
              <button onClick={(e) => { e.stopPropagation(); handleSaved(product as any); }} className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white/90 text-gray-400 hover:text-[#D94F7A]'}`}>
                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button onClick={(e) => e.stopPropagation()} className="p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="relative group px-4 md:px-10">
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth no-scrollbar snap-x"
            >
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => { setSelectedImage(idx); setIsZoomMode(false); }} 
                  className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-center ${
                    selectedImage === idx ? 'border-[#D94F7A] ring-4 ring-[#D94F7A]/10 scale-95' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

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
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Minus size={16} strokeWidth={3}/></button>
                 <span className="font-bold text-gray-900 w-10 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Plus size={16} strokeWidth={3}/></button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 font-bold py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 h-14 ${
                  isAdded ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-[#D94F7A] hover:bg-[#b83d63] text-white"
                }`}
              >
                 {isAdded ? <><CheckCircle2 size={20} strokeWidth={3} /> Added to bag</> : <><ShoppingBag size={20} /> Add to Bag</>}
              </button>
           </div>

           {/* ACCORDION SECTION */}
           <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden">
             <div className="border-b border-gray-100">
               <button 
                onClick={() => setActiveAccordion(activeAccordion === 'reviews' ? null : 'reviews')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
               >
                 <div className="flex flex-col items-start text-left">
                   <div className="flex items-center gap-3">
                     <span className="text-xl font-bold text-gray-900">Customer Reviews</span>
                     <span className="bg-[#D94F7A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                       {product.reviews} Reviews
                     </span>
                   </div>
                   <span className="text-sm text-gray-400 mt-1">See what others are saying</span>
                 </div>
                 <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === 'reviews' ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} className="text-gray-600" />
                 </div>
               </button>
               {activeAccordion === 'reviews' && (
                 <div className="p-6 pt-0 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2">
                   
                   <div className="border-b border-gray-50 pb-4">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#D94F7A] font-bold text-xs">S</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Sarah Miller</p>
                          <p className="text-[10px] text-gray-400">January 15, 2026 • Verified Purchase</p>
                        </div>
                     </div>
                     <div className="flex gap-1 mb-2 text-yellow-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                     <h5 className="text-sm font-bold text-gray-900 mb-1">Absolutely Beautiful!</h5>
                     <p className="text-xs text-gray-600 leading-relaxed">This bracelet exceeded all my expectations! The craftsmanship is incredible, and you can tell it was made with love.</p>
                   </div>

                   <button className="text-center text-[#D94F7A] text-xs font-bold uppercase tracking-wider py-2 hover:underline">View All 128 Reviews</button>
                 </div>
               )}
             </div>

             <div>
               <button 
                onClick={() => setActiveAccordion(activeAccordion === 'detail' ? null : 'detail')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
               >
                 <div className="flex flex-col items-start text-left">
                   <span className="text-xl font-bold text-gray-900">Product Detail</span>
                   <span className="text-sm text-gray-400 mt-1">Materials & Origin</span>
                 </div>
                 <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === 'detail' ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} className="text-gray-600" />
                 </div>
               </button>
               {activeAccordion === 'detail' && (
                 <div className="p-6 pt-0 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                   Crafted with precision using ethically sourced materials. This piece features a unique artisan design, 
                   perfect for both daily wear and special occasions. Includes a luxury gift box and authenticity card.
                 </div>
               )}
             </div>
           </div>

        </div>
      </div>

      <div className="bg-[#050505] py-16 md:py-32 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
          
          <div className="w-full md:flex-1 relative">
            <div className="relative aspect-16/10 md:aspect-16/11 w-full rounded-3xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={product.images[0]} 
                alt="Artisan Story" 
                className="w-full h-full object-cover opacity-70 md:opacity-90" 
              />
              
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-sm rounded-full py-2 px-4 md:py-2.5 md:px-5 flex items-center gap-3 shadow-2xl z-20">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#D94F7A] flex items-center justify-center text-white font-bold text-[11px] md:text-[12px] shrink-0 shadow-inner">
                  SA
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-[12px] md:text-[13px] leading-tight">Sarah Anderson</span>
                  <span className="text-gray-400 text-[8px] md:text-[9px] uppercase tracking-wider font-bold">Master Artisan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:flex-1 bg-[#0F0F0F] rounded-3xl p-8 md:p-14 relative flex items-center min-h-55 md:min-h-87.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 z-10">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[80%] md:h-[65%] bg-[#D94F7A] rounded-r-full shadow-[0_0_15px_rgba(217,79,122,0.3)]"></div>
            
            <div className="pl-6 md:pl-10 space-y-6 md:space-y-8">
              <p className="text-white text-lg md:text-2xl leading-relaxed font-medium italic font-sans tracking-tight">
                &quot;Every piece I create is infused with love and intention. I want the wearer to feel special and confident, knowing they&apos;re wearing something truly unique that was made just for them.&quot;
              </p>
              
              <div className="flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[#D94F7A]"></span>
                <p className="text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                  Sarah Anderson, Master Artisan
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 relative group/similar">
         <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
         
         <div className="relative">
            <button 
              onClick={() => scrollSimilar('left')}
              className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-white border border-gray-100 rounded-full shadow-2xl hover:bg-gray-50 transition-all opacity-0 group-hover/similar:opacity-100 hidden md:flex items-center justify-center scale-110 active:scale-95"
              aria-label="Previous Products"
            >
              <ChevronLeft size={28} className="text-gray-700" />
            </button>

            <button 
              onClick={() => scrollSimilar('right')}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 p-4 bg-white border border-gray-100 rounded-full shadow-2xl hover:bg-gray-50 transition-all opacity-0 group-hover/similar:opacity-100 hidden md:flex items-center justify-center scale-110 active:scale-95"
              aria-label="Next Products"
            >
              <ChevronRight size={28} className="text-gray-700" />
            </button>
            
            <div 
                ref={similarProductsRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar scroll-smooth"
            >
                {[1, 2, 3, 4, 5, 6].map((offset) => (
                  <div key={offset} className="min-w-70 md:min-w-[320px] snap-start">
                    <SimilarProductCard 
                        product={getProductById(product.id + offset)} 
                        addToCart={addToCart}
                        handleSaved={handleSaved}
                        savedItems={savedItems as unknown as Product[]}
                    />
                  </div>
                ))}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto pb-20 px-4">
        <ProductReviews isLoggedIn={false} hasPurchased={false} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function SimilarProductCard({ product, addToCart, handleSaved, savedItems }: { 
  product: Product, 
  addToCart: (p: Product, q: number) => void, 
  handleSaved: (p: Product) => void, 
  savedItems: Product[] 
}) {
  const isSaved = savedItems.some((item: Product) => item.id === product.id);
  const [isLocalAdded, setIsLocalAdded] = useState(false);

  const onAdd = () => {
    addToCart(product, 1);
    setIsLocalAdded(true);
    setTimeout(() => setIsLocalAdded(false), 3000);
  };

  return (
    <div className="flex flex-col group transition-all relative h-full">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"/>
        </Link>
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleSaved(product)} 
            className={`p-2.5 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white text-gray-600 hover:text-[#D94F7A]'}`}
          >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button className="p-2.5 bg-white text-gray-600 rounded-full shadow-md hover:text-[#D94F7A] transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 px-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{product.category}</span>
         <Link href={`/AllProducts/${product.id}`}>
            <h4 className="font-bold text-gray-900 text-sm mb-2 hover:text-[#D94F7A] line-clamp-2 transition-colors min-h-10">
              {product.name}
            </h4>
         </Link>
         <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-bold text-[#D94F7A] text-base">${product.price.toFixed(2)}</span>
            <button 
                onClick={onAdd} 
                disabled={isLocalAdded}
                className={`text-[11px] font-bold px-5 py-2.5 rounded-full transition-all uppercase flex items-center gap-2 tracking-wide ${
                    isLocalAdded ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-[#D94F7A] text-white hover:bg-[#b83d63] shadow-pink-100 shadow-lg'
                }`}
            >
                {isLocalAdded ? <><CheckCircle2 size={13}/> Added</> : <><ShoppingBag size={13}/> Add to Bag</>}
            </button>
         </div>
      </div>
    </div>
  );
}