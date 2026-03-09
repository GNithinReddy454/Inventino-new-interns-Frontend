"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Eye, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchProductStory,
  fetchSimilarProducts,
  submitProductRating,
  resetRatingState,
  setSimilarCurrentPage,
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
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop";

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
    storyError,
    similarProducts,
    similarLoading,
    similarTotalPages,
    similarCurrentPage,
    ratingLoading,
    ratingSuccess,
    ratingError,
  } = useAppSelector((state) => state.story);

  const [activeIndex, setActiveIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const currentProductId = DEFAULT_PRODUCT_IDS[activeIndex];

  // Fetch story whenever product changes
  useEffect(() => {
    dispatch(fetchProductStory(currentProductId));
  }, [currentProductId, dispatch]);

  // Fetch similar products with pagination
  useEffect(() => {
    dispatch(fetchSimilarProducts({
      productId: currentProductId,
      page: similarCurrentPage,
      limit: 4
    }));
  }, [currentProductId, similarCurrentPage, dispatch]);

  useEffect(() => {
    if (ratingSuccess) {
      showToast("Success", "Rating submitted successfully!", "success");
      setUserRating(0);
      setUserReview("");
      dispatch(resetRatingState());
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

              {/* Story Rings */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                {DEFAULT_PRODUCT_IDS.map((id, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveIndex(idx)}
                      className="relative flex-shrink-0 group hover:-translate-y-1 transition-transform"
                    >
                      <div className={`w-16 h-16 rounded-full p-[3px] transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-[#E8456A] to-[#ffb1c4]' : 'bg-gray-200 hover:bg-pink-100'}`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#E8456A]">
                          {idx + 1}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#E8456A] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Main Visual */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 mb-6 flex items-center justify-center shadow-xl">
                {storyLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <img
                    src={story?.storyMedia || FALLBACK_IMAGE}
                    alt={story?.name}
                    className="w-full h-full object-cover rounded-2xl p-6 md:p-10"
                    style={{
                      backgroundColor: "#ebd5c1",
                      objectFit: "cover",
                      boxShadow: "inset 0px 0px 20px rgba(0,0,0,0.5)"
                    }}
                  />
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
              <div className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
                {storyLoading ? <Skeleton className="h-12 w-3/4" /> : <h1>{story?.name || "The Story Behind This Treasure"}</h1>}
              </div>

              <div className="space-y-6 text-gray-600 text-[15px] leading-relaxed">
                <p>
                  Every piece we create carries a unique journey from concept to creation.
                </p>
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
        <section>
          <h2 className="text-2xl font-bold text-[#E8456A] mb-8">Similar Products</h2>

          {similarLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={mapToProductCard(product) as any}
                  onAdd={(productName) => showToast("Added", `${productName} added to bag`, "success")}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {similarTotalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-10">
              <button
                disabled={similarCurrentPage === 1 || similarLoading}
                onClick={() => dispatch(setSimilarCurrentPage(similarCurrentPage - 1))}
                className="px-6 py-2 rounded-full border border-[#E8456A] text-[#E8456A] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-50 transition-all"
              >
                Previous
              </button>
              <span className="font-bold text-gray-600">
                Page {similarCurrentPage} of {similarTotalPages}
              </span>
              <button
                disabled={similarCurrentPage === similarTotalPages || similarLoading}
                onClick={() => dispatch(setSimilarCurrentPage(similarCurrentPage + 1))}
                className="px-6 py-2 rounded-full border border-[#E8456A] text-[#E8456A] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-50 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </section>

      </div >
    </div >
  );
}
