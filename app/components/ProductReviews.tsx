"use client";

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, User } from "lucide-react";
import Toast from "./toast";

// --- MOCK DATA ---
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Sarah Miller",
    date: "January 15, 2026",
    rating: 5,
    title: "Absolutely Beautiful!",
    content: "This bracelet exceeded all my expectations! The craftsmanship is incredible, and you can tell it was made with love. The rose gold finish is stunning.",
    verified: true,
    helpful: 24,
    images: ["#E0BFB8", "#C0C0C0"] // Colors or Image URLs
  },
  {
    id: 2,
    author: "Emily Brown",
    date: "January 10, 2026",
    rating: 5,
    title: "Perfect Gift!",
    content: "I bought this as a gift for my best friend and she absolutely loves it! The packaging was beautiful and the quality is outstanding.",
    verified: true,
    helpful: 10,
    images: []
  },
  {
    id: 3,
    author: "Michael Wilson",
    date: "December 28, 2025",
    rating: 4,
    title: "Wife Loves It!",
    content: "Purchased this for my wife's birthday. The quality is exceptional, though shipping took a day longer than expected.",
    verified: true,
    helpful: 15,
    images: []
  }
];

export default function ProductReviews({ 
  isLoggedIn = false,    
  hasPurchased = false   
}: { 
  isLoggedIn?: boolean, 
  hasPurchased?: boolean 
}) {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [visibleReviews, setVisibleReviews] = useState(3);

  // ADD TOAST STATE
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form State (Kept for logic stability but UI removed)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      author: name || "Anonymous",
      date: new Date().toLocaleDateString(),
      rating,
      title,
      content,
      verified: true,
      helpful: 0,
      images: []
    };
    setReviews([newReview, ...reviews]);
    setRating(0); setTitle(""); setContent(""); setName("");
    setShowSuccessToast(true);
  };

  return (
    <div className="bg-white py-16 border-t border-gray-100 relative">

      {showSuccessToast && (
        <Toast 
          title="Success!" 
          message="Review submitted successfully" 
          type="success"
          onClose={() => setShowSuccessToast(false)} 
        />
      )}  

      <div className="max-w-6xl mx-auto px-4">
        
        {/* HEADER */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-pink-500 mb-2">Customer Reviews</h2>
          <p className="text-gray-500 text-sm">See what our customers are saying about this product</p>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-pink-50/50 rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-center">
           <div className="text-center md:text-left min-w-[200px]">
              <div className="text-6xl font-bold text-pink-500 mb-2">4.9</div>
              <div className="flex justify-center md:justify-start gap-1 text-yellow-400 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="currentColor" />)}
              </div>
              <p className="text-sm text-gray-500">Based on 128 reviews</p>
           </div>

           {/* Progress Bars */}
           <div className="flex-1 w-full space-y-2">
              {[
                { s: 5, w: "85%", c: 109 },
                { s: 4, w: "10%", c: 13 },
                { s: 3, w: "3%", c: 4 },
                { s: 2, w: "1%", c: 1 },
                { s: 1, w: "1%", c: 1 }
              ].map((r) => (
                <div key={r.s} className="flex items-center gap-3 text-xs">
                   <span className="font-bold w-3">{r.s}</span>
                   <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: r.w }}></div>
                   </div>
                   <span className="text-gray-400 w-6 text-right">{r.c}</span>
                </div>
              ))}
           </div>
        </div>

        {/* WRITE REVIEW FORM & LOGIN PROMPT REMOVED FROM HERE */}

        {/* REVIEW LIST */}
        <div className="grid md:grid-cols-2 gap-6">
           {reviews.slice(0, visibleReviews).map((review) => (
             <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-sm">
                         {review.author.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-gray-900">{review.author}</h4>
                         <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                   </div>
                   <div className="flex text-yellow-400 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-200"} />)}
                   </div>
                </div>

                {review.verified && (
                   <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit mb-3">
                     <CheckCircle size={10} /> Verified Purchase
                   </div>
                )}

                <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{review.content}</p>

                {/* Color Swatches (if any) */}
                {review.images.length > 0 && (
                   <div className="flex gap-2 mb-4">
                      {review.images.map((img, i) => (
                         <div key={i} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: img }}></div>
                      ))}
                   </div>
                )}

                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-pink-500 mt-auto">
                   <ThumbsUp size={14} /> Helpful ({review.helpful})
                </button>
             </div>
           ))}
        </div>
        
        {visibleReviews < reviews.length && (
           <div className="text-center mt-12">
              <button onClick={() => setVisibleReviews(prev => prev + 2)} className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors">Load More Reviews</button>
           </div>
        )}

      </div>
    </div>
  );
}