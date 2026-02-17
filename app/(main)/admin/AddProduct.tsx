"use client";

import { useState } from "react";
import { ChevronDown, X, Eye, Upload } from "lucide-react";

export default function AddProduct() {
  const [tags, setTags] = useState(["Handmade", "Rose Gold", "Bracelet"]);
  const [newTag, setNewTag] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);

  // --- NEW STATES FOR IMAGE 2 SECTION ---
  const [freeShipping, setFreeShipping] = useState(true);
  const [selectedColor, setSelectedColor] = useState("rose");

  // --- NEW STATES FOR IMAGE 3 (STORY) SECTION ---
  const [displayStory, setDisplayStory] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showQuote, setShowQuote] = useState(true);

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
    <div className="max-w-6xl mx-auto font-sans pb-20">
      {/* --- SECTION 1 (YOUR ORIGINAL CODE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* --- LEFT COLUMN: BASIC INFORMATION --- */}
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

      {/* --- SECTION 2 (PRICING, VARIANTS, SHIPPING, SEO) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pricing & Inventory</h3>
            <p className="text-xs text-gray-400 mb-6">Set your product pricing and stock details</p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Regular Price <span className="text-red-500">*</span></label>
                  <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input type="text" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Sale Price</label>
                  <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input type="text" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" /></div>
                  <p className="text-[10px] text-gray-400 mt-2">Leave empty for no sale</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-xs font-bold text-gray-800 mb-2">SKU</label><input type="text" placeholder="SKU-001" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-800 mb-2">Stock Quantity <span className="text-red-500">*</span></label><input type="text" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm" /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Stock Status <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer"><option>In Stock</option><option>Out of Stock</option></select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Product Variants</h3>
            <p className="text-xs text-gray-400 mb-6">Add color and size options for your product</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-3">Available Colors</label>
                <div className="flex gap-3">
                  {['rose', 'silver', 'gold', 'black', 'white', 'pink'].map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-[#D94F7A]' : 'border-transparent'}`}>
                      <div className={`w-7 h-7 rounded-md ${color === 'rose' ? 'bg-[#E3A69C]' : color === 'silver' ? 'bg-[#C0C0C0]' : color === 'gold' ? 'bg-[#FFD700]' : color === 'black' ? 'bg-[#000000]' : color === 'white' ? 'bg-white border border-gray-200' : 'bg-[#F85178]'}`}></div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-3">Sizes</label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg min-h-[52px]">
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-[#F85178] text-white text-xs font-bold rounded-full shadow-sm">Small <X size={12} strokeWidth={3} /></span>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-[#F85178] text-white text-xs font-bold rounded-full shadow-sm">Medium <X size={12} strokeWidth={3} /></span>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-[#F85178] text-white text-xs font-bold rounded-full shadow-sm">Large <X size={12} strokeWidth={3} /></span>
                    <input type="text" placeholder="Add a size..." className="flex-1 bg-transparent text-sm focus:outline-none px-1 text-gray-700 placeholder-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Shipping</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-800 mb-2">Weight (kg)</label><input type="text" placeholder="0.00" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-800 mb-2">Length (cm)</label><input type="text" placeholder="0" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-gray-800 mb-2">Width (cm)</label><input type="text" placeholder="0" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-800 mb-2">Height (cm)</label><input type="text" placeholder="0" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" /></div>
              <div className="flex items-center gap-3 pt-2">
                <div onClick={() => setFreeShipping(!freeShipping)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${freeShipping ? 'bg-[#F85178]' : 'bg-gray-200'}`}><div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${freeShipping ? 'translate-x-5' : 'translate-x-0'}`} /></div>
                <label className="text-sm font-medium text-gray-700 cursor-pointer">Free Shipping</label>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">SEO</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-800 mb-2">Meta Title</label><input type="text" placeholder="Product meta title" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" /><p className="text-[10px] text-gray-400 mt-2">0/60 characters</p></div>
              <div><label className="block text-xs font-bold text-gray-800 mb-2">Meta Description</label><textarea rows={3} placeholder="Product meta description" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm resize-none" /><p className="text-[10px] text-gray-400 mt-2">0/160 characters</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3 (STORY & ARTISAN DETAILS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* LEFT COLUMN: STORY DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Story Header</h3>
            <p className="text-xs text-gray-400 mb-6">Main title for the story section</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Story Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="The Story Behind This Treasure" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D94F7A] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Story Content <span className="text-red-500">*</span></label>
                <textarea rows={5} placeholder="This beautiful rose gold bracelet is the result of..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D94F7A] transition-all resize-none" />
                <p className="text-[10px] text-gray-400 mt-2 text-right">Minimum 50 characters recommended</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Artisan Quote</h3>
            <p className="text-xs text-gray-400 mb-6">Featured quote from the artisan (optional but recommended)</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Quote Text</label>
                <textarea rows={4} placeholder="Every piece I create is infused with love..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#D94F7A] transition-all resize-none" />
                <p className="text-[10px] text-gray-400 mt-2 text-right">Minimum 50 characters recommended</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Quote Author</label>
                <input type="text" placeholder="Sarah Anderson, Master Artisan" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#D94F7A] transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Artisan Information</h3>
            <p className="text-xs text-gray-400 mb-6">Details about the maker of this product</p>
            <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F85178] text-white flex items-center justify-center rounded-full text-xs font-black">01</div>
                <span className="font-bold text-gray-800 text-sm">Step 1</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Step Title</label>
                <input type="text" placeholder="Design & Concept" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Step Description</label>
                <textarea rows={3} placeholder="Each design begins with sketches..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm resize-none" />
              </div>
            </div>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-pink-200 text-[#F85178] rounded-xl text-xs font-bold hover:bg-pink-50 transition-all uppercase tracking-widest">
              + Add Another Step
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: STORY SETTINGS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Link to Product</h3>
            <label className="block text-xs font-bold text-gray-800 mb-2">Select Product <span className="text-red-500">*</span></label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer"><option>Delicate Rose Gold Bracelet</option></select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* ADDED SPACING BELOW USING 'mt-12' OR EXTRA WRAPPER SPACE */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-12">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Story Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Display Story on Product Page", state: displayStory, fn: setDisplayStory },
                { label: "Show Artisan Badge", state: showBadge, fn: setShowBadge },
                { label: "Show Timeline Section", state: showTimeline, fn: setShowTimeline },
                { label: "Show Quote Section", state: showQuote, fn: setShowQuote }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div onClick={() => item.fn(!item.state)} className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${item.state ? 'bg-[#F85178]' : 'bg-gray-200'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${item.state ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <label className="text-xs font-medium text-gray-700 cursor-pointer">{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Preview & Publish</h3>
            <button className="w-full py-4 border border-pink-200 text-[#F85178] rounded-xl text-xs font-bold bg-pink-50/30 flex items-center justify-center gap-2 hover:bg-pink-50 transition-all mb-3 shadow-sm shadow-pink-100">
              <Eye size={16} strokeWidth={2.5} /> Preview Story
            </button>
            <p className="text-[10px] text-gray-400 text-center italic">See how your story will look on the product page</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Tags & Keywords</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Story Tags</label>
                <input type="text" placeholder="handmade, artisan, jewelry" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#D94F7A] outline-none" />
                <p className="text-[10px] text-gray-400 mt-1">Separate tags with commas</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Featured Story</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none outline-none"><option>No</option><option>Yes</option></select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 4 (PRODUCT IMAGES - NEW SECTION) --- */}
      <div className="w-full mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Product Images</h3>
          <p className="text-xs text-gray-400 mb-8">Upload high-quality images of your product</p>
          
          <div className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="text-[#F85178]" size={24} />
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1">Drag & drop images here</p>
            <p className="text-xs text-gray-400 mb-6">or click to browse</p>
            <button className="bg-[#F85178] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm shadow-pink-100">
              Choose Files
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            {/* Mock Thumbnail Previews */}
            <div className="w-24 h-24 bg-[#D6A681] rounded-xl"></div>
            <div className="w-24 h-24 bg-[#769383] rounded-xl"></div>
            <div className="w-24 h-24 bg-[#F2D694] rounded-xl"></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic">Upload up to 10 images. First image will be the main product image.</p>
        </div>

        {/* Global Bottom Actions */}
        <div className="flex gap-6 mt-12 justify-center">
          <button className="w-full max-w-xs py-4 border-2 border-pink-200 text-[#F85178] rounded-2xl text-sm font-bold bg-white hover:bg-pink-50 transition-all">
            Preview
          </button>
          <button className="w-full max-w-xs py-4 bg-[#F85178] text-white rounded-2xl text-sm font-bold shadow-lg shadow-pink-100 hover:bg-[#D94F7A] transition-all">
            Publish Product
          </button>
        </div>
      </div>
    </div>
  );
}