"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchProductStory,
  fetchSimilarProducts,
  submitProductRating,
  resetRatingState,
  SimilarProduct,
} from "@/redux/storyslice";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import ProductCard from "@/app/components/ProductCard";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/app/(main)/components/authContext";
import { useToast } from "@/app/components/GlobalToast";
import { Skeleton } from "@/app/components/ui/skeleton";

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_PRODUCT_IDS = [
  "PRD-001",
  "PRD-002",
  "PRD-003",
  "PRD-004",
  "PRD-005",
];

const THUMBNAIL_IMAGES = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
  "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed",
  "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36",
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop";
const SLIDER_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop"
];

const PROCESS_STEPS = [
  {
    id: "01",
    title: "Design & Concept",
    description: "Each design begins with sketches inspired by culture, art, and emotion. Every curve is carefully planned.",
  },
  {
    id: "02",
    title: "Handcrafting",
    description: "Using traditional techniques and modern tools, each piece is meticulously shaped, refined, and polished by hand.",
  },
  {
    id: "03",
    title: "Quality Check",
    description: "Every bracelet undergoes rigorous quality inspection and is personally approved before reaching you.",
  }
];

// ─── Helper: map SimilarProduct → ProductCardProduct ─────────────────────────
function mapToProductCard(p: SimilarProduct) {
  return {
    id: p.productId ?? p._id,
    name: p.name,
    price: p.price,
    image: p.images?.[0] || FALLBACK_IMAGE,
    category: p.category,
    rating: p.ratingsAverage,
    reviews: p.ratingsCount,
    badge: p.bestSeller ? "BESTSELLER" : p.trendy ? "TRENDING" : undefined,
  };
}

export default function StoriesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { addToCart: guestAddToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    story,
    storyLoading,
    similarProducts,
    similarLoading,
    ratingLoading,
    ratingSuccess,
    ratingError,
  } = useAppSelector((state) => state.story);

  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [similarSliderIndex, setSimilarSliderIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const currentProductId = DEFAULT_PRODUCT_IDS[activeIndex];
  const ringsContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollRings = (direction: "left" | "right") => {
    if (ringsContainerRef.current) {
      const scrollAmount = 150;
      ringsContainerRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  // Derive slider images from story data or fallbacks
  const generateSliderImages = () => {
    const rawUrl = THUMBNAIL_IMAGES[activeIndex % THUMBNAIL_IMAGES.length];
    const profileImageHighRes = `${rawUrl}?w=800&auto=format&fit=crop`;
    return [profileImageHighRes, ...SLIDER_FALLBACK_IMAGES];
  };

  const sliderImages = generateSliderImages();

  const handleNextImage = () => {
    setSliderIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const handlePrevImage = () => {
    setSliderIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // Fetch story and reset sliders whenever product changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSliderIndex(0);
    dispatch(fetchProductStory(currentProductId));
    dispatch(fetchSimilarProducts({
      productId: currentProductId,
      page: 1,
      limit: 12,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimilarSliderIndex(0);
    // sliderIndex resets are intentional on product change
  }, [currentProductId, dispatch]);

  // Generate enough items to demonstrate a working horizontal slider 
  // even if the API only returns 1 or 2 similar items.
  const extendedSimilarProducts = similarProducts.length > 0
    ? [...similarProducts, ...similarProducts, ...similarProducts, ...similarProducts].slice(0, 10)
    : [];

  const maxSimilarIndex = Math.max(0, extendedSimilarProducts.length - 4);

  useEffect(() => {
    if (ratingSuccess) {
      showToast("Success", "Rating submitted successfully!", "success");
      setTimeout(() => {
        setUserRating(0);
        setUserReview("");
        dispatch(resetRatingState());
      }, 0);
    }
    if (ratingError) {
      showToast("Error", ratingError, "error");
      dispatch(resetRatingState());
    }
  }, [ratingSuccess, ratingError, dispatch, showToast]);

  const handleAddToCart = () => {
    if (!story) return;
    const productForCart = {
      id: story.productId,
      name: story.name,
      price: 15000,
      image: story.storyMedia || FALLBACK_IMAGE,
      category: "STORY ITEM",
    };

    if (user) {
      dispatch(reduxAddToCart({ productId: story.productId, quantity: 1 }));
    } else {
      guestAddToCart(productForCart as any, 1);
    }
    showToast("Added", `${story.name} has been added to your bag`, "success");
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) {
      showToast("Wait", "Please select a star rating first", "info");
      return;
    }
    dispatch(submitProductRating({
      productId: currentProductId,
      rating: userRating,
      review: userReview
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 pb-6 pt-2 md:px-12 md:pb-12 md:pt-4 lg:px-20 lg:pb-20 lg:pt-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Top Stories Section */}
        <section>
          <h2 className="text-3xl font-bold text-[#E8456A] mb-8">Top Stories</h2>

          <div className="bg-white rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-14 border border-pink-100 shadow-xl shadow-pink-100/30">
            {/* Left Column: Story Rings & Main Image */}
            <div className="w-full lg:w-5/12 flex flex-col">

              {/* Story Rings (Image 1 style) */}
              <div className="relative flex items-center mb-8 bg-white p-4 rounded-[32px]">
                <button
                  onClick={() => handleScrollRings('left')}
                  className="absolute -left-2 z-10 w-10 h-10 rounded-full bg-[#E8456A] opacity-90 text-white hidden md:flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>

                <div
                  ref={ringsContainerRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide px-4 w-full scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {DEFAULT_PRODUCT_IDS.map((id, idx) => {
                    const isActive = activeIndex === idx;
                    const rawThumbUrl = THUMBNAIL_IMAGES[idx % THUMBNAIL_IMAGES.length];
                    const thumbImg = `${rawThumbUrl}?w=150&h=150&auto=format&fit=crop`;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveIndex(idx)}
                        className="relative flex-shrink-0 group focus:outline-none"
                      >
                        <div className={`w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-yellow-400 to-orange-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-[#E8456A]'}`}>
                          <div className="w-full h-full bg-white rounded-full p-[2px]">
                            <img src={thumbImg} alt={`Story ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                          </div>
                        </div>
                        {/* Number Badge */}
                        <div className={`absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-white text-xs font-bold border-2 border-white shadow-sm ${isActive ? 'bg-orange-400' : 'bg-[#E8456A]'}`}>
                          {idx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleScrollRings('right')}
                  className="absolute -right-2 z-10 w-10 h-10 rounded-full bg-[#E8456A] opacity-90 text-white hidden md:flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Main Visual with Slider (Image 2 style) */}
              <div className="relative w-full rounded-[32px] pt-8 pb-14 px-6 shadow-md mb-6" style={{ backgroundColor: '#E4D3C5' }}>
                <div className="relative aspect-[3/2] w-full overflow-hidden flex items-center justify-center">
                  {storyLoading ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <img
                      src={sliderImages[sliderIndex]}
                      alt={`${story?.name || 'Story Image'} ${sliderIndex + 1}`}
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                  )}
                </div>

                {sliderImages.length > 1 && !storyLoading && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-gray-800 hidden md:flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-gray-800 hidden md:flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {sliderImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSliderIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${sliderIndex === idx ? 'bg-[#E8456A]' : 'bg-[#9CA3AF]'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Artisan Identifier (Placeholder as API doesn't provide artisan info) */}
              <div className="inline-flex items-center gap-3 bg-[#E8456A]/10 border border-[#E8456A]/30 rounded-full py-2 px-4 w-fit shadow-lg shadow-[#E8456A]/5">
                <div className="w-9 h-9 rounded-full bg-[#E8456A] text-white flex items-center justify-center font-bold text-sm">
                  IJ
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-gray-900 text-[13px] font-bold tracking-wide">Inventino Artisan</span>
                  <span className="text-[#E8456A] text-[11px] font-medium">Master Crafter</span>
                </div>
              </div>
            </div>

            {/* Right Column: Descriptions */}
            <div className="w-full lg:w-7/12 flex flex-col justify-center">

              <div className="mb-4 space-y-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  The Story Behind <span className="text-[#E8456A]">This Treasure</span>
                </h2>
                <p className="text-gray-600 text-[15px]">
                  Every piece we create carries a unique journey from concept to creation
                </p>
              </div>

              <div className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
                {storyLoading ? <Skeleton className="h-12 w-3/4" /> : <h1>{story?.name}</h1>}
              </div>

              <div className="space-y-6 text-gray-600 text-[15px] leading-relaxed">

                <div className="min-h-[1.5rem]">
                  {storyLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : <p>{story?.story || "This beautiful piece is the result of years of craftsmanship perfected by our artisan community. Each item takes hours to create, with every detail carefully considered and executed."}</p>}
                </div>

                {/* Quote Box (Fallback) */}
                <div className="border-l-[3px] border-[#E8456A] pl-5 py-2 my-8 bg-gradient-to-r from-[#E8456A]/10 to-transparent rounded-r-xl p-4">
                  <p className="italic text-gray-800 font-medium mb-3">"Every piece I create is infused with love and intention. I want the wearer to feel special and confident, knowing they're wearing something truly unique."</p>
                  <p className="text-[#E8456A] font-bold text-sm">— Master Artisan</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <button
                  onClick={() => router.push(`/products/${currentProductId}`)}
                  className="bg-[#E8456A] hover:bg-[#c73a5a] text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 flex-1 sm:max-w-[200px] shadow-[0_4px_20px_rgba(232,69,106,0.3)]"
                >
                  <Eye size={18} strokeWidth={2.5} />
                  View Details
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-transparent border-2 border-gray-300 hover:border-[#E8456A] text-gray-800 hover:text-[#E8456A] px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:bg-pink-50 active:scale-95 flex-1 sm:max-w-[200px]"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Rating Submission Section (Added to support the feature in old UI) */}
        <section className="bg-white rounded-2xl p-8 border border-pink-100 shadow-md">
          <h2 className="text-2xl font-bold text-[#E8456A] mb-6">Leave a Rating</h2>
          <form onSubmit={handleRatingSubmit} className="space-y-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setUserRating(s)}
                  className={`transition-colors ${userRating >= s ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star size={32} fill={userRating >= s ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#E8456A] outline-none transition-colors"
              rows={3}
            />
            <button
              type="submit"
              disabled={ratingLoading}
              className="bg-[#E8456A] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c73a5a] transition-all disabled:opacity-50"
            >
              {ratingLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>

        {/* Creation Process Section */}
        <section>
          <h2 className="text-2xl font-bold text-[#E8456A] mb-8">Our Creation Process</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div key={step.id} className="bg-white rounded-2xl p-8 hover:bg-gray-50 transition-colors border border-pink-100 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-[#E8456A] text-white flex items-center justify-center text-lg font-black mb-6 shadow-[0_0_20px_rgba(232,69,106,0.5)]">
                  {step.id}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Products Section */}
        <section className="relative px-2 md:px-6">
          <h2 className="text-2xl font-bold text-[#E8456A] mb-8">Similar Products</h2>

          <div className="relative group flex items-center justify-center">
            {/* Left Chevron Control */}
            <button
              disabled={similarSliderIndex === 0 || similarLoading}
              onClick={() => setSimilarSliderIndex((prev) => Math.max(0, prev - 1))}
              className="absolute -left-4 md:-left-8 lg:-left-12 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-pink-100 text-gray-800 hover:text-[#E8456A] hidden md:flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-50 transition-all"
              aria-label="Previous Similar Products"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Products Grid */}
            <div className="w-full">
              {similarLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden min-h-[400px]">
                  {extendedSimilarProducts.slice(similarSliderIndex, similarSliderIndex + 4).map((product, idx) => (
                    <div key={`${product._id || product.productId}-${similarSliderIndex}-${idx}`} className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <ProductCard
                        product={mapToProductCard(product) as any}
                        onAdd={(productName) => showToast("Added", `${productName} added to bag`, "success")}
                      />
                    </div>
                  ))}

                  {/* Fallback if no items at all */}
                  {extendedSimilarProducts.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                      No similar products found right now.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Chevron Control */}
            <button
              disabled={similarSliderIndex >= maxSimilarIndex || similarLoading || extendedSimilarProducts.length <= 4}
              onClick={() => setSimilarSliderIndex((prev) => Math.min(maxSimilarIndex, prev + 1))}
              className="absolute -right-4 md:-right-8 lg:-right-12 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-pink-100 text-gray-800 hover:text-[#E8456A] hidden md:flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-50 transition-all"
              aria-label="Next Similar Products"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </section>

      </div >
    </div >
  );
}
