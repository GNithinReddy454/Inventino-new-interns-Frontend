"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Minus,
  Plus,
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle2,
  ChevronDown,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem } from "@/redux/wishlistslice";
import ProductReviews from "@/app/components/ProductReviews";
import ProductCard from "@/app/components/ProductCard";
import { productService } from "@/services/product.service";
import { useToast } from "@/app/components/GlobalToast";

// --- TYPES ---
interface Product {
  id: number;
  category: string;
  slug?: string;
  prdId?: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  name: string;
  description?: string;
  badge?: string;
}

interface SimilarProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: { id: string; url: string }[];
  productId: string;
  slug: string;
  ratingsAverage: number;
  ratingsCount: number;
}

interface ProductStory {
  story: string;
  storyMedia: string;
  productId: string;
  name: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const dispatch = useAppDispatch();
  const { items: savedItems = [] } = useAppSelector((state: any) => state.wishlist);
  const { showToast } = useToast();

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

  const [productStory, setProductStory] = useState<ProductStory | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);

  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarProductsRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const hasFetchedStory = useRef(false);
  const hasFetchedSimilar = useRef(false);
  const hasFetchedProduct = useRef(false);

  // --- API LOGIC (Unchanged) ---
  const fetchSimilarWith = async (id: string) => {
    if (!id || hasFetchedSimilar.current) return;
    hasFetchedSimilar.current = true;
    setSimilarLoading(true);
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const similarRes = await productService.getSimilar(id + cacheBuster);
      const payload = similarRes?.data ?? similarRes;
      const list: SimilarProduct[] = Array.isArray(payload) ? payload : [];
      setSimilarProducts(list);
    } catch (err) {
      console.error("[Similar] fetch failed", err);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    if (!productId || hasFetchedProduct.current) return;
    hasFetchedProduct.current = true;

    const run = async () => {
      if (productId.length < 20) {
        setProduct({
          id: parseInt(productId) || 999,
          name: "Artisan Handcrafted Jewelry",
          price: 89.99,
          originalPrice: 129.99,
          description: "Unique journey from concept to creation.",
          category: "EXCLUSIVE",
          image: FALLBACK_IMAGE,
          images: [FALLBACK_IMAGE],
          rating: 4.9,
          reviews: 156,
        });
        setLoading(false);
        return;
      }

      try {
        const res = await productService.getById(productId);
        const data = res?.data ?? res;
        const prdId: string = data?.productId ?? "";
        const slug: string = data?.slug ?? "";
        const mongoId: string = String(data?._id ?? productId);

        setProduct({
          id: parseInt(mongoId) || 0,
          name: data.name,
          price: data.price,
          originalPrice: data.price + 150,
          description: data.description,
          category: data.category,
          image: data.images?.[0]?.url || FALLBACK_IMAGE,
          images: data.images?.length
            ? data.images.map((img: any) => img.url).filter(Boolean)
            : [FALLBACK_IMAGE],
          slug,
          prdId,
          rating: 4.8,
          reviews: 128,
        });

        if (prdId) await fetchSimilarWith(prdId);
        else if (mongoId) await fetchSimilarWith(mongoId);
        else if (slug) await fetchSimilarWith(slug);
      } catch (err) {
        console.error("[getById] failed:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [productId]);

  useEffect(() => {
    if (!productId || productId.length < 20 || hasFetchedStory.current) return;
    hasFetchedStory.current = true;

    const run = async () => {
      setStoryLoading(true);
      try {
        const cacheBuster = `?cb=${Date.now()}`;
        const storyRes = await productService.getStory(productId + cacheBuster);
        const storyData = storyRes?.data ?? storyRes;
        if (storyData) setProductStory(storyData);
      } catch (err) {
        console.error("Failed to load product story", err);
      } finally {
        setStoryLoading(false);
      }
    };
    run();
  }, [productId]);

  // --- UI EFFECTS ---
  useEffect(() => {
    if (mainImageScrollRef.current && window.innerWidth >= 768) {
      mainImageScrollRef.current.scrollTo({
        left: selectedImage * mainImageScrollRef.current.offsetWidth,
        behavior: "instant" as ScrollBehavior,
      });
    }
    if (scrollContainerRef.current) {
      const c = scrollContainerRef.current;
      const thumb = c.children[selectedImage] as HTMLElement;
      if (thumb)
        c.scrollTo({ left: thumb.offsetLeft - c.offsetWidth / 2 + thumb.offsetWidth / 2, behavior: "smooth" });
    }
  }, [selectedImage]);

  useEffect(() => {
    const c = mainImageScrollRef.current;
    if (!c) return;
    const handle = () => {
      if (window.innerWidth >= 768) return;
      setSelectedImage(Math.round(c.scrollLeft / c.offsetWidth));
    };
    c.addEventListener("scroll", handle, { passive: true });
    return () => c.removeEventListener("scroll", handle);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D94F7A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <Link href="/products" className="text-[#D94F7A] hover:underline font-medium">Return to Products</Link>
      </div>
    );
  }

  // --- HANDLERS ---
  const isSaved = savedItems.some((item: any) => String(item.product?._id) === String(product.id) || String(item.product?.id) === String(product.id));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = () => {
    addToCart(product as any, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3500);
    showToast("Success!", "Added to bag", "success");
  };

  const handleWishlist = () => {
    if (isSaved) {
      dispatch(removeWishlistItem(String(product.id)));
      showToast("Removed", "Removed from wishlist", "info");
    } else {
      dispatch(addWishlistItem(product));
      showToast("Success!", "Added to wishlist", "success");
    }
  };

  const scrollSimilar = (dir: "left" | "right") => {
    if (!similarProductsRef.current) return;
    const { scrollLeft, clientWidth } = similarProductsRef.current;
    similarProductsRef.current.scrollTo({ left: dir === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8, behavior: "smooth" });
  };

  const goToPrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setIsZoomMode(false); setSelectedImage((selectedImage - 1 + product.images.length) % product.images.length); };
  const goToNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setIsZoomMode(false); setSelectedImage((selectedImage + 1) % product.images.length); };

  const storyImageSrc = productStory?.storyMedia?.trim() ? productStory.storyMedia : product.image;
  const storyText = productStory?.story?.trim() ? productStory.story : "Every piece I create is infused with love and intention. I want the wearer to feel special and confident.";

  const displaySimilarProducts = !similarLoading && similarProducts.length > 0
    ? similarProducts.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      originalPrice: p.price + 150,
      category: p.category,
      image: p.images?.[0]?.url || FALLBACK_IMAGE,
      images: p.images?.length ? p.images.map((img) => img.url) : [FALLBACK_IMAGE],
      rating: p.ratingsAverage || 4.5,
      reviews: p.ratingsCount || 0,
      description: p.description,
    }))
    : [];

  return (
    <div className="bg-white font-sans overflow-x-clip min-h-screen relative pb-4 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-2 text-sm font-bold">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-gray-100">

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div ref={containerRef} className="relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 group">
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 pointer-events-none">
                <div className="bg-[#E05C7E] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">Bestseller</div>
                <div className="bg-[#4CAF50] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">New</div>
              </div>

              <button onClick={goToPrevImage} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-4 hidden md:flex items-center justify-center"><ChevronLeft size={24} /></button>
              <button onClick={goToNextImage} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-4 hidden md:flex items-center justify-center"><ChevronRight size={24} /></button>

              <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                <button onClick={handleWishlist} className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${isSaved ? "bg-[#D94F7A] text-white" : "bg-white/90 text-gray-400 hover:text-[#D94F7A]"}`}><Heart size={20} fill={isSaved ? "currentColor" : "none"} /></button>
                <button className="p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all"><Share2 size={20} /></button>
              </div>

              <div ref={mainImageScrollRef} className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar md:overflow-x-hidden aspect-square">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative shrink-0 w-full aspect-square snap-start" onMouseMove={handleMouseMove} onClick={() => setIsZoomMode(!isZoomMode)} style={{ cursor: isZoomMode ? "zoom-out" : "zoom-in" }}>
                    <div className="w-full h-full" style={{ transform: isZoomMode && idx === selectedImage ? `scale(${zoomLevel})` : "scale(1)", transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`, transition: isZoomMode ? "transform 0.15s ease-out" : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                      <img src={img} className="w-full h-full object-cover" draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 md:hidden">
              {product.images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${selectedImage === idx ? "w-5 bg-[#D94F7A]" : "w-1.5 bg-gray-300"}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button onClick={goToPrevImage} className="p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0 hidden md:block"><ChevronLeft size={16} /></button>
            <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x max-w-fit">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all snap-center ${selectedImage === idx ? "border-[#D94F7A] ring-4 ring-[#D94F7A]/10 scale-95" : "border-gray-100 hover:border-gray-300"}`}><img src={img} className="w-full h-full object-cover" /></button>
              ))}
            </div>
            <button onClick={goToNextImage} className="p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0 hidden md:block"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <span className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[#D94F7A]">₹{product.price.toFixed(2)}</span>
            <span className="text-lg text-gray-400 line-through font-medium">₹{product.originalPrice?.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-8">{product.description}</p>
          <div className="flex flex-col items-start gap-4">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Choose Color</span>
            <div className="flex gap-4">
              {["#E0BFB8", "#FFD700", "#C0C0C0"].map((col, idx) => (
                <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${selectedColor === idx ? "border-gray-900 scale-110" : "border-gray-200"}`} style={{ backgroundColor: col }} />
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center bg-[#FFF1F2] rounded-full h-14 px-2 border border-pink-50 shadow-sm p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Minus size={16} strokeWidth={3} /></button>
              <span className="font-bold text-gray-900 w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D94F7A] transition-all hover:scale-110"><Plus size={16} strokeWidth={3} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 h-14 transition-all ${isAdded ? "bg-emerald-600 text-white" : "bg-[#D94F7A] hover:bg-[#b83d63] text-white"}`}
            >
              {isAdded ? <><CheckCircle2 size={18} strokeWidth={3} /> Added</> : <><ShoppingBag size={18} /> Add to Bag</>}
            </button>
          </div>
          <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="border-b border-gray-100">
              <button onClick={() => setActiveAccordion(activeAccordion === "reviews" ? null : "reviews")} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="text-left pr-4 flex flex-col items-start">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">Customer Reviews</span>
                    <span className="bg-[#D94F7A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center">{product.reviews} Reviews</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">See what others are saying</p>
                </div>
                <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === "reviews" ? "rotate-180" : ""}`}><ChevronDown size={20} className="text-gray-600" /></div>
              </button>
              {activeAccordion === "reviews" && (
                <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-2 flex flex-col gap-6">
                  <button onClick={() => { setShowBottomReviews(true); setTimeout(() => reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }} className="text-[#D94F7A] text-xs font-bold uppercase tracking-wider hover:underline text-center">View All {product.reviews} Reviews</button>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => setActiveAccordion(activeAccordion === "detail" ? null : "detail")} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col items-start text-left">
                  <span className="text-xl font-bold text-gray-900">Product Detail</span>
                  <span className="text-sm text-gray-400 mt-1">Materials & Origin</span>
                </div>
                <div className={`p-2 bg-gray-100 rounded-full transition-transform duration-300 ${activeAccordion === "detail" ? "rotate-180" : ""}`}><ChevronDown size={20} className="text-gray-600" /></div>
              </button>
              {activeAccordion === "detail" && (
                <div className="p-6 pt-0 text-sm text-gray-600 animate-in fade-in slide-in-from-top-2 leading-relaxed">
                  Crafted with precision using ethically sourced materials. This piece features a unique artisan design, perfect for both daily wear and special occasions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!storyLoading && (
        <div className="bg-[#050505] py-16 md:py-32 px-4 relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:flex-1 relative aspect-video rounded-3xl overflow-hidden shadow-2xl group/story">
              <img src={storyImageSrc} className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover/story:scale-110" alt="Artisan Story" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-full py-2.5 px-5 flex items-center gap-3 shadow-2xl z-20">
                <div className="w-9 h-9 rounded-full bg-[#D94F7A] flex items-center justify-center text-white font-bold text-xs">SA</div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-sm">Sarah Anderson</span>
                  <span className="text-gray-400 text-[9px] uppercase font-bold">Master Artisan</span>
                </div>
              </div>
            </div>
            <div className="w-full md:flex-1 bg-[#0F0F0F] rounded-3xl p-8 md:p-14 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-[65%] bg-[#D94F7A] rounded-r-full" />
              <div className="pl-6 md:pl-10 space-y-6">
                <p className="text-white text-lg md:text-2xl italic font-medium leading-relaxed">"{storyText}"</p>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-[#D94F7A]" />
                  <p className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">Master Artisan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similar Products - Fixed Mobile View Gap */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 md:pt-16 md:pb-8 relative group/similar">
        <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
        <button onClick={() => scrollSimilar("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover/similar:opacity-100 transition-all -translate-x-4 group-hover/similar:translate-x-2 hidden md:flex items-center justify-center"><ChevronLeft size={24} /></button>
        <button onClick={() => scrollSimilar("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 group-hover/similar:opacity-100 transition-all translate-x-4 group-hover/similar:-translate-x-2 hidden md:flex items-center justify-center"><ChevronRight size={24} /></button>
        <div className="overflow-hidden">
          <div ref={similarProductsRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x scroll-smooth">
            {!similarLoading && (displaySimilarProducts.length > 0 ? displaySimilarProducts : [1, 2, 3, 4]).map((p, idx) => (
              <div key={typeof p === 'number' ? p : p.id} className="snap-start shrink-0" style={{ width: "clamp(250px, 80%, calc(25% - 18px))" }}>
                <ProductCard product={typeof p === 'number' ? { ...product, id: p } : (p as any)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section - Fixed Mobile View Margin */}
      {showBottomReviews && (
        <div ref={reviewsSectionRef} className="max-w-7xl mx-auto pb-10 px-6 pt-2 md:pb-20 md:pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ProductReviews productId={productId} isLoggedIn={false} hasPurchased={false} />
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}