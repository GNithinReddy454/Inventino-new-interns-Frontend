"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, Heart, ShoppingBag, ChevronLeft, ChevronRight, Share2, CheckCircle2, ArrowRight, ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";
import ProductReviews from "@/app/components/ProductReviews";
import { productService } from "@/services/product.service";

// --- TYPES ---
interface Product {
  id: string | number;
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
}

export default function ProductDetailsPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { handleSaved, savedItems = [] } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showBottomReviews, setShowBottomReviews] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const zoomLevel = 2.2;

  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarProductsRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getById('6989bd15afc33ec9b4f538b9');
        const data = res.data;

        setProduct({
          id: data._id,
          name: data.name,
          price: data.price,
          originalPrice: data.price + 150,
          description: data.description,
          category: data.category,
          image: data.images[0].url,
          images: data.images.map((img: any) => img.url),
          rating: 4.8,
          reviews: 128,
        });
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // Sync main image scroll & thumb scroll
  useEffect(() => {
    if (mainImageScrollRef.current) {
      const container = mainImageScrollRef.current;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        container.scrollTo({ left: selectedImage * container.offsetWidth, behavior: "instant" as ScrollBehavior });
      }
    }
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeThumb = container.children[selectedImage] as HTMLElement;
      if (activeThumb) {
        const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedImage]);

  // Mobile Swipe Detection for dots
  useEffect(() => {
    const container = mainImageScrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (window.innerWidth >= 768) return;
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      setSelectedImage(index);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D94F7A] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSaved = (savedItems as any).some((item: any) => item.id === product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleAddToCart = () => {
    addToCart(product as any, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 5000);
  };

  const scrollSimilar = (direction: 'left' | 'right') => {
    if (similarProductsRef.current) {
      const { scrollLeft, clientWidth } = similarProductsRef.current;
      const scrollAmount = clientWidth * 0.8;
      similarProductsRef.current.scrollTo({ left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount, behavior: 'smooth' });
    }
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomMode(false);
    const newIndex = (selectedImage - 1 + product.images.length) % product.images.length;
    setSelectedImage(newIndex);
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomMode(false);
    const newIndex = (selectedImage + 1) % product.images.length;
    setSelectedImage(newIndex);
  };

  return (
    <div className="bg-white font-sans overflow-x-hidden min-h-screen relative pb-4 md:pb-0">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out ${isAdded ? 'opacity-100 translate-y-0 scale-100 animate-float' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
        <Link href="/bag" className="bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-4 font-bold hover:bg-black transition-all group">
          <div className="bg-[#D94F7A] p-1.5 rounded-full text-white shadow-lg"><ShoppingBag size={14} /></div>
          <span className="text-sm tracking-wide font-medium whitespace-nowrap">View Shopping Bag</span>
          <ArrowRight size={16} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/all-products" className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-gray-100">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div ref={containerRef} className="relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 group">
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 pointer-events-none">
                <div className="bg-[#E05C7E] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">Bestseller</div>
                <div className="bg-[#4CAF50] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">New</div>
              </div>

              {/* Nav Arrows */}
              <button onClick={goToPrevImage} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-4 hidden md:flex items-center justify-center">
                <ChevronLeft size={24} />
              </button>
              <button onClick={goToNextImage} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-4 hidden md:flex items-center justify-center">
                <ChevronRight size={24} />
              </button>

              <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                <button onClick={() => handleSaved(product)} className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white/90 text-gray-400 hover:text-[#D94F7A]'}`}>
                  <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button className="p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all"><Share2 size={20} /></button>
              </div>

              <div ref={mainImageScrollRef} className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar md:overflow-x-hidden aspect-square">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative shrink-0 w-full aspect-square snap-start" onMouseMove={handleMouseMove} onClick={() => setIsZoomMode(!isZoomMode)} style={{ cursor: isZoomMode ? 'zoom-out' : 'zoom-in' }}>
                    <div className="w-full h-full" style={{ transform: (isZoomMode && idx === selectedImage) ? `scale(${zoomLevel})` : `scale(1)`, transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`, transition: isZoomMode ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <img src={img} className="w-full h-full object-cover" draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Dots */}
            <div className="flex justify-center gap-1.5 md:hidden">
              {product.images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${selectedImage === idx ? 'w-5 bg-[#D94F7A]' : 'w-1.5 bg-gray-300'}`} />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={goToPrevImage} className="p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0 hidden md:block"><ChevronLeft size={16} /></button>
            <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x max-w-fit">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all snap-center ${selectedImage === idx ? 'border-[#D94F7A] ring-4 ring-[#D94F7A]/10 scale-95' : 'border-gray-100 hover:border-gray-300'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button onClick={goToNextImage} className="p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0 hidden md:block"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <span className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[#D94F7A]">${product.price.toFixed(2)}</span>
            <span className="text-lg text-gray-400 line-through font-medium">${product.originalPrice?.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-8">{product.description}</p>

          <div className="flex flex-col items-start gap-4">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Choose Color</span>
            <div className="flex gap-4">
              {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${selectedColor === idx ? 'border-gray-900 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: col }} />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center bg-[#FFF1F2] rounded-full h-14 px-2 border border-pink-50 shadow-sm p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Minus size={16} strokeWidth={3} /></button>
              <span className="font-bold text-gray-900 w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Plus size={16} strokeWidth={3} /></button>
            </div>
            <button onClick={handleAddToCart} disabled={isAdded} className={`flex-1 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 h-14 transition-all ${isAdded ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-[#D94F7A] hover:bg-[#b83d63] text-white"}`}>
              {isAdded ? <><CheckCircle2 size={18} strokeWidth={3} /> Added</> : <><ShoppingBag size={18} /> Add to Bag</>}
            </button>
          </div>

          <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="border-b border-gray-100">
              <button onClick={() => setActiveAccordion(activeAccordion === 'reviews' ? null : 'reviews')} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="text-left pr-4 flex flex-col items-start">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">Customer Reviews</span>
                    <span className="bg-[#D94F7A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center">{product.reviews} Reviews</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">See what others are saying</p>
                </div>
                <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === 'reviews' ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-gray-600" /></div>
              </button>
              {activeAccordion === 'reviews' && (
                <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-2 flex flex-col gap-6">
                   <div className="border-b border-gray-50 pb-4">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#D94F7A] font-bold text-xs">S</div>
                       <div><p className="text-sm font-bold text-gray-900">Sarah Miller</p><p className="text-[10px] text-gray-400">January 15, 2026 • Verified Purchase</p></div>
                     </div>
                     <div className="flex gap-1 mb-2 text-yellow-400"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                     <p className="text-xs text-gray-600 italic">"Absolutely Beautiful! The craftsmanship is incredible."</p>
                   </div>
                  <button onClick={() => { setShowBottomReviews(true); setTimeout(() => reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-[#D94F7A] text-xs font-bold uppercase tracking-wider hover:underline text-center">View All {product.reviews} Reviews</button>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => setActiveAccordion(activeAccordion === 'detail' ? null : 'detail')} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col items-start text-left"><span className="text-xl font-bold text-gray-900">Product Detail</span><span className="text-sm text-gray-400 mt-1">Materials & Origin</span></div>
                <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === 'detail' ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-gray-600" /></div>
              </button>
              {activeAccordion === 'detail' && <div className="p-6 pt-0 text-sm text-gray-600 animate-in fade-in slide-in-from-top-2 leading-relaxed">Crafted with precision using ethically sourced materials. This piece features a unique artisan design, perfect for both daily wear and special occasions.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Section */}
      <div className="bg-[#050505] py-16 md:py-32 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:flex-1 relative aspect-video rounded-3xl overflow-hidden shadow-2xl group/story">
            <img src={product.image} className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover/story:scale-110" alt="Artisan Story" />
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-full py-2.5 px-5 flex items-center gap-3 shadow-2xl z-20">
              <div className="w-9 h-9 rounded-full bg-[#D94F7A] flex items-center justify-center text-white font-bold text-xs">SA</div>
              <div className="flex flex-col"><span className="text-gray-900 font-bold text-sm">Sarah Anderson</span><span className="text-gray-400 text-[9px] uppercase font-bold">Master Artisan</span></div>
            </div>
          </div>
          <div className="w-full md:flex-1 bg-[#0F0F0F] rounded-3xl p-8 md:p-14 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[65%] bg-[#D94F7A] rounded-r-full shadow-[0_0_15px_rgba(217,79,122,0.3)]"></div>
            <div className="pl-6 md:pl-10 space-y-6">
              <p className="text-white text-lg md:text-2xl italic font-medium leading-relaxed">"Every piece I create is infused with love and intention. I want the wearer to feel special and confident, knowing they're wearing something truly unique."</p>
              <div className="flex items-center gap-3"><span className="w-8 h-0.5 bg-[#D94F7A]"></span><p className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">Master Artisan</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-20 relative group/similar">
        <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
        <button onClick={() => scrollSimilar('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover/similar:opacity-100 transition-all -translate-x-4 group-hover/similar:translate-x-2"><ChevronLeft size={24} /></button>
        <button onClick={() => scrollSimilar('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover/similar:opacity-100 transition-all translate-x-4 group-hover/similar:-translate-x-2"><ChevronRight size={24} /></button>
        <div ref={similarProductsRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x scroll-smooth">
          {[1, 2, 3, 4, 5, 6].map((offset) => (
            <div key={offset} className="min-w-[280px] md:min-w-[320px] snap-start">
               <SimilarProductCard product={{...product, id: `sim-${offset}`} as any} addToCart={addToCart} handleSaved={handleSaved} savedItems={savedItems} />
            </div>
          ))}
        </div>
      </div>

      {showBottomReviews && (
        <div ref={reviewsSectionRef} className="max-w-7xl mx-auto pb-20 px-6 pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ProductReviews isLoggedIn={false} hasPurchased={false} />
        </div>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function SimilarProductCard({ product, addToCart, handleSaved, savedItems }: any) {
  const isSaved = savedItems.some((item: any) => item.id === product.id);
  const [isLocalAdded, setIsLocalAdded] = useState(false);
  const onAdd = () => { addToCart(product, 1); setIsLocalAdded(true); setTimeout(() => setIsLocalAdded(false), 3000); };

  return (
    <div className="flex flex-col group transition-all relative h-full">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full"><img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" /></Link>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button onClick={() => handleSaved(product)} className={`p-2.5 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? 'bg-[#D94F7A] text-white' : 'bg-white text-gray-600 hover:text-[#D94F7A]'}`}><Heart size={16} fill={isSaved ? "currentColor" : "none"} /></button>
          <button className="p-2.5 bg-white text-gray-600 hover:text-[#D94F7A] rounded-full shadow-md transition-all active:scale-90"><Share2 size={16} /></button>
        </div>
      </div>
      <div className="flex flex-col flex-1 px-1">
        <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{product.category}</span>
        <h4 className="font-bold text-gray-900 text-sm mb-2 hover:text-[#D94F7A] line-clamp-2 min-h-10 transition-colors">{product.name}</h4>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-[#D94F7A] text-base">${product.price.toFixed(2)}</span>
          <button onClick={onAdd} disabled={isLocalAdded} className={`text-[11px] font-bold px-5 py-2.5 rounded-full uppercase flex items-center gap-2 ${isLocalAdded ? 'bg-emerald-600 text-white' : 'bg-[#D94F7A] text-white hover:bg-[#b83d63]'}`}>
            {isLocalAdded ? <><CheckCircle2 size={13} /> Added</> : <><ShoppingBag size={13} /> Add to Bag</>}
          </button>
        </div>
      </div>
    </div>
  );
}