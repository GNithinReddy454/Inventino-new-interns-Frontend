"use client";

import { useState, useRef, MouseEvent, ChangeEvent, FormEvent } from "react";
import { reviewService } from "@/services/review"; // Ensure this service exists
import { useRouter } from "next/navigation";

interface StarProps {
  filled: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function Star({
  filled,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: StarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) =>
        (e.currentTarget.style.transform = "scale(0.92)")
      }
      onMouseUp={(e: MouseEvent<HTMLButtonElement>) =>
        (e.currentTarget.style.transform = "scale(1)")
      }
      className="p-0.5 bg-transparent border-0 cursor-pointer transition-transform duration-150 hover:scale-110"
    >
      <svg
        viewBox="0 0 24 24"
        fill={filled || hovered ? "#FBBF24" : "none"}
        stroke={filled || hovered ? "#FBBF24" : "#D1D5DB"}
        strokeWidth="1.5"
        className="transition-colors duration-150 w-7 h-7 sm:w-8 sm:h-8"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}

interface WriteReviewPageProps {
  productName?: string;
  productId?: string; 
}

export default function WriteReviewPage({
  productName = "Rose Gold Bracelet",
  productId = "PRD-002",
}: WriteReviewPageProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const MAX_CHARS = 1000;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!productId) {
      alert("Product information is missing. Please try again from the orders page.");
      return;
    }

    if (rating === 0) return alert("Please select a star rating.");

    setSubmitting(true);

    try {
      const response = await reviewService.submitReview(productId, {
        rating,
        comment: review,
        ...(photos.length > 0 && { images: photos }),
      });

      if (response.statusCode === 201 || response.status === "success") {
        alert("Review submitted!");
        setRating(0);
        setReview("");
        setPhotos([]);
      } else {
        alert(response.message || "Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("Submit Error:", error.response?.data || error.message || error);
      
      const errorMessage = 
        error.response?.data?.message || 
        "Failed to submit review. Please check your connection.";
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fdf8f9] min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Back button */}
        <button
          onClick={() => router.push("/profile/orders")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">My Orders</span>
        </button>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
          Write a Review
        </h1>
        {productName && (
          <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
            Reviewing:{" "}
            <span className="font-semibold text-gray-600">{productName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-pink-100 px-4 sm:px-8 py-6 sm:py-7">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-4 sm:mb-5">
              Write Your Thoughts
            </p>
            <div className="flex flex-col items-center gap-2.5 py-3">
              <div className="flex gap-1 sm:gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={star <= rating}
                    hovered={star <= hovered && hovered > rating}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                {rating === 0
                  ? "Click to rate this product"
                  : ratingLabels[rating]}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Your Review <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={review}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setReview(e.target.value.slice(0, MAX_CHARS))
                }
                placeholder="Tell us what you think about this product. What did you like or dislike? How was the quality?"
                rows={5}
                required
                className="w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-pink-200 resize-none placeholder:text-gray-300 transition-shadow"
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-gray-300 pointer-events-none select-none">
                {review.length}/{MAX_CHARS} characters
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Add Photos{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            <div
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-pink-100 bg-white px-4 py-8 sm:py-10 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-pink-50/40 transition-colors"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.8"
                  className="w-6 h-6 sm:w-[26px] sm:h-[26px]"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-gray-600 text-center">
                Upload Product Photos
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 text-center">
                Share photos of the product you received
              </p>

              <button
                type="button"
                className="mt-1 px-5 py-2 rounded-lg bg-[#D94F7A] text-white text-xs font-semibold hover:bg-[#C0426A] active:scale-95 transition-all border-0 cursor-pointer"
              >
                Choose Photos
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {photos.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-pink-100 shrink-0"
                  >
                    <img
                      src={src}
                      alt={`upload-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((p) => p.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[10px] hover:bg-red-500 transition-colors border-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              className="h-11 sm:h-12 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="h-11 sm:h-12 rounded-xl bg-[#D94F7A] text-white text-xs sm:text-sm font-bold hover:bg-[#C0426A] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest border-0 cursor-pointer"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}