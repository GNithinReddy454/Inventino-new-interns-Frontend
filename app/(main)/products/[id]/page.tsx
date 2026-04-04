"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  LogIn,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useStore } from "@/lib/storeContext";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { fetchWishlist } from "@/redux/wishlistslice";
import { setBuyNowProduct } from "@/redux/buyNowSlice";
import { useAuth } from "@/app/(main)/components/authContext";
import ProductReviews from "@/app/components/ProductReviews";
import ProductCard from "@/app/components/ProductCard";
import { productService } from "@/services/product.service";
import { useToast } from "@/app/components/GlobalToast";

// ============================================================================
// TYPES
// ============================================================================

interface ProductColor {
  color_id: string;
  color_name: string;
  color_code: string;
  images: string[];
}

interface ProductSize {
  size_id: string;
  size: string;
}

interface ProductPrice {
  color_id: string;
  size_id: string;
  price: number;
  stock: number;
}

type ImageType = string | { url?: string; id?: string; _id?: string };

interface Product {
  id: string;
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
  colorVariants?: ProductColor[];
  sizeVariants?: ProductSize[];
  priceMatrix?: ProductPrice[];
}

interface SimilarProduct {
  _id: string;
  name?: string;
  description?: string;
  price: number;
  category?: string;
  images?: Array<string | { id?: string; url?: string }>;
  productId?: string;
  slug?: string;
  ratingsAverage?: number;
  ratingsCount?: number;
  originalPrice?: number;
  bestSeller?: boolean;
  trendy?: boolean;
  discountPrice?: number;
}

interface ProductStory {
  story?: string | { content?: string; title?: string };
  content?: string;
  storyMedia?: string;
  productId?: string;
  name?: string;
}

// Merged ImageType definition at line 55

interface ReviewData {
  reviews: Array<{
    user: {
      name: string;
      email: string;
    };
    rating: number;
    comment: string;
    images?: Array<{ url?: string }>;
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
  images?: Array<{ url?: string }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800";

const FALLBACK_COLORS = [
  { label: "Rose Gold", value: "#C9956C" },
  { label: "Silver", value: "#B0B0B0" },
  { label: "Gold", value: "#FFD700" },
  { label: "Pink", value: "#D94F7A" },
];

const COLOR_NAME_TO_HEX: Record<string, string> = {
  silver: "#B0B0B0",
  gold: "#FFD700",
  rosegold: "#C9956C",
  "rose gold": "#C9956C",
  pink: "#D94F7A",
  red: "#E53935",
  blue: "#1E88E5",
  green: "#43A047",
  black: "#212121",
  white: "#F5F5F5",
  yellow: "#FDD835",
  orange: "#FB8C00",
  purple: "#8E24AA",
  brown: "#6D4C41",
  beige: "#D7C5A0",
  navy: "#1A237E",
  grey: "#9E9E9E",
  gray: "#9E9E9E",
  copper: "#B87333",
};

const COLOR_DUMMY_IMAGES: Record<string, string[]> = {
  gold: [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
    "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=800"
  ],
  silver: [
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
    "https://images.unsplash.com/photo-1627250645069-424a73e6d625?w=800",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"
  ],
  "rose gold": [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"
  ],
  pink: [
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
  ],
};

const getDummyImagesForColor = (colorName: string): string[] => {
  const key = colorName.toLowerCase().trim();
  if (COLOR_DUMMY_IMAGES[key]) return COLOR_DUMMY_IMAGES[key];
  
  // Generic fallback if color doesn't match
  return [
    `https://placehold.co/800x800/f8f9fa/D94F7A?text=${encodeURIComponent(colorName)}+Product+1`,
    `https://placehold.co/800x800/f8f9fa/D94F7A?text=${encodeURIComponent(colorName)}+Product+2`,
  ];
};

const SIZES = ["Small", "Medium", "Large"];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const resolveColorHex = (colorVal: string): string => {
  const key = colorVal.toLowerCase().trim();
  if (COLOR_NAME_TO_HEX[key]) return COLOR_NAME_TO_HEX[key];
  const match = FALLBACK_COLORS.find((c) => c.label.toLowerCase() === key);
  if (match) return match.value;
  if (colorVal.startsWith("#") || colorVal.startsWith("rgb")) return colorVal;
  return "#B0B0B0";
};

const calculateDiscount = (original: number | null, current: number): number | null => {
  if (!original || !current || isNaN(original) || isNaN(current) || original <= current) return null;
  const pct = Math.round(((original - current) / original) * 100);
  return isNaN(pct) ? null : pct;
};

const getImageUrl = (img?: ImageType): string => {
  if (!img) return "";
  const url = typeof img === "string" ? img : img.url || "";
  if (!url || url.includes("undefined") || url.trim() === "") return "";
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "";
  return url.startsWith("http") || url.startsWith("data:") ? url : `${BASE_URL}${url}`;
};

const normalizeImages = (images?: ImageType[]): string[] => {
  const urls = (images ?? []).map(getImageUrl).filter(Boolean);
  return urls.length > 0 ? urls : [FALLBACK_IMAGE];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const [showBottomReviews, setShowBottomReviews] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
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

  const isAuthenticated = useMemo(
    () => !!user || (typeof window !== "undefined" && !!localStorage.getItem("token")),
    [user]
  );

  const backendProductId = useMemo(
    () => (product ? product.prdId || product.mongoId || productId : ""),
    [product, productId]
  );

  const activeImages = useMemo(() => {
    if (product?.colorVariants && product.colorVariants.length > 0) {
      const colorImages = product.colorVariants[selectedColor]?.images;
      if (colorImages && colorImages.length > 0) return colorImages;

      // Use dummy images for the specific color if no real images found
      const colorName = product.colorVariants[selectedColor]?.color_name || "";
      return getDummyImagesForColor(colorName);
    }
    return product?.images || [FALLBACK_IMAGE];
  }, [product, selectedColor]);

  const activePriceEntry = useMemo(() => {
    if (!product?.priceMatrix || !selectedColorId || !selectedSizeId) return null;
    return (
      product.priceMatrix.find(
        (p) => p.color_id === selectedColorId && p.size_id === selectedSizeId
      ) || null
    );
  }, [product, selectedColorId, selectedSizeId]);

  const variantColors = useMemo(
    () =>
      product
        ? product.colors && product.colors.length > 0
          ? product.colors
          : product.color
          ? [product.color]
          : []
        : [],
    [product]
  );

  const variantSizes = useMemo(
    () =>
      product
        ? product.sizes && product.sizes.length > 0
          ? product.sizes
          : SIZES
        : [],
    [product]
  );

  const hasColorVariants = useMemo(
    () => !!(product?.colorVariants && product.colorVariants.length > 0),
    [product]
  );

  const hasSizeVariants = useMemo(
    () => !!(product?.sizeVariants && product.sizeVariants.length > 0),
    [product]
  );

  const displayPrice = useMemo(() => {
    const rawPrice = activePriceEntry?.price ?? selectedVariant?.price ?? product?.price ?? 0;
    const numPrice = Number(rawPrice);
    return isNaN(numPrice) ? 0 : numPrice;
  }, [activePriceEntry, selectedVariant, product]);

  const displayStock = useMemo(() => {
    // Priority: Price Matrix Entry (fixed mapping) -> Selected Variant (dynamic name matching) -> Overall Product Stock
    const stock = activePriceEntry?.stock ?? selectedVariant?.stock ?? product?.stock ?? 0;
    const numStock = Number(stock);
    return isNaN(numStock) ? 0 : numStock;
  }, [activePriceEntry, selectedVariant, product]);

  const discountPct = useMemo(
    () => (product ? calculateDiscount(product.originalPrice, displayPrice) : null),
    [product, displayPrice]
  );

  const isInWishlist = useCallback((): boolean => {
    if (!product) return false;

    const productIdStr = String(backendProductId);
    const currentColor = hasColorVariants
      ? product.colorVariants?.[selectedColor]?.color_name || null
      : variantColors[selectedColor] || null;
    const currentSize = selectedSize;

    if (user) {
      return wishlistFromRedux.some((item: any) => {
        const itemId = item.product?._id || item._id || item.id || item.productId;
        return (
          String(itemId) === productIdStr &&
          item.color === currentColor &&
          item.size === currentSize
        );
      });
    }

    return savedItems.some((item: any) => {
      const itemId = item.product?._id || item._id || item.id || item.productId;
      return (
        String(itemId) === productIdStr &&
        item.color === currentColor &&
        item.size === currentSize
      );
    });
  }, [
    product,
    backendProductId,
    hasColorVariants,
    variantColors,
    selectedColor,
    selectedSize,
    user,
    wishlistFromRedux,
    savedItems,
  ]);

  const isSaved = useMemo(isInWishlist, [isInWishlist]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (mainImageScrollRef.current && window.innerWidth >= 768) {
      mainImageScrollRef.current.scrollTo({
        left: selectedImage * mainImageScrollRef.current.offsetWidth,
        behavior: "instant" as ScrollBehavior,
      });
    }

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const thumb = container.children[selectedImage] as HTMLElement;
      if (thumb) {
        container.scrollTo({
          left: thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [selectedImage]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  useEffect(() => {
    if (!product || variants.length === 0) return;

    const currentColor = hasColorVariants
      ? product.colorVariants?.[selectedColor]?.color_name
      : variantColors[selectedColor];
    
    const matchedVariant = variants.find((v) => {
      const hasColorMatch = !currentColor || v.attributes?.some(
        (a) => a.name?.toLowerCase() === "color" && (a.value || "").toLowerCase() === currentColor.toLowerCase()
      );
      const hasSizeMatch = !selectedSize || v.attributes?.some(
        (a) => a.name?.toLowerCase() === "size" && (a.value || "").toLowerCase() === selectedSize.toLowerCase()
      );
      return hasColorMatch && hasSizeMatch;
    });

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    }
  }, [selectedColor, selectedSize, variants, product, hasColorVariants, variantColors]);

  useEffect(() => {
    const container = mainImageScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (window.innerWidth >= 768) return;
      setSelectedImage(Math.round(container.scrollLeft / container.offsetWidth));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSimilarProducts = useCallback(async (id: string) => {
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
      console.error("[Similar Products] Fetch failed:", err);
      setSimilarProducts([]);
    } finally {
      setSimilarLoading(false);
    }
  }, []);

  const fetchProductReviews = useCallback(async (prdId: string) => {
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
      console.error("[Product Reviews] Fetch failed:", error);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const loadVariantsFromProduct = useCallback((data: any) => {
    let list: ProductVariant[] = [];
    
    // Check if the structure is grouped (from our new backend format)
    if (data?.variants && data.variants.length > 0 && data.variants[0].sizes) {
      data.variants.forEach((group: any) => {
        const color = group.color;
        const groupImages = group.images || [];
        
        if (group.sizes && group.sizes.length > 0) {
          group.sizes.forEach((s: any) => {
            list.push({
              _id: s._id || group._id || `${color}-${s.size}`,
              productId: data.productId || "",
              sku: s.sku,
              price: s.price,
              stock: s.stock,
              attributes: [
                { name: "Color", value: color },
                { name: "Size", value: s.size }
              ],
              images: groupImages.map((url: string) => ({ url }))
            });
          });
        }
      });
    } else {
      list = Array.isArray(data?.variants) ? data.variants : [];
    }

    setVariants(list);
    if (list.length > 0) {
      // Find initial matching variant
      const currentColor = hasColorVariants
        ? product?.colorVariants?.[selectedColor]?.color_name
        : variantColors[selectedColor];

      const initialMatch = list.find((v) => {
        const hasColorMatch = !currentColor || v.attributes?.some(
          (a) => a.name?.toLowerCase() === "color" && a.value?.toLowerCase() === currentColor.toLowerCase()
        );
        const hasSizeMatch = !selectedSize || v.attributes?.some(
          (a) => a.name?.toLowerCase() === "size" && a.value?.toLowerCase() === selectedSize.toLowerCase()
        );
        return hasColorMatch && hasSizeMatch;
      });

      setSelectedVariant(initialMatch || list[0]);
    }
    setVariantsLoading(false);
  }, [product, hasColorVariants, selectedColor, variantColors, selectedSize]);

  useEffect(() => {
    if (!productId || hasFetchedProduct.current) return;
    hasFetchedProduct.current = true;

    const fetchProduct = async () => {
      try {
        const res = await productService.getById(productId);
        const data = res?.data ?? res;

        if (!data) {
          setLoading(false);
          return;
        }

        const prdId: string = data?.productId ?? "";
        const slug: string = data?.slug ?? "";
        const mongoId: string = String(data?._id ?? productId);

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
            console.error("[Product Reviews] Fetch failed:", e);
          }
        }

        let colorVariants: ProductColor[] = [];
        if (Array.isArray(data.colors) && data.colors.length > 0 && typeof data.colors[0] === "object") {
          colorVariants = data.colors
            .filter((c: any) => c && typeof c === "object" && c.color_id)
            .map((c: any) => ({
              color_id: c.color_id,
              color_name: c.color_name || "",
              color_code: c.color_code || resolveColorHex(c.color_name || ""),
              images: Array.isArray(c.images) ? c.images.map((img: any) => getImageUrl(img)).filter(Boolean) : [],
            }));
        } else if (Array.isArray(data.variants) && data.variants.length > 0 && (data.variants[0].color || data.variants[0].colorName)) {
            // Grouped variants structure
            colorVariants = data.variants.map((v: any) => ({
              color_id: v._id || v.id || v.color || v.colorName || Math.random().toString(),
              color_name: v.color || v.colorName || "",
              color_code: v.colorCode || v.color_code || resolveColorHex(v.color || v.colorName || ""),
              images: Array.isArray(v.images) ? v.images.map((img: any) => getImageUrl(img)).filter(Boolean) : [],
            }));
        }

        const sizeVariants: ProductSize[] = Array.isArray(data.sizes)
          ? data.sizes
              .filter((s: any) => s && typeof s === "object" && s.size_id)
              .map((s: any) => ({
                size_id: s.size_id,
                size: s.size || "",
              }))
          : [];

        const priceMatrix: ProductPrice[] = Array.isArray(data.prices)
          ? data.prices.map((p: any) => ({
              color_id: String(p.color_id || ""),
              size_id: String(p.size_id || ""),
              price: Number(p.price || 0),
              stock: Number(p.stock || 0),
            }))
          : [];

        if (colorVariants.length > 0) {
          setSelectedColorId(colorVariants[0].color_id);
        }
        if (sizeVariants.length > 0) {
          setSelectedSizeId(sizeVariants[0].size_id);
          setSelectedSize(sizeVariants[0].size);
        }

        const derivedColorsFromVariants = data.variants
          ? Array.from(new Set(
              data.variants
                .flatMap((v: any) => v.attributes || [])
                .filter((a: any) => a.name?.toLowerCase() === "color")
                .map((a: any) => a.value)
            ))
          : [];

        const initialFlatColors =
          colorVariants.length === 0
            ? Array.isArray(data.colors) && data.colors.length > 0 && typeof data.colors[0] === "string"
              ? data.colors
              : derivedColorsFromVariants.length > 0
              ? derivedColorsFromVariants
              : data.color
              ? data.color.split(",").map((c: string) => c.trim()).filter(Boolean)
              : []
            : [];

        // Ensure Gold, Silver, Rose Gold are always available as per user request
        const mandatoryColors = ["Gold", "Silver", "Rose Gold"];
        const flatColors = Array.from(new Set([...initialFlatColors, ...mandatoryColors]));

        const derivedSizesFromVariants = data.variants
          ? Array.from(new Set(
              data.variants
                .flatMap((v: any) => {
                  if (v.sizes && Array.isArray(v.sizes)) return v.sizes.map((s: any) => s.size);
                  return (v.attributes || []).filter((a: any) => a.name?.toLowerCase() === "size").map((a: any) => a.value);
                })
            )).filter(Boolean) as string[]
          : [];

        const flatSizes =
          sizeVariants.length === 0
            ? (Array.isArray(data.sizes) && data.sizes.length > 0 && typeof data.sizes[0] === "string"
              ? data.sizes
              : derivedSizesFromVariants.length > 0
              ? derivedSizesFromVariants
              : [])
            : [];

        if (sizeVariants.length === 0 && flatSizes.length > 0) {
          if (!flatSizes.includes("Medium")) {
            setSelectedSize(flatSizes[0]);
          }
        }

        // Derive a base price for display before matrix is used
        const basePrice =
          priceMatrix.length > 0
            ? priceMatrix[0].price
            : data.pricing?.price ?? data.price ?? (variants.length > 0 ? variants[0].price : 0);

        const mainImage = data.media?.mainImage || getImageUrl(data.images?.[0]) || FALLBACK_IMAGE;
        const gallery = data.media?.galleryImages?.map((img: any) => getImageUrl(img)).filter(Boolean) || data.images?.map((img: any) => getImageUrl(img)).filter(Boolean) || [];

        setProduct({
          id: mongoId,
          mongoId,
          name: data.productName || data.name || (typeof data.story === 'object' ? data.story?.title : undefined) || "Unnamed Product",
          price: basePrice,
          originalPrice: data.pricing?.originalPrice ?? data.originalPrice ?? (basePrice > 0 ? basePrice + 150 : 0),
          description: data.description || (typeof data.story === 'object' ? data.story?.content : undefined) || "",
          category: data.category || "General",
          image:
            colorVariants.length > 0
              ? colorVariants[0].images[0] || mainImage
              : mainImage,
          images:
            colorVariants.length > 0
              ? colorVariants[0].images.length > 0
                ? colorVariants[0].images
                : gallery.length > 0 ? gallery : [mainImage]
              : gallery.length > 0 ? gallery : [mainImage],
          slug,
          prdId,
          rating: data.rating ?? liveRating,
          reviews: data.reviewCount ?? liveReviewCount,
          color: data.color ?? "",
          material: data.material ?? "",
          stock: data.totalStock ?? data.stock ?? 0,
          colors: flatColors,
          sizes: flatSizes,
          colorVariants: colorVariants.length > 0 ? colorVariants : undefined,
          sizeVariants: sizeVariants.length > 0 ? sizeVariants : undefined,
          priceMatrix: priceMatrix.length > 0 ? priceMatrix : undefined,
        });

        loadVariantsFromProduct(data);

        const resolvedId = prdId || mongoId || slug;
        if (resolvedId) {
          await fetchSimilarProducts(resolvedId);
          await fetchProductReviews(prdId || resolvedId);
        }
      } catch (err) {
        console.error("[Product Details] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, loadVariantsFromProduct, fetchSimilarProducts, fetchProductReviews]);

  useEffect(() => {
    if (!productId || hasFetchedStory.current) return;
    hasFetchedStory.current = true;

    const fetchStory = async () => {
      setStoryLoading(true);

      try {
        const cacheBuster = `?cb=${Date.now()}`;
        const storyRes = await productService.getStory(productId + cacheBuster);
        const storyData = storyRes?.data ?? storyRes;

        if (storyData) {
          setProductStory(storyData);
        }
      } catch (err) {
        console.error("[Product Story] Failed to load:", err);
      } finally {
        setStoryLoading(false);
      }
    };

    fetchStory();
  }, [productId]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomMode) return;

      const rect = e.currentTarget.getBoundingClientRect();
      setZoomPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [isZoomMode]
  );

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsZoomMode(false);
      setSelectedImage((prev) => (prev - 1 + activeImages.length) % activeImages.length);
    },
    [activeImages.length]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsZoomMode(false);
      setSelectedImage((prev) => (prev + 1) % activeImages.length);
    },
    [activeImages.length]
  );

    const handleColorSelect = useCallback(
      (idx: number) => {
        setSelectedColor(idx);
        setSelectedImage(0);
        setIsZoomMode(false);
  
        if (product?.colorVariants && product.colorVariants[idx]) {
          setSelectedColorId(product.colorVariants[idx].color_id);
        } else if (variantColors[idx]) {
          // If using flat colors, use the name as ID if no specific ID matching is available
          // This helps activePriceEntry find the right row if IDs are values
          setSelectedColorId(variantColors[idx]);
        }
      },
      [product, variantColors]
    );

  const handleSizeSelect = useCallback((sizeObj: ProductSize | string) => {
    if (typeof sizeObj === "string") {
      setSelectedSize(sizeObj);
    } else {
      setSelectedSize(sizeObj.size);
      setSelectedSizeId(sizeObj.size_id);
    }
  }, []);

  const buildCartItem = useCallback(
    () => ({
      id: backendProductId,
      name: product!.name,
      image: activeImages[0] || product!.image,
      price: displayPrice,
      category: product!.category,
      badge: product!.badge,
      rating: product!.rating,
      reviews: product!.reviews,
      originalPrice: product!.originalPrice,
      color: hasColorVariants
        ? product!.colorVariants?.[selectedColor]?.color_name || undefined
        : variantColors[selectedColor] || undefined,
      size: selectedSize,
    }),
    [product, backendProductId, displayPrice, activeImages, hasColorVariants, selectedColor, variantColors, selectedSize]
  );

  const handleAddToCart = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!product) return;

      if (displayStock === 0) {
        showToast("Out of Stock", "This product is currently unavailable", "error");
        return;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const currentColor = hasColorVariants
        ? product.colorVariants?.[selectedColor]?.color_name || null
        : variantColors[selectedColor] || null;
      const currentSize = selectedSize;

      try {
        if (user || token) {
          await dispatch(
            reduxAddToCart({
              productId: backendProductId,
              quantity,
              color: currentColor,
              size: currentSize,
            })
          ).unwrap();

          setIsAdded(true);
          showToast("Success!", "Added to bag", "success");
          setTimeout(() => setIsAdded(false), 3500);
        } else {
          addToCart(buildCartItem(), quantity);
          setIsAdded(true);
          showToast("Success!", "Added to bag", "success");
          setTimeout(() => setIsAdded(false), 3500);
        }
      } catch {
        showToast("Error", "Failed to add to cart", "error");
      }
    },
    [
      product,
      displayStock,
      hasColorVariants,
      variantColors,
      selectedColor,
      selectedSize,
      user,
      backendProductId,
      quantity,
      dispatch,
      addToCart,
      buildCartItem,
      showToast,
    ]
  );

  const handleBuyNow = useCallback(async () => {
    if (!product) return;

    if (displayStock === 0) {
      showToast("Out of Stock", "This product is currently unavailable", "error");
      return;
    }

    setIsBuyNowLoading(true);

    try {
      const currentColor = hasColorVariants
        ? product.colorVariants?.[selectedColor]?.color_name || null
        : variantColors[selectedColor] || null;
      const currentSize = selectedSize;

      dispatch(
        setBuyNowProduct({
          productId: backendProductId,
          color: currentColor,
          size: currentSize,
          quantity,
          product: {
            name: product.name || "Product",
            price: Number(displayPrice || product.price || 0),
            image: activeImages[0] || product.image || "",
          }
        })
      );

      if (!isAuthenticated) {
        showToast("Login Required", "Please login to continue with checkout", "info");

        const returnUrl = encodeURIComponent("/checkout");
        setTimeout(() => {
          router.push(`/login?redirect=${returnUrl}`);
        }, 1500);
        return;
      }

      showToast("Redirecting...", "Taking you to checkout", "info");
      setTimeout(() => {
        router.push("/checkout");
      }, 500);
    } catch (error) {
      console.error("[Buy Now] Failed:", error);
      showToast("Error", "Failed to proceed to checkout. Please try again.", "error");
    } finally {
      setIsBuyNowLoading(false);
    }
  }, [
    product,
    displayStock,
    hasColorVariants,
    variantColors,
    selectedColor,
    selectedSize,
    backendProductId,
    quantity,
    isAuthenticated,
    dispatch,
    router,
    showToast,
  ]);

  const handleWishlist = useCallback(() => {
    if (!product) return;

    const willBeSaved = !isSaved;
    const currentColor = hasColorVariants
      ? product.colorVariants?.[selectedColor]?.color_name || null
      : variantColors[selectedColor] || null;
    const currentSize = selectedSize;

    handleSaved(product, currentColor, currentSize, quantity);

    showToast(
      willBeSaved ? "Success!" : "Removed",
      willBeSaved ? "Added to wishlist" : "Removed from wishlist",
      willBeSaved ? "success" : "info"
    );
  }, [
    product,
    isSaved,
    hasColorVariants,
    variantColors,
    selectedColor,
    selectedSize,
    quantity,
    handleSaved,
    showToast,
  ]);

  const handleScrollSimilar = useCallback((direction: "left" | "right") => {
    if (!similarProductsRef.current) return;

    const { scrollLeft, clientWidth } = similarProductsRef.current;
    similarProductsRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: "smooth",
    });
  }, []);

  const handleProductClick = useCallback(
    (productId: string, slug?: string) => {
      const path = slug ? `/products/${slug}` : `/products/${productId}`;
      router.push(path);
    },
    [router]
  );

  const handleViewAllReviews = useCallback(() => {
    setShowBottomReviews(true);
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const storyImageSrc = useMemo(() => {
    const media = productStory?.storyMedia;
    return typeof media === "string" && media.trim() ? media : product?.image || FALLBACK_IMAGE;
  }, [productStory, product]);

  const storyText = useMemo(() => {
    const s = productStory?.story;
    if (typeof s === "string") return s.trim();
    if (s && typeof s === "object" && typeof s.content === "string") return s.content.trim();
    if (typeof productStory?.content === "string") return productStory.content.trim();
    return "Every piece I create is infused with love and intention. I want the wearer to feel special and confident.";
  }, [productStory]);

  const displaySimilarProducts = useMemo(
    () =>
      !similarLoading && similarProducts.length > 0
        ? similarProducts.map((p) => {
            const images = normalizeImages(p.images);

            return {
              id: p._id,
              _id: p._id,
              name: p.name || "Untitled Product",
              price: p.discountPrice ?? p.price,
              originalPrice: p.originalPrice ?? p.price + 150,
              category: p.category || "",
              image: images[0] || FALLBACK_IMAGE,
              images,
              rating: p.ratingsAverage || 4.5,
              reviews: p.ratingsCount || 0,
              description: p.description || "",
              slug: p.slug,
              productId: p.productId || p._id,
              bestSeller: p.bestSeller ?? false,
              trendy: p.trendy ?? false,
            };
          })
        : [],
    [similarLoading, similarProducts]
  );

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
        <p className="text-gray-600 text-center mb-4">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/products" className="text-[#D94F7A] hover:underline font-medium">
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans overflow-x-clip min-h-screen relative pb-4 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-500 hover:text-[#D94F7A] transition-colors gap-1.5 md:gap-2 text-xs md:text-sm font-bold"
        >
          <ChevronLeft size={16} className="md:w-4 md:h-4" />
          Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 border-b border-gray-100">
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
                onClick={handlePrevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-4 hidden md:flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 text-gray-800 hover:bg-[#D94F7A] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-4 hidden md:flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2 md:gap-3 z-20">
                <button
                  onClick={handleWishlist}
                  className={`p-2.5 md:p-3 rounded-full shadow-md transition-all active:scale-90 ${
                    isSaved
                      ? "bg-[#D94F7A] text-white"
                      : "bg-white/90 text-gray-400 hover:text-[#D94F7A]"
                  }`}
                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} className="md:w-5 md:h-5" fill={isSaved ? "currentColor" : "none"} />
                </button>

                <button
                  className="p-2.5 md:p-3 bg-white/90 text-gray-400 hover:text-[#D94F7A] rounded-full shadow-md transition-all"
                  aria-label="Share product"
                >
                  <Share2 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              <div
                ref={mainImageScrollRef}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar md:overflow-x-hidden aspect-square"
              >
                {activeImages.map((img, idx) => (
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
                        transform:
                          isZoomMode && idx === selectedImage
                            ? `scale(2.2)`
                            : "scale(1)",
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transition: isZoomMode
                          ? "transform 0.15s ease-out"
                          : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <Image
                        src={img}
                        className="w-full h-full object-cover"
                        draggable={false}
                        alt={`${product.name} - Image ${idx + 1}`}
                        width={800}
                        height={800}
                        priority={idx === 0}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handlePrevImage}
              className="hidden md:flex p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0"
              aria-label="Previous thumbnail"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar snap-x max-w-full"
            >
              {activeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-14 h-14 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all snap-center ${
                    selectedImage === idx
                      ? "border-[#D94F7A] ring-2 md:ring-4 ring-[#D94F7A]/10 scale-95"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Thumbnail ${idx + 1}`}
                    width={96}
                    height={96}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleNextImage}
              className="hidden md:flex p-1.5 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-[#D94F7A] hover:text-white transition-all shrink-0"
              aria-label="Next thumbnail"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <span className="text-[#D94F7A] text-xs font-bold uppercase tracking-widest">
            {product.category}
          </span>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 leading-tight -mt-1">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-0.5 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className="md:w-4 md:h-4"
                  fill={star <= Math.round(product.rating) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>

            <span className="text-sm font-semibold text-gray-700">{(product.rating || 0).toFixed(1)}</span>
            <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>

            <button
              onClick={handleViewAllReviews}
              className="text-sm text-[#D94F7A] font-semibold hover:underline"
            >
              See all reviews
            </button>
          </div>

          <div className="bg-[#F7F0EE] rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-[#D94F7A]">
                ₹{(displayPrice || 0).toFixed(2)}
              </span>

              {product.originalPrice && (
                <span className="text-sm md:text-base text-gray-400 line-through">
                  ₹{(product.originalPrice || 0).toFixed(2)}
                </span>
              )}

              {typeof discountPct === 'number' && !isNaN(discountPct) && discountPct > 0 && (
                <span className="bg-[#4CAF50] text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 md:mt-2">
              inclusive of all taxes
            </p>
          </div>

          <p className="text-sm md:text-base text-gray-600 leading-6 md:leading-7">
            {product.description}
          </p>

          {hasColorVariants ? (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">
                Color:{" "}
                <span className="font-normal text-gray-600">
                  {product.colorVariants?.[selectedColor]?.color_name}
                </span>
              </span>
              <div className="flex gap-3 md:gap-4">
                {product.colorVariants?.map((colorObj, idx) => {
                  const isSelected = selectedColor === idx;
                  return (
                    <button
                      key={colorObj.color_id}
                      onClick={() => handleColorSelect(idx)}
                      title={colorObj.color_name}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[3px] transition-all relative flex items-center justify-center hover:scale-110 ${
                        isSelected
                          ? "border-[#D94F7A] scale-105"
                          : "border-transparent hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: colorObj.color_code }}
                      aria-label={`Select ${colorObj.color_name} color`}
                    >
                      {isSelected && (
                        <svg
                          width="11"
                          height="11"
                          className="md:w-3 md:h-3"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : variantColors.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">
                Color:{" "}
                <span className="font-normal text-gray-600">
                  {variantColors[selectedColor]}
                </span>
              </span>
              <div className="flex gap-3 md:gap-4">
                {variantColors.map((colorVal, idx) => {
                  const bgColor = resolveColorHex(colorVal);
                  const isSelected = selectedColor === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleColorSelect(idx)}
                      title={colorVal}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[3px] transition-all relative flex items-center justify-center hover:scale-110 ${
                        isSelected
                          ? "border-[#D94F7A] scale-105"
                          : "border-transparent hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: bgColor }}
                      aria-label={`Select ${colorVal} color`}
                    >
                      {isSelected && (
                        <svg
                          width="11"
                          height="11"
                          className="md:w-3 md:h-3"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {hasSizeVariants ? (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">
                Size:{" "}
                <span className="font-normal text-gray-600">{selectedSize}</span>
              </span>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {product.sizeVariants?.map((sizeObj) => {
                  const priceEntry = product.priceMatrix?.find(
                    (p) => p.color_id === selectedColorId && p.size_id === sizeObj.size_id
                  );
                  
                  // New logic: If price matrix doesn't have it, check matching variant by name
                  const currentColor = hasColorVariants
                    ? product.colorVariants?.[selectedColor]?.color_name
                    : variantColors[selectedColor];

                  const variantForSize = variants.find((v) => {
                    const hasColorMatch = !currentColor || v.attributes?.some(
                      (a) => a.name?.toLowerCase() === "color" && a.value === currentColor
                    );
                    const hasSizeMatch = v.attributes?.some(
                      (a) => a.name?.toLowerCase() === "size" && a.value === sizeObj.size
                    );
                    return hasColorMatch && hasSizeMatch;
                  });

                  const isAvailable = priceEntry 
                    ? priceEntry.stock > 0 
                    : variantForSize 
                      ? variantForSize.stock > 0 
                      : (product.stock ?? 0) > 0;
                  const isSelected = selectedSizeId === sizeObj.size_id;

                  return (
                    <button
                      key={sizeObj.size_id}
                      onClick={() => handleSizeSelect(sizeObj)}
                      disabled={!isAvailable}
                      className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border-2 transition-all relative ${
                        isSelected
                          ? "bg-[#D94F7A] border-[#D94F7A] text-white"
                          : isAvailable
                          ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : variantSizes.length > 0 ? (
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-sm md:text-[15px] font-semibold text-gray-900">Choose Size</span>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {variantSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  
                  // Check if this specific size is available for the currently selected color
                  const currentColor = hasColorVariants
                    ? product.colorVariants?.[selectedColor]?.color_name
                    : variantColors[selectedColor];

                  const variantForSize = variants.find((v) => {
                    const hasColorMatch = !currentColor || v.attributes?.some(
                      (a) => a.name?.toLowerCase() === "color" && a.value === currentColor
                    );
                    const hasSizeMatch = v.attributes?.some(
                      (a) => a.name?.toLowerCase() === "size" && a.value === size
                    );
                    return hasColorMatch && hasSizeMatch;
                  });

                  // If variants list exists, respect its stock. If not, fallback to overall product stock.
                  const isAvailable = variantForSize ? variantForSize.stock > 0 : (product.stock ?? 0) > 0;

                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!isAvailable}
                      className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border-2 transition-all ${
                        isSelected
                          ? "bg-[#D94F7A] border-[#D94F7A] text-white"
                          : isAvailable
                          ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                displayStock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
            </span>

            {product.material && (
              <span className="text-[10px] text-gray-400 capitalize">
                Material: {product.material}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <div className="inline-flex items-center gap-3 md:gap-4 bg-[#FAF0F0] rounded-full px-3 py-2.5 md:px-4 md:py-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#D94F7A] hover:bg-[#D94F7A] hover:text-white transition-all active:scale-90"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
              </button>

              <span className="font-bold text-gray-900 text-base md:text-lg w-6 text-center select-none">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#D94F7A] hover:bg-[#D94F7A] hover:text-white transition-all active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 w-full">
            <button
              onClick={handleAddToCart}
              disabled={isAdded || displayStock === 0}
              className={`flex-3 font-semibold rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
                isAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-[#D94F7A] hover:bg-[#c2436d] text-white disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} className="md:w-4 md:h-4" />
                  Add to Bag
                </>
              )}
            </button>

            {displayStock > 0 ? (
              <button
                onClick={handleBuyNow}
                disabled={isBuyNowLoading}
                className={`flex-2 font-semibold rounded-full border-2 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
                  isBuyNowLoading
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : !isAuthenticated
                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isBuyNowLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <LogIn size={14} className="md:w-4 md:h-4" />
                    Login to Buy
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            ) : (
              <button
                onClick={handleWishlist}
                className={`flex-2 font-semibold rounded-full border-2 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 text-xs md:text-sm transition-all ${
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

          {!isAuthenticated && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <LogIn size={14} />
                <span>
                  <Link href="/login" className="font-semibold underline hover:text-blue-800">
                    Login
                  </Link>{" "}
                  to buy products and track your orders
                </span>
              </p>
            </div>
          )}

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
                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                    See what others are saying
                  </p>
                </div>

                <div
                  className={`p-1.5 md:p-2 bg-gray-100 rounded-full transition-transform duration-300 shrink-0 ${
                    activeAccordion === "reviews" ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={16} className="text-gray-600" />
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
                          Live rating: {(product.rating || 0).toFixed(1)} stars from {product.reviews || 0} reviews
                        </p>

                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {reviewsData.reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-900">
                                  {review.user.name}
                                </span>

                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={10}
                                      fill={star <= review.rating ? "#D94F7A" : "none"}
                                      stroke="#D94F7A"
                                      strokeWidth={1}
                                    />
                                  ))}
                                </div>
                              </div>

                              <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No reviews yet. Be the first to review this product!
                      </p>
                    )}

                    <button
                      onClick={handleViewAllReviews}
                      className="mt-3 text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-wider hover:underline"
                    >
                      View All {product.reviews} Reviews
                    </button>
                  </div>
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
                  <span className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                    Technical specifications and care
                  </span>
                </div>

                <div
                  className={`p-1.5 md:p-2 bg-gray-100 rounded-full transition-transform duration-300 shrink-0 ${
                    activeAccordion === "detail" ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={16} className="text-gray-600" />
                </div>
              </button>

              {activeAccordion === "detail" && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-sm text-gray-600 animate-in fade-in slide-in-from-top-2 leading-relaxed">
                  Crafted with precision using ethically sourced materials. This piece features a unique
                  artisan design, perfect for both daily wear and special occasions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                priority={false}
              />

              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/95 backdrop-blur-sm rounded-full py-2 px-3 md:py-2.5 md:px-5 flex items-center gap-2 md:gap-3 shadow-2xl z-20">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#D94F7A] flex items-center justify-center text-white font-bold text-[10px] md:text-xs">
                  SA
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-[10px] md:text-sm">Sarah Anderson</span>
                  <span className="text-gray-400 text-[7px] md:text-[9px] uppercase font-bold">
                    Master Artisan
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:flex-1 bg-[#0F0F0F] rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-14 relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-[55%] md:h-[65%] bg-[#D94F7A] rounded-r-full" />

              <div className="pl-4 md:pl-6 lg:pl-10 space-y-4 md:space-y-6">
                <p className="text-white text-base md:text-lg lg:text-2xl italic font-medium leading-relaxed">
                  &quot;{storyText}&quot;
                </p>

                <div className="flex items-center gap-2 md:gap-3">
                  <span className="w-6 md:w-8 h-0.5 bg-[#D94F7A]" />
                  <p className="text-[#D94F7A] text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    Master Artisan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-12 md:pt-16 md:pb-8 group/similar">
        <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-4 md:mb-8">Similar Products</h3>

        <div className="relative flex items-center">
          <button
            onClick={() => handleScrollSimilar("left")}
            className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full border border-gray-200 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all flex items-center justify-center"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            aria-label="Scroll similar products left"
          >
            <ChevronLeft size={24} className="md:w-6 md:h-6" />
          </button>

          <div
            ref={similarProductsRef}
            className="flex overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 w-full"
          >
            {similarLoading ? (
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
                    <ProductCard product={p} />
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={`fallback-${i}`}
                  className="flex-none w-full md:w-[calc(25%-1.25rem)] snap-start flex justify-center cursor-pointer"
                  onClick={() =>
                    handleProductClick(product.prdId || product.mongoId || productId, product.slug)
                  }
                >
                  <div className="w-full">
                    <ProductCard
                      product={{
                        id: `fallback-${i}`,
                        name: `${product.name} Style ${i}`,
                        price: product.price,
                        originalPrice: product.originalPrice ?? undefined,
                        category: product.category,
                        image: product.image,
                        images: [product.image],
                        rating: product.rating,
                        reviews: product.reviews,
                        description: product.description || "",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => handleScrollSimilar("right")}
            className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg rounded-full border border-gray-200 text-gray-700 hover:bg-[#D94F7A] hover:text-white transition-all flex items-center justify-center"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            aria-label="Scroll similar products right"
          >
            <ChevronRight size={24} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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