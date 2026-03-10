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
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cartContext";
<<<<<<< HEAD
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addWishlistItem, removeWishlistItem } from "@/redux/wishlistslice";
=======
import { useStore } from "@/lib/storeContext";
import { useAppDispatch } from "@/redux/store";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { useAuth } from "@/app/(main)/components/authContext";
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
import ProductReviews from "@/app/components/ProductReviews";
import ProductCard from "@/app/components/ProductCard";
import { productService } from "@/services/product.service";
import { useToast } from "@/app/components/GlobalToast";

// --- TYPES ---
interface Product {
  id: number;
  category: string;
  slug?: string;
  mongoId?: string;
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

interface ImageType {
  url: string;
  id?: string;
}

interface SavedItem {
  product?: { _id?: string };
  _id?: string;
  id?: string | number;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800";

const COLORS = [
  { label: "Rose Gold", value: "#C9956C" },
  { label: "Silver",    value: "#B0B0B0" },
  { label: "Gold",      value: "#FFD700" },
  { label: "Pink",      value: "#D94F7A" },
];

const SIZES = ["Small", "Medium", "Large"];

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const dispatch = useAppDispatch();
<<<<<<< HEAD
  const { items: savedItems = [] } = useAppSelector((state: any) => state.wishlist);
=======
  const { user } = useAuth();
  const { handleSaved, savedItems = [] } = useStore();
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("Medium");
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
    } catch {
      console.error("[Similar] fetch failed");
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
          id: 0,
          mongoId,
          name: data.name,
          price: data.price,
          originalPrice: data.price + 150,
          description: data.description,
          category: data.category,
          image: data.images?.[0]?.url || FALLBACK_IMAGE,
<<<<<<< HEAD
          images: data.images?.length
            ? data.images.map((img: any) => img.url).filter(Boolean)
            : [FALLBACK_IMAGE],
          slug,
          prdId,
=======
          images: data.images?.length ? data.images.map((img: ImageType) => img.url) : [FALLBACK_IMAGE],
          slug,
          prdId: prdId,
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
          rating: 4.8,
          reviews: 128,
        });
        if (prdId) await fetchSimilarWith(prdId);
        else if (mongoId) await fetchSimilarWith(mongoId);
        else if (slug) await fetchSimilarWith(slug);
      } catch {
        console.error("[getById] failed:");
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
      } catch {
        console.error("Failed to load product story");
      } finally {
        setStoryLoading(false);
      }
    };
    run();
  }, [productId]);

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
        c.scrollTo({
          left: thumb.offsetLeft - c.offsetWidth / 2 + thumb.offsetWidth / 2,
          behavior: "smooth",
        });
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Product Not Found</h2>
        <Link href="/products" className="text-[#D94F7A] hover:underline font-medium">
          Return to Products
        </Link>
      </div>
    );
  }

<<<<<<< HEAD
  // --- HANDLERS ---
  const isSaved = savedItems.some((item: any) => String(item.product?._id) === String(product.id) || String(item.product?.id) === String(product.id));
=======
  const backendProductId: string = product.mongoId || product.prdId || productId;

  const isSaved = (savedItems as SavedItem[]).some((item: SavedItem) =>
    String(item.product?._id || item._id || item.id) === String(backendProductId)
  );

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const buildCartItem = () => ({
    id: backendProductId,
    name: product.name,
    image: product.image,
    price: product.price,
    category: product.category,
    badge: product.badge,
    rating: product.rating,
    reviews: product.reviews,
    originalPrice: product.originalPrice,
  });

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!product) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (user || token) {
      try {
        await dispatch(reduxAddToCart({ productId: backendProductId, quantity })).unwrap();
        setIsAdded(true);
        showToast("Success!", "Added to bag", "success");
        setTimeout(() => setIsAdded(false), 3500);
      } catch {
        showToast("Error", "Failed to add to cart", "error");
      }
    } else {
      addToCart(buildCartItem(), quantity);
      setIsAdded(true);
      showToast("Success!", "Added to bag", "success");
      setTimeout(() => setIsAdded(false), 3500);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      if (user || token) {
        await dispatch(reduxAddToCart({ productId: backendProductId, quantity })).unwrap();
      } else {
        addToCart(buildCartItem(), quantity);
      }
      showToast("Redirecting...", "Taking you to checkout", "info");
      window.location.href = "/checkout";
    } catch {
      showToast("Error", "Could not process request", "error");
    }
  };

  const handleWishlist = () => {
<<<<<<< HEAD
    if (isSaved) {
      dispatch(removeWishlistItem(String(product.id)));
      showToast("Removed", "Removed from wishlist", "info");
    } else {
      dispatch(addWishlistItem(product));
      showToast("Success!", "Added to wishlist", "success");
=======
    if (!product) return;
    const willBeSaved = !isSaved;
    handleSaved({ ...product, id: backendProductId });
    if (willBeSaved) {
      showToast("Success!", "Added to wishlist", "success");
    } else {
      showToast("Removed", "Removed from wishlist", "info");
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
    }
  };

  const scrollSimilar = (dir: "left" | "right") => {
    if (!similarProductsRef.current) return;
    const { scrollLeft, clientWidth } = similarProductsRef.current;
    similarProductsRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomMode(false);
    setSelectedImage((selectedImage - 1 + product.images.length) % product.images.length);
  };
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomMode(false);
    setSelectedImage((selectedImage + 1) % product.images.length);
  };

  const storyImageSrc = productStory?.storyMedia?.trim() ? productStory.storyMedia : product.image;
  const storyText = productStory?.story?.trim()
    ? productStory.story
    : "Every piece I create is infused with love and intention. I want the wearer to feel special and confident.";

<<<<<<< HEAD
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
=======
  const displaySimilarProducts =
    !similarLoading && similarProducts.length > 0
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
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06

  return (
    <div className="bg-white font-sans overflow-x-clip min-h-screen relative pb-4 md:pb-0">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-1.5 md:gap-2 text-xs md:text-sm font-bold"
        >
          <ChevronLeft size={16} className="md:w-4 md:h-4" /> Back to Products
        </Link>
      </div>

<<<<<<< HEAD
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-gray-100">

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div ref={containerRef} className="relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 group">
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 pointer-events-none">
                <div className="bg-[#E05C7E] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">Bestseller</div>
                <div className="bg-[#4CAF50] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md">New</div>
=======
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 border-b border-gray-100">
        {/* Image section */}
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div
              ref={containerRef}
              className="relative w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-100 group"
            >
              <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-1.5 md:gap-2 z-30 pointer-events-none">
                <div className="bg-[#E05C7E] text-white text-[10px] md:text-[13px] font-bold px-3 py-1.5 md:px-5 md:py-2 rounded-full shadow-md">
                  Bestseller
                </div>
                <div className="bg-[#4CAF50] text-white text-[10px] md:text-[13px] font-bold px-3 py-1.5 md:px-5 md:py-2 rounded-full shadow-md">
                  New
                </div>
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
              </div>

              <button
                onClick={goToPrevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-4 hidden md:flex items-center justify-center"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-4 hidden md:flex items-center justify-center"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2 md:gap-3 z-20">
                <button
                  onClick={handleWishlist}
                  className={`p-2.5 md:p-3 rounded-full shadow-md transition-all active:scale-90 ${
                    isSaved ? "bg-[#D94F7A] text-white" : "bg-white/90 text-gray-400 hover:text-[#D94F7A]"
                  }`}
                >
                  <Heart size={18} className="md:w-5 md:h-5" fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button className="p-2.5 md:p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all">
                  <Share2 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              <div
                ref={mainImageScrollRef}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar md:overflow-x-hidden aspect-square"
              >
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative shrink-0 w-full aspect-square snap-start"
                    onMouseMove={handleMouseMove}
                    onClick={() => setIsZoomMode(!isZoomMode)}
                    style={{ cursor: isZoomMode ? "zoom-out" : "zoom-in" }}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        transform: isZoomMode && idx === selectedImage ? `scale(${zoomLevel})` : "scale(1)",
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transition: isZoomMode ? "transform 0.15s ease-out" : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <Image 
                        src={img} 
                        className="w-full h-full object-cover" 
                        draggable={false} 
                        alt={`Product ${idx + 1}`}
                        width={800}
                        height={800}
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToPrevImage}
              className="hidden md:flex p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            <div ref={scrollContainerRef} className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar snap-x max-w-full">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-14 h-14 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all snap-center ${
                    selectedImage === idx
                      ? "border-[#D94F7A] ring-2 md:ring-4 ring-[#D94F7A]/10 scale-95"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image 
                    src={img} 
                    className="w-full h-full object-cover" 
                    alt={`Thumbnail ${idx + 1}`}
                    width={96}
                    height={96}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={goToNextImage}
              className="hidden md:flex p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4 md:gap-5">
          <span className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">
            {product.category}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 leading-tight -mt-1">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-0.5 text-yellow-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="md:w-4 md:h-4" fill={s <= Math.round(product.rating) ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            <button
              onClick={() => { setShowBottomReviews(true); setTimeout(() => reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
              className="text-sm text-[#D94F7A] font-semibold hover:underline"
            >
              See all reviews
            </button>
          </div>

          <div className="bg-[#F7F0EE] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-[#D94F7A]">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm md:text-base text-gray-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
              )}
              {discountPct && (
                <span className="bg-[#4CAF50] text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 md:mt-2">inclusive of all taxes</p>
          </div>

          <p className="text-sm md:text-base text-gray-600 leading-6 md:leading-7">{product.description}</p>

          <div className="flex flex-col gap-2 md:gap-3">
            <span className="text-sm md:text-[15px] font-semibold text-gray-900">Choose Color</span>
            <div className="flex gap-3 md:gap-4">
              {COLORS.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(idx)}
                  title={col.label}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[3px] transition-all relative flex items-center justify-center ${
                    selectedColor === idx ? "border-[#D94F7A] scale-105" : "border-transparent hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: col.value }}
                >
                  {selectedColor === idx && (
                    <svg width="11" height="11" className="md:w-3 md:h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            <span className="text-sm md:text-[15px] font-semibold text-gray-900">Choose Size</span>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border-2 transition-all ${
                    selectedSize === size ? "bg-[#D94F7A] border-[#D94F7A] text-white" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
<<<<<<< HEAD
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 h-14 transition-all ${isAdded ? "bg-emerald-600 text-white" : "bg-[#D94F7A] hover:bg-[#b83d63] text-white"}`}
=======
          </div>

          <div className="flex items-center">
            <div className="inline-flex items-center gap-3 md:gap-4 bg-[#FAF0F0] rounded-full px-3 py-2.5 md:px-4 md:py-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#D94F7A] hover:bg-[#D94F7A] hover:text-white transition-all active:scale-90"
              >
                <Minus size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
              <span className="font-bold text-gray-900 text-base md:text-lg w-6 text-center select-none">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#D94F7A] hover:bg-[#D94F7A] hover:text-white transition-all active:scale-90"
              >
                <Plus size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 w-full">
            <button
              onClick={(e) => handleAddToCart(e)}
              disabled={isAdded}
              className={`flex-[3] font-semibold rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
                isAdded ? "bg-emerald-500 text-white" : "bg-[#D94F7A] hover:bg-[#c2436d] text-white"
              }`}
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
            >
              {isAdded ? (
                <><CheckCircle2 size={14} className="md:w-4 md:h-4" strokeWidth={2.5} /> Added</>
              ) : (
                <><ShoppingBag size={14} className="md:w-4 md:h-4" /> Add to Bag</>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-[2] font-semibold rounded-full border-2 border-gray-200 bg-white text-gray-800 hover:border-gray-300 flex items-center justify-center py-3 md:py-3.5 text-xs md:text-sm transition-all"
            >
              Buy Now
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden">
            <div className="border-b border-gray-100">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "reviews" ? null : "reviews")}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="text-left pr-2 md:pr-4 flex flex-col items-start">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="text-sm md:text-base font-bold text-gray-900">Customer Reviews</span>
                    <span className="bg-[#D94F7A] text-white text-[8px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase">
                      {product.reviews} Reviews
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">See what others are saying</p>
                </div>
                <div className={`p-1.5 md:p-2 bg-gray-100 rounded-full transition-transform duration-300 shrink-0 ${activeAccordion === "reviews" ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="md:w-[18px] md:h-[18px] text-gray-600" />
                </div>
              </button>
              {activeAccordion === "reviews" && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 md:gap-5">
                  <div className="border-b border-gray-50 pb-3 md:pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#D94F7A] font-bold text-[10px] md:text-xs">S</div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-gray-900">Sarah Miller</p>
                        <p className="text-[8px] md:text-[10px] text-gray-400">January 15, 2026 • Verified Purchase</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-2 text-yellow-400">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={10} className="md:w-3 md:h-3" fill="currentColor" />)}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-600 italic">&quot;Absolutely Beautiful! The craftsmanship is incredible.&quot;</p>
                  </div>
                  <button
                    onClick={() => { setShowBottomReviews(true); setTimeout(() => reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                    className="text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-wider hover:underline text-center"
                  >
                    View All {product.reviews} Reviews
                  </button>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === "detail" ? null : "detail")}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm md:text-base font-bold text-gray-900">Product Detail</span>
                  <span className="text-[10px] md:text-xs text-gray-400 mt-0.5">Share your experience with this product</span>
                </div>
                <div className={`p-1.5 md:p-2 bg-gray-100 rounded-full transition-transform duration-300 shrink-0 ${activeAccordion === "detail" ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="md:w-[18px] md:h-[18px] text-gray-600" />
                </div>
              </button>
              {activeAccordion === "detail" && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-sm text-gray-600 animate-in fade-in slide-in-from-top-2 leading-relaxed">
                  Crafted with precision using ethically sourced materials. This piece features a unique artisan design, perfect for both daily wear and special occasions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story section */}
      {!storyLoading && (
        <div className="bg-[#050505] py-10 md:py-16 lg:py-32 px-4 relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-full md:flex-1 relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group/story">
              <Image 
                src={storyImageSrc} 
                className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover/story:scale-110" 
                alt="Artisan Story"
                width={1200}
                height={675}
              />
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-sm rounded-full py-2 px-3 md:py-2.5 md:px-5 flex items-center gap-2 md:gap-3 shadow-2xl z-20">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#D94F7A] flex items-center justify-center text-white font-bold text-[10px] md:text-xs">SA</div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-[10px] md:text-sm">Sarah Anderson</span>
                  <span className="text-gray-400 text-[7px] md:text-[9px] uppercase font-bold">Master Artisan</span>
                </div>
              </div>
            </div>
            <div className="w-full md:flex-1 bg-[#0F0F0F] rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-14 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-[55%] md:h-[65%] bg-[#D94F7A] rounded-r-full" />
              <div className="pl-4 md:pl-6 lg:pl-10 space-y-4 md:space-y-6">
                <p className="text-white text-base md:text-lg lg:text-2xl italic font-medium leading-relaxed">&quot;{storyText}&quot;</p>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="w-6 md:w-8 h-0.5 bg-[#D94F7A]" />
                  <p className="text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-widest">Master Artisan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ── Similar Products ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2 md:pt-16 md:pb-8">
        <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-4 md:mb-8">Similar Products</h3>

        {/* Wrapper: relative for button positioning, extra side padding on desktop for button gutters */}
        <div className="relative group/similar px-0 md:px-10">

          {/* Prev button in left gutter */}
          <button
            onClick={() => scrollSimilar("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover/similar:opacity-100 hidden md:flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next button in right gutter */}
          <button
            onClick={() => scrollSimilar("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover/similar:opacity-100 hidden md:flex items-center justify-center"
          >
            <ChevronRight size={22} />
          </button>

          {/* 
            Mobile:  horizontal scroll, each card = 75vw (swipeable)
            Desktop: NO scroll — 4 cards fill the row exactly using flex + w-[calc]
                     gap-6 = 24px × 3 gaps = 72px total gap
                     each card = (100% - 72px) / 4
          */}
          <div
            ref={similarProductsRef}
            className="flex gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible pb-6 md:pb-8 no-scrollbar snap-x md:snap-none scroll-smooth"
          >
            {!similarLoading &&
              (displaySimilarProducts.length > 0 ? displaySimilarProducts : [1, 2, 3, 4]).map((p) => (
                <div
                  key={typeof p === "number" ? p : p.id}
                  className="snap-start similar-card-wrapper"
                >
                  <div className="w-full h-full">
                    <ProductCard
                      product={typeof p === "number" ? { ...product, id: p } : p}
                    />
                  </div>
                </div>
              ))}
>>>>>>> 8803a153c3283f6ab10d99887e3a2da63e429c06
          </div>
        </div>
      </div>

      {/* Reviews section */}
      {showBottomReviews && (
        <div
          ref={reviewsSectionRef}
          className="max-w-7xl mx-auto pb-6 md:pb-10 px-4 md:px-6 pt-2 md:pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <ProductReviews productId={productId} isLoggedIn={false} hasPurchased={false} />
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Mobile: each card takes 75vw for swipe feel */
        .similar-card-wrapper {
          flex: 0 0 75vw;
          width: 75vw;
          min-width: 0;
        }

        /* Desktop: 4 equal columns filling the full row */
        @media (min-width: 768px) {
          .similar-card-wrapper {
            flex: 1 1 0%;
            width: auto;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}