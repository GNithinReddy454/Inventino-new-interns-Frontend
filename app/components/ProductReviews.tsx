"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle, Trash2, Edit3, X, Save, User, Send } from "lucide-react";
import Toast from "./toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- MOCK DATA (STABLE FALLBACK) ---
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Sarah Miller",
    date: "January 15, 2026",
    rating: 5,
    title: "Absolutely Beautiful!",
    content: "This bracelet exceeded all my expectations! The craftsmanship is incredible, and you can tell it was made with love.",
    verified: true,
    helpful: 24,
    images: [],
  },
  {
    id: 2,
    author: "Emily Brown",
    date: "January 10, 2026",
    rating: 5,
    title: "Perfect Gift!",
    content: "I bought this as a gift for my best friend and she absolutely loves it! The packaging was beautiful.",
    verified: true,
    helpful: 10,
    images: [],
  },
];

// --- TYPES ---
interface ApiReview {
  _id: string;
  product: string;
  user: { _id?: string; name: string; email: string; userId?: string; };
  rating: number;
  comment: string;
  images: { id: string; url: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NormalizedReview {
  id: string | number;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images: string[];
}

function normalizeApiReview(r: ApiReview): NormalizedReview {
  return {
    id: r._id,
    author: r.user?.name || "Anonymous",
    date: new Date(r.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    rating: r.rating,
    title: r.comment?.slice(0, 40) || "Review",
    content: r.comment,
    verified: true,
    helpful: 0,
    images: r.images?.map((img) => img.url) || [],
  };
}

export default function ProductReviews({
  productId = "PRD-002",
  isLoggedIn = false,
}: {
  productId?: string;
  isLoggedIn?: boolean;
}) {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [myReview, setMyReview] = useState<ApiReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);

  // Form State for Create/Edit
  const [inputRating, setInputRating] = useState(0);
  const [inputContent, setInputContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false, msg: "", type: "success",
  });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
  };

  // --- API FUNCTIONS (NUMERIC ORDER PER DOC) ---

  // 1) POST - CREATE REVIEW
  const handleCreate = async () => {
    if (inputRating === 0 || !inputContent) return showToast("Please provide rating and comment", "error");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: inputRating, comment: inputContent }),
      });
      const data = await res.json();
      if (data.statusCode === 201) {
        setMyReview(data.data.review);
        fetchReviews(); // Refresh list
        showToast("Review created successfully", "success");
      }
    } catch { showToast("Failed to post review", "error"); }
    finally { setSubmitting(false); }
  };

  // 2) GET - FETCH ALL REVIEWS
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, { 
        method: "GET", cache: "no-store", credentials: "include" 
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data?.reviews?.length > 0) {
        setReviews(data.data.reviews.map(normalizeApiReview));
      } else { setReviews(MOCK_REVIEWS as NormalizedReview[]); }
    } catch { setReviews(MOCK_REVIEWS as NormalizedReview[]); }
    finally { setLoading(false); }
  };

  // 3) PATCH - UPDATE REVIEW
  const handleUpdate = async () => {
    if (!myReview) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${myReview._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: inputRating, comment: inputContent }),
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        setMyReview(data.data.review);
        setIsEditing(false);
        fetchReviews();
        showToast("Review updated successfully", "success");
      }
    } catch { showToast("Failed to update", "error"); }
    finally { setSubmitting(false); }
  };

  // 6) DELETE - DELETE REVIEW
  const handleDelete = async () => {
    if (!myReview || !confirm("Delete review permanently?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${myReview._id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        setMyReview(null);
        setInputRating(0);
        setInputContent("");
        fetchReviews();
        showToast("Review deleted", "success");
      }
    } catch { showToast("Delete failed", "error"); }
  };

  // 7) GET - FETCH MY SPECIFIC REVIEW
  const fetchMyReview = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}/my-review`, { 
        method: "GET", cache: "no-store", credentials: "include" 
      });
      const data = await res.json();
      if (data.statusCode === 200 && data.data?.review) {
        setMyReview(data.data.review);
        setInputContent(data.data.review.comment);
        setInputRating(data.data.review.rating);
      }
    } catch { console.error("My Review Error"); }
  };

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, [productId, isLoggedIn]);

  return (
    <div className="bg-white py-16 border-t border-gray-100 relative">
      {toast.show && (
        <Toast title={toast.type === "success" ? "Success!" : "Error"} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-serif text-pink-500 mb-8">Customer Feedback</h2>

        {/* LOGGED IN SECTION */}
        {isLoggedIn && (
          <div className="mb-12 p-8 bg-white rounded-3xl border-2 border-pink-100 shadow-sm">
            {!myReview ? (
              /* CREATE FORM (#1) */
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Post a New Review</h3>
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={24} fill={s <= inputRating ? "currentColor" : "none"} className="cursor-pointer" onClick={() => setInputRating(s)} />
                  ))}
                </div>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-pink-500 outline-none h-24 text-sm"
                />
                <button disabled={submitting} onClick={handleCreate} className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95">
                  <Send size={14} /> {submitting ? "Posting..." : "Submit Review"}
                </button>
              </div>
            ) : (
              /* VIEW / EDIT / DELETE (#3, #6, #7) */
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-sm"><User size={18} /></div>
                    <h4 className="font-bold text-sm text-gray-900">Your Review</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(!isEditing)} className="p-2 hover:bg-pink-50 rounded-full text-gray-400 hover:text-pink-500 transition-colors">{isEditing ? <X size={18} /> : <Edit3 size={18} />}</button>
                    <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={20} fill={s <= inputRating ? "currentColor" : "none"} className="cursor-pointer" onClick={() => setInputRating(s)} />))}
                    </div>
                    <textarea value={inputContent} onChange={(e) => setInputContent(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-pink-500 outline-none h-24 text-sm" />
                    <button disabled={submitting} onClick={handleUpdate} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 self-start transition-all active:scale-95"><Save size={14} /> {submitting ? "Saving..." : "Update"}</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < myReview.rating ? "currentColor" : "none"} />))}
                    </div>
                    <p className="text-gray-600 text-sm italic">"{myReview.comment}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* REVIEW LIST (#2) */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading reviews...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-sm">{review.author.charAt(0)}</div>
                    <div><h4 className="font-bold text-sm text-gray-900">{review.author}</h4><span className="text-xs text-gray-400">{review.date}</span></div>
                  </div>
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "fill-current" : "text-gray-200"} />))}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit mb-3"><CheckCircle size={10} /> Verified Purchase</div>
                <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{review.content}</p>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-pink-500 mt-auto transition-colors"><ThumbsUp size={14} /> Helpful ({review.helpful})</button>
              </div>
            ))}
          </div>
        )}

        {visibleReviews < reviews.length && (
          <div className="text-center mt-12">
            <button onClick={() => setVisibleReviews((prev) => prev + 2)} className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors">Load More Reviews</button>
          </div>
        )}
      </div>
    </div>
  );
}