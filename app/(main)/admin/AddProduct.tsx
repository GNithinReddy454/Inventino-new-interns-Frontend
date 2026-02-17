"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function AddProduct() {
  const [tags, setTags] = useState(["Handmade", "Rose Gold", "Bracelet"]);
  const [newTag, setNewTag] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ---- LEFT COLUMN: BASIC INFORMATION ---- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Basic Information</h3>
            <p className="text-xs text-gray-400 mb-6">Fill in the basic details of your product</p>
            
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Product Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g., Delicate Rose Bracelet" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D94F7A] focus:ring-1 focus:ring-[#D94F7A] transition-all" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea rows={6} placeholder="Write a detailed description of your product..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D94F7A] focus:ring-1 focus:ring-[#D94F7A] transition-all resize-none" />
                <p className="text-[10px] text-gray-400 mt-2">Minimum 50 characters recommended</p>
              </div>

              {/* Category & Sub-Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] appearance-none cursor-pointer">
                      <option>Select Category</option>
                      <option>Jewelry</option>
                      <option>Accessories</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Sub-Category</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] appearance-none cursor-pointer">
                      <option>Select Sub-Category</option>
                      <option>Bracelets</option>
                      <option>Necklaces</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Tags</label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg min-h-[52px]">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-[#F85178] text-white text-xs font-bold rounded-full shadow-sm">
                      {tag} 
                      <button onClick={() => removeTag(tag)} className="hover:text-pink-100 ml-1"><X size={12} strokeWidth={3} /></button>
                    </span>
                  ))}
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleAddTag} placeholder="Add a tag..." className="flex-1 bg-transparent text-sm min-w-[80px] focus:outline-none px-1 text-gray-700 placeholder-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Press Enter to add tags</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SETTINGS --- */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Publish Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Status</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] appearance-none cursor-pointer">
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Visibility</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] appearance-none cursor-pointer">
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* Toggles */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div onClick={() => setIsFeatured(!isFeatured)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFeatured ? 'bg-[#F85178]' : 'bg-gray-200'}`}>
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>Featured Product</label>
                </div>
                <div className="flex items-center gap-3">
                  <div onClick={() => setReviewsEnabled(!reviewsEnabled)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${reviewsEnabled ? 'bg-[#F85178]' : 'bg-gray-200'}`}>
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${reviewsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setReviewsEnabled(!reviewsEnabled)}>Enable Reviews</label>
                </div>
              </div>
            </div>
          </div>
          {/* Organization */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Vendor/Brand</label>
                <input type="text" placeholder="e.g. Handmade By Sarah" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Collections</label>
                <textarea rows={3} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] transition-all resize-none" placeholder="Search for collections..." />
                <p className="text-[10px] text-gray-400 mt-1">Hold Ctrl to select multiple</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}     