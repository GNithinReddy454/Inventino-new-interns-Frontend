"use client";

import React, { useState } from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard, { ProductCardProduct } from "@/app/components/ProductCard";
import { useCart } from "@/lib/cartContext";
import Toast from "@/app/components/toast";

// Mock Data for Stories
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

export default function StoriesPage() {
  const [activeStoryId, setActiveStoryId] = useState(MOCK_STORIES[0].id);
  const [toastMessage, setToastMessage] = useState("");
  const { addToCart } = useCart();
  const router = useRouter();

  const activeStory = MOCK_STORIES.find(s => s.id === activeStoryId)!;

  const handleAddToCart = () => {
    addToCart({
      id: activeStory.id + 2000, // Make ID unique
      name: activeStory.title,
      price: 89.99, // default price for story item
      image: activeStory.thumbnail,
      category: "STORY ITEM",
    });
    setToastMessage(`${activeStory.title} has been added to your cart.`);
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
                {MOCK_STORIES.map((story) => {
                  const isActive = activeStoryId === story.id;
                  return (
                    <button
                      key={story.id}
                      onClick={() => setActiveStoryId(story.id)}
                      className="relative flex-shrink-0 group hover:-translate-y-1 transition-transform"
                    >
                      <div className={`w-16 h-16 rounded-full p-[3px] transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-[#E8456A] to-[#ffb1c4]' : 'bg-gray-200 hover:bg-pink-100'}`}>
                        <img
                          src={story.thumbnail}
                          alt={story.artisan}
                          className="w-full h-full object-cover rounded-full border-[3px] border-white"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#E8456A] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md">
                        {story.id}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Main Visual */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 mb-6 flex items-center justify-center shadow-xl">
                <img
                  src={activeStory.image}
                  alt={activeStory.title}
                  className="w-full h-full object-cover rounded-2xl p-6 md:p-10 hue-rotate-0"
                  style={{
                    backgroundColor: "#ebd5c1",
                    objectFit: "cover",
                    boxShadow: "inset 0px 0px 20px rgba(0,0,0,0.5)"
                  }}
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

            {/* Right Column: Descriptions */}
            <div className="w-full lg:w-7/12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">{activeStory.title}</h1>

              <div className="space-y-6 text-gray-600 text-[15px] leading-relaxed">
                <p>
                  Every piece we create carries a unique journey from concept to creation.
                </p>
                <p>
                  {activeStory.description}
                </p>

                {/* Quote Box */}
                <div className="border-l-[3px] border-[#E8456A] pl-5 py-2 my-8 bg-gradient-to-r from-[#E8456A]/10 to-transparent rounded-r-xl p-4">
                  <p className="italic text-gray-800 font-medium mb-3">"{activeStory.quote}"</p>
                  <p className="text-[#E8456A] font-bold text-sm">— {activeStory.artisan}, {activeStory.role}</p>
                </div>

                <p>
                  {activeStory.process}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <button
                  onClick={() => router.push(`/products/${activeStory.id}`)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SIMILAR_PRODUCTS_DATA.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(productName) => setToastMessage(`${productName} has been added to your cart.`)}
              />
            ))}
          </div>
        </section>

      </div >

      {toastMessage && (
        <Toast
          title="Added to Cart"
          message={toastMessage}
          type="success"
          position="bottom-right"
          onClose={() => setToastMessage("")}
        />
      )}
    </div >
  );
}
