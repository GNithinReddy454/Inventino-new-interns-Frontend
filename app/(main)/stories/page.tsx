"use client";

import React, { useState, useRef } from "react";
import { ShoppingCart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard, { ProductCardProduct } from "@/app/components/ProductCard";
import { useCart } from "@/lib/cartContext";
import Toast from "@/app/components/toast";

const MOCK_STORIES = [
  {
    id: 1,
    artisan: "Sarah Anderson",
    role: "Master Artisan",
    title: "The Story Behind This Treasure",
    description: "Every piece we create carries a unique journey from concept to creation. This beautiful rose gold bracelet is the result of over 20 years of craftsmanship perfected by Sarah Anderson, a third-generation jewelry maker from our artisan community. Each bracelet takes approximately 8 hours to create, with every detail carefully considered and executed. Sarah learned the art of jewelry making from her grandmother, who passed down traditional techniques that have been refined over generations. She sources the finest materials and uses both traditional hand tools and modern precision techniques to create pieces that are both timeless and contemporary.",
    quote: "Every piece I create is infused with love and intention. I want the wearer to feel special and confident, knowing they're wearing something truly unique that was made just for them.",
    process: "The rose gold plating process uses a special technique that ensures durability and a lasting shine. Each bracelet is individually inspected and polished by hand before being carefully packaged in a handmade gift box, making it perfect for gifting or keeping as a personal treasure.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&auto=format&fit=crop",
  },
  {
    id: 2,
    artisan: "Michael Chen",
    role: "Lead Designer",
    title: "Crafting the Silver Elegance",
    description: "Our signature silver collection embodies minimalist beauty intertwined with complex geometric patterns. Michael's approach brings architectural elements into fine jewelry.",
    quote: "Minimalism isn't about lacking detail, it's about perfect proportion.",
    process: "Using ethically sourced silver, each piece is cast in custom molds designed from 3D architectural models, ensuring pristine geometric precision.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&auto=format&fit=crop",
  },
  {
    id: 3,
    artisan: "Elena Rodriguez",
    role: "Gemologist",
    title: "A Touch of Emerald",
    description: "Finding the perfect gemstone is like discovering a new star. Elena travels the globe to hand-select emeralds that have a specific vibrant hue that matches our brand's exacting standards.",
    quote: "The stone speaks to you if you look closely enough. We only select gems with a vibrant, inner fire.",
    process: "Each emerald is inspected under varying light conditions and meticulously cut to maximize its natural brilliance without compromising its structural integrity.",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=100&auto=format&fit=crop",
  },
  {
    id: 4,
    artisan: "David Smith",
    role: "Silversmith",
    title: "The Forged Link",
    description: "Creating a chain that sits perfectly on the collarbone requires understanding human anatomy as well as metallurgy. David's chains are known for their fluid, silk-like drape.",
    quote: "A good chain should feel like it was woven from liquid metal.",
    process: "Links are individually soldered and then drawn through decreasing polished dies to achieve the perfect tensile strength and comfort.",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7f32e92?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1599643478524-fb66f7f32e92?w=100&auto=format&fit=crop",
  },
  {
    id: 5,
    artisan: "Aisha Patel",
    role: "Enamel Artist",
    title: "Vibrant Colours",
    description: "Bringing color into fine jewelry requires a steady hand and a keen eye. Aisha's cloissoné work is unparalleled, using traditional firing techniques that result in vivid, fade-resistant wearable art.",
    quote: "Color is emotion. I try to paint feelings onto gold.",
    process: "The enamel is layered thinly and fired up to 15 times to achieve the depth of color that makes our pieces stand out.",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=100&auto=format&fit=crop",
  }
];

const PROCESS_STEPS = [
  {
    id: "01",
    title: "Design & Concept",
    description: "Each design begins with sketches inspired by culture, art, and emotion. Sarah carefully plans every curve and detail.",
  },
  {
    id: "02",
    title: "Handcrafting",
    description: "Using traditional techniques and modern tools, each piece is meticulously shaped, refined, and polished by hand over 6 hours.",
  },
  {
    id: "03",
    title: "Quality Check",
    description: "Every bracelet undergoes rigorous quality inspection and is personally approved by Sarah before reaching you.",
  }
];

const SIMILAR_PRODUCTS_DATA: ProductCardProduct[] = [
  {
    id: 101,
    name: "Delicate Rose Gold Chain Bracelet",
    price: 34.99,
    category: "BRACELETS",
    rating: 4.7,
    reviews: 152,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
    badge: "NEW",
    tags: ["Rose Gold", "Adjustable"],
    description: "Handcrafted with natural threads passed down through generations",
  },
  {
    id: 102,
    name: "Knitted Bag Bracelet",
    price: 34.99,
    category: "BRACELETS",
    rating: 4.5,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    badge: "NEW",
    tags: ["Pink Gold", "Adjustable"],
    description: "Handcrafted with natural threads passed down through generations",
  },
  {
    id: 103,
    name: "Frame Set Bracelet",
    price: 34.99,
    category: "BRACELETS",
    rating: 4.8,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400",
    badge: "BESTSELLER",
    tags: ["Rose Gold", "Adjustable"],
    description: "Handcrafted with natural threads passed down through generations",
  },
  {
    id: 104,
    name: "Frame Set Chain Product",
    price: 34.99,
    category: "BRACELETS",
    rating: 4.9,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1599643478524-fb66f7f32e92?w=400",
    badge: "BESTSELLER",
    tags: ["Pink Gold", "Adjustable"],
    description: "Handcrafted with natural threads passed down through generations",
  }
];

function ProcessStepCard({ step }: { step: typeof PROCESS_STEPS[0] }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-pink-100 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-pink-100/60 hover:border-pink-200 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-full bg-[#E8456A] text-white flex items-center justify-center text-lg font-black mb-6 shadow-[0_0_20px_rgba(232,69,106,0.5)]">
        {step.id}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
      <p className="text-gray-600 text-[14px] leading-relaxed">{step.description}</p>
    </div>
  );
}

export default function StoriesPage() {
  const [activeStoryId, setActiveStoryId] = useState(MOCK_STORIES[0].id);
  const [toastMessage, setToastMessage] = useState("");
  const { addToCart } = useCart();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);

  const activeStory = MOCK_STORIES.find(s => s.id === activeStoryId)!;
  const activeIndex = MOCK_STORIES.findIndex(s => s.id === activeStoryId);

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + MOCK_STORIES.length) % MOCK_STORIES.length;
    setActiveStoryId(MOCK_STORIES[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % MOCK_STORIES.length;
    setActiveStoryId(MOCK_STORIES[nextIndex].id);
  };

  const handleAddToCart = () => {
    addToCart({
      id: activeStory.id + 2000,
      name: activeStory.title,
      price: 89.99,
      image: activeStory.thumbnail,
      category: "STORY ITEM",
    });
    setToastMessage(`${activeStory.title} has been added to your cart.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 pb-6 pt-2 md:px-12 md:pb-12 md:pt-4 lg:px-20 lg:pb-20 lg:pt-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Top Stories Section */}
        <section>
          <h2 className="text-3xl font-bold text-[#E8456A] mb-8">Top Stories</h2>

          <div className="bg-white rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-14 border border-pink-100 shadow-xl shadow-pink-100/30">

            {/* Left Column */}
            <div className="w-full lg:w-5/12 flex flex-col">

              {/* Story Circles with Prev/Next Arrows */}
              <div className="flex items-center gap-2 mb-8">
                <button
                  onClick={handlePrev}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8456A] text-white flex items-center justify-center shadow-md hover:bg-[#c73a5a] transition-colors active:scale-95"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>

                <div
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide flex-1 py-2 px-1"
                >
                  {MOCK_STORIES.map((story) => {
                    const isActive = activeStoryId === story.id;
                    return (
                      <button
                        key={story.id}
                        onClick={() => setActiveStoryId(story.id)}
                        className="relative flex-shrink-0 hover:-translate-y-1 transition-transform"
                      >
                        <div
                          className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            padding: "3px",
                            background: isActive
                              ? "linear-gradient(135deg, #FFD700, #FFEC00, #FFC200, #FFD700)"
                              : "linear-gradient(135deg, #f9a8c0, #E8456A, #f472b6)",
                            boxShadow: isActive
                              ? "0 0 12px 3px rgba(255, 215, 0, 0.75)"
                              : "none",
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-white p-[2px]">
                            <img
                              src={story.thumbnail}
                              alt={story.artisan}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-[20px] h-[20px] bg-[#E8456A] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md">
                          {story.id}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNext}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8456A] text-white flex items-center justify-center shadow-md hover:bg-[#c73a5a] transition-colors active:scale-95"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>

              {/* Main Image */}
              <div
                className="relative w-full rounded-3xl overflow-hidden mb-6 shadow-lg"
                style={{ backgroundColor: "#f0d9c8", aspectRatio: "4/3" }}
              >
                <img
                  src={activeStory.image}
                  alt={activeStory.title}
                  className="w-full h-full object-cover"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>

              {/* Artisan Identifier */}
              <div className="inline-flex items-center gap-3 bg-[#E8456A]/10 border border-[#E8456A]/30 rounded-full py-2 px-4 w-fit shadow-lg shadow-[#E8456A]/5">
                <div className="w-9 h-9 rounded-full bg-[#E8456A] text-white flex items-center justify-center font-bold text-sm">
                  {activeStory.artisan.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-gray-900 text-[13px] font-bold tracking-wide">{activeStory.artisan}</span>
                  <span className="text-[#E8456A] text-[11px] font-medium">{activeStory.role}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-7/12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">{activeStory.title}</h1>

              <div className="space-y-6 text-gray-600 text-[15px] leading-relaxed">
                <p>Every piece we create carries a unique journey from concept to creation.</p>
                <p>{activeStory.description}</p>

                <div className="border-l-[3px] border-[#E8456A] pl-5 py-2 my-8 bg-gradient-to-r from-[#E8456A]/10 to-transparent rounded-r-xl p-4">
                  <p className="italic text-gray-800 font-medium mb-3">"{activeStory.quote}"</p>
                  <p className="text-[#E8456A] font-bold text-sm">— {activeStory.artisan}, {activeStory.role}</p>
                </div>

                <p>{activeStory.process}</p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <button
                  onClick={() => router.push(`/products/${activeStory.id}`)}
                  className="flex-1 sm:max-w-[200px] flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #f472a0 0%, #E8456A 50%, #e05580 100%)",
                    boxShadow: "0 4px 20px rgba(232,69,106,0.4)",
                  }}
                >
                  <ShoppingBag size={18} strokeWidth={2.5} />
                  Buy Now
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 sm:max-w-[200px] flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[#E8456A] bg-transparent transition-all hover:bg-pink-50 active:scale-95"
                  style={{ border: "2px solid #E8456A" }}
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Creation Process Section */}
        <section>
          <h2 className="text-2xl font-bold text-[#E8456A] mb-8">Our Creation Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROCESS_STEPS.map((step) => (
              <ProcessStepCard key={step.id} step={step} />
            ))}
          </div>
        </section>

        {/* Similar Products Section */}
        <section className="group/similar">
          <h2 className="text-2xl font-bold text-[#E8456A] mb-8">Similar Products</h2>
          
          <div className="relative flex items-center">
            {/* Navigation Button Left */}
            <button
              onClick={() => similarScrollRef.current?.scrollBy({ left: -similarScrollRef.current.offsetWidth, behavior: "smooth" })}
              className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-xl rounded-full border border-gray-100 text-gray-800 hover:bg-[#E8456A] hover:text-white transition-all flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover/similar:opacity-100"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
            >
              <ChevronLeft size={24} className="md:w-6 md:h-6" />
            </button>

            {/* Scrollable Row */}
            <div
              ref={similarScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide py-2 no-scrollbar scroll-smooth w-full"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {SIMILAR_PRODUCTS_DATA.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-full md:w-[calc(25%-1.25rem)] snap-start flex justify-center"
                >
                  <div className="w-full">
                    <ProductCard
                      product={product}
                      onAdd={(productName) => setToastMessage(`${productName} has been added to your cart.`)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Button Right */}
            <button
              onClick={() => similarScrollRef.current?.scrollBy({ left: similarScrollRef.current.offsetWidth, behavior: "smooth" })}
              className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 bg-white shadow-xl rounded-full border border-gray-100 text-gray-800 hover:bg-[#E8456A] hover:text-white transition-all flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover/similar:opacity-100"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
            >
              <ChevronRight size={24} className="md:w-6 md:h-6" />
            </button>
          </div>
        </section>

      </div>

      {toastMessage && (
        <Toast
          title="Added to Cart"
          message={toastMessage}
          type="success"
          position="bottom-right"
          onClose={() => setToastMessage("")}
        />
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