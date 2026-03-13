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
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { fetchWishlist } from "@/redux/wishlistslice";
import { useAuth } from "@/app/(main)/components/authContext";
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
  color?: string;
  material?: string;
  stock?: number;
  colors?: string[];
  sizes?: string[];
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

interface ReviewData {
  reviews: Array<{
    user: {
      name: string;
      email: string;
    };
    rating: number;
    comment: string;
    images?: Array<{ url: string }>;
    createdAt?: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    limit: number;
  };
}

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id: string;
  productId: string;
  sku?: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
  images?: Array<{ url: string }>;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800";

const FALLBACK_COLORS = [
  { label: "Rose Gold", value: "#C9956C" },
  { label: "Silver",    value: "#B0B0B0" },
  { label: "Gold",      value: "#FFD700" },
  { label: "Pink",      value: "#D94F7A" },
];

const COLOR_NAME_TO_HEX: Record<string, string> = {
  silver:    "#B0B0B0",
  gold:      "#FFD700",
  rosegold:  "#C9956C",
  "rose gold": "#C9956C",
  pink:      "#D94F7A",
  red:       "#E53935",
  blue:      "#1E88E5",
  green:     "#43A047",
  black:     "#212121",
  white:     "#F5F5F5",
  yellow:    "#FDD835",
  orange:    "#FB8C00",
  purple:    "#8E24AA",
  brown:     "#6D4C41",
  beige:     "#D7C5A0",
  navy:      "#1A237E",
  grey:      "#9E9E9E",
  gray:      "#9E9E9E",
  copper:    "#B87333",
};

const resolveColorHex = (colorVal: string): string => {
  const key = colorVal.toLowerCase().trim();
  if (COLOR_NAME_TO_HEX[key]) return COLOR_NAME_TO_HEX[key];
  const match = FALLBACK_COLORS.find(c => c.label.toLowerCase() === key);
  if (match) return match.value;
  if (colorVal.startsWith("#") || colorVal.startsWith("rgb")) return colorVal;
  return "#B0B0B0";
};

const SIZES = ["Small", "Medium", "Large"];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { savedItems = [], handleSaved } = useStore();
  const { showToast } = useToast();

  const wishlistFromRedux = useAppSelector((state: any) => state.wishlist?.items || []);

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

  const [reviewsData, setReviewsData] = useState<ReviewData | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarProductsRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const hasFetchedStory = useRef(false);
  const hasFetchedSimilar = useRef(false);
  const hasFetchedProduct = useRef(false);
  const hasFetchedReviews = useRef(false);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  // ─── API: Similar Products ───────────────────────────────────────────────
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
      setSimilarProducts([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  // ─── API: Reviews ────────────────────────────────────────────────────────
  const fetchProductReviews = async (prdId: string) => {
    if (!prdId || hasFetchedReviews.current) return;
    hasFetchedReviews.current = true;
    setReviewsLoading(true);
    try {
      const response = await productService.getReviews(prdId);
      const reviewData: ReviewData =
        response?.data?.data ?? response?.data ?? response;
      if (reviewData?.reviews) {
        setReviewsData(reviewData);
      }
    } catch (error) {
      console.error("[Reviews] fetch failed:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // ─── Variants: extracted directly from getById response ─────────────────
  const loadVariantsFromProduct = (data: any) => {
    const list: ProductVariant[] = Array.isArray(data?.variants) ? data.variants : [];
    setVariants(list);
    if (list.length > 0) setSelectedVariant(list[0]);
    setVariantsLoading(false);
  };

  // ─── API: Product Detail ─────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || hasFetchedProduct.current) return;
    hasFetchedProduct.current = true;

    const run = async () => {
      try {
        console.log(`Fetching product with ID: ${productId}`);
        const res = await productService.getById(productId);
        const data = res?.data ?? res;

        if (!data) {
          console.error("No product data found");
          setLoading(false);
          return;
        }

        const prdId: string = data?.productId ?? "";
        const slug: string = data?.slug ?? "";
        const mongoId: string = String(data?._id ?? productId);

        // Fetch reviews using prdId
        let liveRating = data.ratingsAverage || 4.8;
        let liveReviewCount = 0;
        const reviewId = prdId || mongoId;
        if (reviewId) {
          try {
            const reviewRes = await productService.getReviews(reviewId);
            const reviewData: ReviewData =
              reviewRes?.data?.data ?? reviewRes?.data ?? reviewRes;
            if (reviewData?.reviews) {
              setReviewsData(reviewData);
              hasFetchedReviews.current = true;
              liveReviewCount =
                reviewData.pagination?.totalReviews ?? reviewData.reviews.length;
              if (reviewData.reviews.length > 0) {
                const total = reviewData.reviews.reduce(
                  (sum: number, r: any) => sum + r.rating,
                  0
                );
                liveRating = Number((total / reviewData.reviews.length).toFixed(1));
              }
            }
          } catch (e) {
            console.error("[Reviews] fetch failed:", e);
          }
        }

        setProduct({
          id: 0,
          mongoId,
          name: data.name,
          price: data.price,
          originalPrice: (data as any).originalPrice || data.price + 150,
          description: data.description,
          category: data.category,
          image: data.images?.[0]?.url || FALLBACK_IMAGE,
          images: data.images?.length
            ? data.images.map((img: ImageType) => img.url)
            : [FALLBACK_IMAGE],
          slug,
          prdId,
          rating: liveRating,
          reviews: liveReviewCount,
          color: data.color ?? "",
          material: data.material ?? "",
          stock: data.stock ?? 0,
          colors: Array.isArray((data as any).colors) && (data as any).colors.length > 0
            ? (data as any).colors
            : (data.color
                ? data.color.split(",").map((c: string) => c.trim()).filter(Boolean)
                : []),
          sizes: Array.isArray((data as any).sizes) && (data as any).sizes.length > 0
            ? (data as any).sizes
            : [],
        });

        loadVariantsFromProduct(data);

        const resolvedId = prdId || mongoId || slug;
        if (resolvedId) {
          await fetchSimilarWith(resolvedId);
          await fetchProductReviews(prdId || resolvedId);
        }
      } catch (err) {
        console.error("[getById] failed:", err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [productId]);

  // ─── API: Product Story ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || hasFetchedStory.current) return;
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

  // ─── UI Effects ──────────────────────────────────────────────────────────
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

  // ─── Handle navigation to product details ─────────────────────────────────
  const handleProductClick = (productId: string, slug?: string) => {
    // Use slug if available, otherwise use productId
    const path = slug ? `/products/${slug}` : `/products/${productId}`;
    router.push(path);
  };

  // ─── Check if product is in wishlist ─────────────────────────────────────
  const isInWishlist = () => {
    if (!product) return false;
    
    const productIdStr = String(product.mongoId || product.prdId || productId);
    
    if (user) {
      // Check Redux wishlist for logged-in users
      return wishlistFromRedux.some((item: any) => {
        const itemId = item.product?._id || item._id || item.id || item.productId;
        return String(itemId) === productIdStr;
      });
    } else {
      // Check local store for guest users
      return savedItems.some((item: any) => {
        const itemId = item.product?._id || item._id || item.id || item.productId;
        return String(itemId) === productIdStr;
      });
    }
  };

  const isSaved = isInWishlist();

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
        <p className="text-gray-600 text-center mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products" className="text-[#D94F7A] hover:underline font-medium">
          Return to Products
        </Link>
      </div>
    );
  }

  const backendProductId: string = product.mongoId || product.prdId || productId;

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  const variantColors: string[] =
    (product.colors && product.colors.length > 0)
      ? product.colors
      : (product.color ? [product.color] : []);

  const variantSizes: string[] =
    (product.sizes && product.sizes.length > 0) ? product.sizes : [];

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
    price: displayPrice,
    category: product.category,
    badge: product.badge,
    rating: product.rating,
    reviews: product.reviews,
    originalPrice: product.originalPrice,
    color: variantColors[selectedColor],
    size: selectedSize,
  });

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!product) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (user || token) {
      try {
        await dispatch(reduxAddToCart({ 
            productId: backendProductId, 
            quantity,
            color: variantColors[selectedColor],
            size: selectedSize
        })).unwrap();
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
        await dispatch(reduxAddToCart({ 
            productId: backendProductId, 
            quantity,
            color: variantColors[selectedColor],
            size: selectedSize
        })).unwrap();
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
    if (!product) return;
    
    const willBeSaved = !isSaved;
    // use the shared context helper which already handles guest vs logged-in logic
    handleSaved(product);

    if (willBeSaved) {
      showToast("Success!", "Added to wishlist", "success");
    } else {
      showToast("Removed", "Removed from wishlist", "info");
    }
  };

  const scrollSimilar = (dir: "left" | "right") => {
    if (!similarProductsRef.current) return;
    const { scrollLeft, clientWidth } = similarProductsRef.current;
    similarProductsRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
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

  // Transform similar products for ProductCard component
  const displaySimilarProducts = !similarLoading && similarProducts.length > 0
    ? similarProducts.map((p) => ({
        id: p._id,
        _id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.price + 150,
        category: p.category,
        image: p.images?.[0]?.url || FALLBACK_IMAGE,
        images: p.images?.length ? p.images.map((img) => img.url) : [FALLBACK_IMAGE],
        rating: p.ratingsAverage || 4.5,
        reviews: p.ratingsCount || 0,
        description: p.description,
        slug: p.slug,
        productId: p.productId, // Include productId for navigation
      }))
    : [];

  return (
    <div className="bg-white font-sans overflow-x-clip min-h-screen relative pb-4 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-1.5 md:gap-2 text-xs md:text-sm font-bold"
        >
          <ChevronLeft size={16} className="md:w-4 md:h-4" /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 border-b border-gray-100">
        {/* ── Left: Images ── */}
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div
              ref={containerRef}
              className="relative w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-100 group"
            >
              <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-1.5 md:gap-2 z-30 pointer-events-none">
                {product.badge && (
                  <div className="w-fit bg-[#E05C7E] text-white text-[9px] md:text-[13px] font-bold px-2.5 py-1 md:px-5 md:py-2 rounded-full shadow-md">
                    {product.badge}
                  </div>
                )}
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

        {/* ── Right: Info ── */}
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
              <span className="text-2xl md:text-3xl font-bold text-[#D94F7A]">₹{displayPrice.toFixed(2)}</span>
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

          {/* ── Color selector: circular swatches (original UI) ── */}
          {variantColors.length > 0 && (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">Choose Color</span>
              <div className="flex gap-3 md:gap-4">
                {variantColors.map((colorVal, idx) => {
                  const bgColor = resolveColorHex(colorVal);
                  const isSelected = selectedColor === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(idx)}
                      title={colorVal}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[3px] transition-all relative flex items-center justify-center hover:scale-110 ${
                        isSelected ? "border-[#D94F7A] scale-105" : "border-transparent hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {isSelected && (
                        <svg width="11" height="11" className="md:w-3 md:h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Size selector ── */}
          {variantSizes.length > 0 && (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">Choose Size</span>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {variantSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border-2 transition-all ${
                      selectedSize === size
                        ? "bg-[#D94F7A] border-[#D94F7A] text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Stock badge from product.stock ── */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  product.stock > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
              {product.material && (
                <span className="text-[10px] text-gray-400 capitalize">Material: {product.material}</span>
              )}
            </div>
          )}

          {/* ── Quantity ── */}
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

          {/* ── Add to Bag / Wishlist ── */}
          <div className="flex gap-3 md:gap-4 w-full">
            <button
              onClick={(e) => handleAddToCart(e)}
              disabled={isAdded || product.stock === 0}
              className={`flex-[3] font-semibold rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
                isAdded ? "bg-emerald-500 text-white" : "bg-[#D94F7A] hover:bg-[#c2436d] text-white disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {isAdded ? (
                <><CheckCircle2 size={14} className="md:w-4 md:h-4" strokeWidth={2.5} /> Added</>
              ) : (
                <><ShoppingBag size={14} className="md:w-4 md:h-4" /> Add to Bag</>
              )}
            </button>
            
            {(product.stock ?? 0) > 0 ? (
              <button
                onClick={handleBuyNow}
                className="flex-[2] font-semibold rounded-full border-2 border-gray-200 bg-white text-gray-800 hover:border-gray-300 flex items-center justify-center py-3 md:py-3.5 text-xs md:text-sm transition-all"
              >
                Buy Now
              </button>
            ) : (
              <button
                onClick={handleWishlist}
                className={`flex-[2] font-semibold rounded-full border-2 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
                  isSaved 
                    ? "bg-[#D94F7A] border-[#D94F7A] text-white" 
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                }`}
              >
                <Heart size={14} className="md:w-4 md:h-4" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Wishlist"}
              </button>
            )}
          </div>

          {/* ── Accordions ── */}
          <div className="border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden">
            {/* Reviews accordion */}
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
                  <div className="py-2">
                    {reviewsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#D94F7A] rounded-full animate-spin" />
                      </div>
                    ) : reviewsData && reviewsData.reviews.length > 0 ? (
                      <>
                        <p className="text-[10px] md:text-xs text-gray-500 mb-3">
                          Live rating: {product.rating.toFixed(1)} stars from {product.reviews} reviews
                        </p>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {reviewsData.reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-900">{review.user.name}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={10} fill={s <= review.rating ? "#D94F7A" : "none"} stroke="#D94F7A" strokeWidth={1} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">No reviews yet. Be the first to review this product!</p>
                    )}
                    <button
                      onClick={() => { setShowBottomReviews(true); setTimeout(() => reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                      className="mt-3 text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-wider hover:underline"
                    >
                      View All {product.reviews} Reviews
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Product detail accordion */}
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === "detail" ? null : "detail")}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm md:text-base font-bold text-gray-900">Product Detail</span>
                  <span className="text-[10px] md:text-xs text-gray-400 mt-0.5">Technical specifications and care</span>
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

      {/* ── Artisan Story ── */}
      {!storyLoading && productStory && (
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

      {/* ── Similar Products ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-12 md:pt-16 md:pb-8 group/similar">
        <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-4 md:mb-8">Similar Products</h3>
        <div className="relative flex items-center">
          <button
            onClick={() => scrollSimilar("left")}
            className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full border border-gray-200 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all flex items-center justify-center"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <ChevronLeft size={24} className="md:w-6 md:h-6" />
          </button>

          <div
            ref={similarProductsRef}
            className="flex overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 w-full"
          >
            {similarLoading ? (
              // Loading skeletons
              [1, 2, 3, 4].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex-none w-full md:w-[calc(25%-1.25rem)] snap-start flex justify-center"
                >
                  <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))
            ) : displaySimilarProducts.length > 0 ? (
              displaySimilarProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex-none w-full md:w-[calc(25%-1.25rem)] snap-start flex justify-center cursor-pointer"
                  onClick={() => handleProductClick(p.productId || p.id, p.slug)}
                >
                  <div className="w-full">
                    <ProductCard
                      product={p}
                    />
                  </div>
                </div>
              ))
            ) : (
              // Fallback similar products when API returns none
              [1, 2, 3, 4].map((i) => (
                <div
                  key={`fallback-${i}`}
                  className="flex-none w-full md:w-[calc(25%-1.25rem)] snap-start flex justify-center cursor-pointer"
                  onClick={() => handleProductClick(product.prdId || product.mongoId || productId, product.slug)}
                >
                  <div className="w-full">
                    <ProductCard
                      product={{
                        id: `fallback-${i}`,
                        name: `${product.name} Style ${i}`,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        category: product.category,
                        image: product.image,
                        images: [product.image],
                        rating: product.rating,
                        reviews: product.reviews,
                        description: product.description,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => scrollSimilar("right")}
            className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full border border-gray-200 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all flex items-center justify-center"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <ChevronRight size={24} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      {showBottomReviews && (
        <div
          ref={reviewsSectionRef}
          className="max-w-7xl mx-auto pb-6 md:pb-10 px-4 md:px-6 pt-2 md:pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <ProductReviews
            productId={backendProductId}
            mongoProductId={backendProductId}
            isLoggedIn={!!user}
            hasPurchased={false}
          />
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 768px) {
           .fixed.bottom-6.right-6 {
             bottom: 5.5rem !important;
             z-index: 50;
           }
        }
      `}</style>
    </div>
  );
}