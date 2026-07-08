"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard, { ProductCardProduct } from "@/app/components/ProductCard";
import { useCart } from "@/lib/cartContext";
import { useAppDispatch } from "@/redux/store";
import { addToCart as reduxAddToCart } from "@/redux/cartslice";
import { useAuth } from "@/app/(main)/components/authContext";
import Toast from "@/app/components/toast";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import axios from "axios";

// Story interface based on your backend response
interface ProductStory {
  story: string;
  storyMedia: string;
  productId: string;
  productName: string;
}

interface StoryCard {
  id: number;
  artisan: string;
  role: string;
  title: string;
  description: string;
  quote: string;
  process: string;
  image: string;
  thumbnail: string;
  productId: string;
}

// Real product stories from the database
const MOCK_STORIES: StoryCard[] = [
  {
    id: 1,
    artisan: "Inventino Artisan",
    role: "Master Craftsperson",
    title: "Luxury Pearl Bracelet",
    description: "A premium bracelet crafted with elegant pearls. Each pearl is hand-selected for its lustrous sheen and perfectly round shape. Our artisans string them with precision, creating a piece that exudes sophistication and timeless beauty. This bracelet is designed for those who appreciate the finer things in life — a true statement of refined elegance.",
    quote: "Every pearl tells a story of patience and nature's artistry. We honour that story by giving it a setting worthy of its beauty.",
    process: "Each pearl is carefully inspected under natural light, sorted by size, colour, and lustre. The stringing is done by hand using silk thread with knots between each pearl for security and a luxurious drape.",
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776710093371-12a1743c47351928e1719ac9d7fb601d.jpg",
    thumbnail: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776710093371-12a1743c47351928e1719ac9d7fb601d.jpg",
    productId: "69e67009da47f4fc8d76dd82",
  },
  {
    id: 2,
    artisan: "Inventino Artisan",
    role: "Pearl Specialist",
    title: "2 in 1 Pearl Wrap",
    description: "Wear it as a necklace or bracelet and style it your way with a scarf. Transform your look in seconds. This versatile piece adapts to your mood and outfit, offering two stunning looks in one exquisite design. The delicate pearls catch the light beautifully, adding a touch of glamour to any occasion.",
    quote: "Versatility meets elegance — one piece, endless possibilities.",
    process: "The wrap design is carefully engineered to maintain its shape whether worn as a bracelet or a necklace. Each pearl is double-knotted for durability, and the clasp is designed for effortless transitions between styles.",
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089766730-8e8c1d1d1f2115696dbef15617ab30e5.jpeg",
    thumbnail: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089766730-8e8c1d1d1f2115696dbef15617ab30e5.jpeg",
    productId: "69dcfaa6f9d9a4f6dbcc521e",
  },
  {
    id: 3,
    artisan: "Inventino Artisan",
    role: "Jewellery Designer",
    title: "Pearl Crystal Wrap — 2 in 1",
    description: "A statement of refined elegance, this wrap bracelet features luminous pearls paired with faceted multi-coloured crystals. The combination creates a dazzling interplay of light and texture, making it perfect for both everyday wear and special occasions.",
    quote: "When pearls meet crystals, magic happens — a harmony of nature and artistry.",
    process: "Faceted crystals are individually selected to complement the natural lustre of each pearl. The alternating pattern is hand-threaded on reinforced wire for a fluid, comfortable wrap that moulds to your wrist.",
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089130220-47717ba256554b141d1a4d39bc47a6ee.jpeg",
    thumbnail: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089130220-47717ba256554b141d1a4d39bc47a6ee.jpeg",
    productId: "69dcf829f9d9a4f6dbcc50eb",
  },
  {
    id: 4,
    artisan: "Inventino Artisan",
    role: "Accessory Artisan",
    title: "Elegant Pearl Wrap Bracelet",
    description: "Delicate, timeless, and effortlessly chic. This pearl wrap bracelet is designed to elevate your everyday look with understated luxury. The minimalist design lets the natural beauty of the pearls take centre stage.",
    quote: "Simplicity is the ultimate sophistication — let the pearls speak for themselves.",
    process: "Using only the finest freshwater pearls, this bracelet is assembled with meticulous attention to spacing and symmetry. The flexible wrap design ensures a comfortable fit on any wrist size.",
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776067965389-978b176690930debcf28ad5bae1dfdbf.jpeg",
    thumbnail: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776067965389-978b176690930debcf28ad5bae1dfdbf.jpeg",
    productId: "69dca57d6ce90847b9b81ab7",
  },
  {
    id: 5,
    artisan: "Inventino Artisan",
    role: "Gold Specialist",
    title: "Guruvayoorappan Bracelet",
    description: "This is a 22k gold locket bracelet inspired by the divine Guruvayoorappan. A sacred piece that blends devotion with fine craftsmanship. The rich gold finish and intricate detailing make it a treasured keepsake for those who carry their faith close to their heart.",
    quote: "Faith and craftsmanship woven together — a bracelet that carries blessings.",
    process: "The 22k gold is carefully moulded and hand-finished to bring out the intricate details of the Guruvayoorappan motif. Each piece is individually polished to achieve a mirror-like shine that lasts.",
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089766730-8e8c1d1d1f2115696dbef15617ab30e5.jpeg",
    thumbnail: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089766730-8e8c1d1d1f2115696dbef15617ab30e5.jpeg",
    productId: "69d8b42adbcbc3ce34b48c7c",
  },
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

// Real fallback similar products from the database
const FALLBACK_SIMILAR_PRODUCTS: ProductCardProduct[] = [
  {
    id: "69e67009da47f4fc8d76dd82",
    name: "Luxury Pearl Bracelet",
    price: 3200,
    category: "BRACELETS",
    rating: 4.8,
    reviews: 0,
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776710093371-12a1743c47351928e1719ac9d7fb601d.jpg",
    badge: "BESTSELLER",
    tags: ["Pearl", "Premium"],
    description: "A premium bracelet crafted with elegant pearls",
  },
  {
    id: "69dcfaa6f9d9a4f6dbcc521e",
    name: "2 in 1 Pearl Wrap",
    price: 540,
    category: "BRACELETS",
    rating: 4.7,
    reviews: 0,
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089766730-8e8c1d1d1f2115696dbef15617ab30e5.jpeg",
    badge: "NEW",
    tags: ["Pearl", "Versatile"],
    description: "Wear it as a necklace or bracelet and style it your way",
  },
  {
    id: "69dcf829f9d9a4f6dbcc50eb",
    name: "Pearl Crystal Wrap 2 in 1",
    price: 500,
    category: "BRACELETS",
    rating: 4.6,
    reviews: 0,
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776089130220-47717ba256554b141d1a4d39bc47a6ee.jpeg",
    badge: "NEW",
    tags: ["Pearl", "Crystal"],
    description: "Luminous pearls paired with faceted multi-coloured crystals",
  },
  {
    id: "69dca57d6ce90847b9b81ab7",
    name: "Elegant Pearl Wrap Bracelet",
    price: 450,
    category: "BRACELETS",
    rating: 4.9,
    reviews: 0,
    image: "https://inventino-products.s3.ap-south-1.amazonaws.com/products/1776067965389-978b176690930debcf28ad5bae1dfdbf.jpeg",
    badge: "BESTSELLER",
    tags: ["Pearl", "Elegant"],
    description: "Delicate, timeless, and effortlessly chic pearl wrap bracelet",
  },
];

interface SimilarProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: { id: string; url: string }[];
  productId: string;
  slug: string;
  ratingsAverage: number;
  ratingsCount: number;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400";

function resolveStoryImage(product: any): string {
  return (
    product?.storyMedia ||
    product?.media?.mainImage ||
    product?.mainImage ||
    product?.imageUrl ||
    product?.images?.[0]?.url ||
    FALLBACK_IMAGE
  );
}

function mapApiStories(items: any[]): StoryCard[] {
  return items
    .map((item, index) => {
      const storyTitle =
        item?.story?.title || item?.productName || item?.name || `Story ${index + 1}`;
      const storyContent =
        item?.story?.content || item?.story || item?.description || "";
      const productId = String(item?.productId || item?._id || "");

      if (!productId) return null;

      return {
        id: index + 1,
        artisan: item?.story?.author || item?.story?.artisan || item?.productName || "Inventino Artisan",
        role: item?.story?.role || "Featured Story",
        title: storyTitle,
        description: storyContent || storyTitle,
        quote: item?.story?.quote || storyContent || storyTitle,
        process: item?.story?.process || item?.description || storyContent || storyTitle,
        image: resolveStoryImage(item),
        thumbnail: resolveStoryImage(item),
        productId,
      } satisfies StoryCard;
    })
    .filter(Boolean) as StoryCard[];
}

function ProcessStepCard({ step }: { step: typeof PROCESS_STEPS[0] }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-pink-100 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-pink-100/60 hover:border-pink-200 hover:-translate-y-1">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E8456A] text-white flex items-center justify-center text-base md:text-lg font-black mb-4 md:mb-6 shadow-[0_0_20px_rgba(232,69,106,0.5)]">
        {step.id}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{step.title}</h3>
      <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed">{step.description}</p>
    </div>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryCard[]>(MOCK_STORIES);
  const [activeStoryId, setActiveStoryId] = useState(MOCK_STORIES[0].id);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("Added to Cart");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [similarProducts, setSimilarProducts] = useState<ProductCardProduct[]>(FALLBACK_SIMILAR_PRODUCTS);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Story API states
  const [storyData, setStoryData] = useState<ProductStory | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);

  const { addToCart: localAddToCart } = useCart();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);

  const activeStory = stories.find(s => s.id === activeStoryId) ?? stories[0] ?? MOCK_STORIES[0];
  const activeIndex = stories.findIndex(s => s.id === activeStoryId);
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === stories.length - 1;

  // ─── Scroll active circle into view ────────────────────────────────────────
  const scrollActiveCircleIntoView = (storyId: number) => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.querySelector(`[data-story-id="${storyId}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  // ─── API: Fetch Story Data ───────────────────────────────────────────────
  const fetchStoryData = async (productId: string) => {
    if (!productId) return;
    
    // Skip API call for mock IDs to avoid 500 errors on backend
    // Valid MongoDB ObjectId is 24-char hex string
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    if (!isObjectId) {
      console.log(`[Story] Skipping API for mock/invalid ID: ${productId}`);
      setStoryData(null);
      setStoryLoading(false);
      return;
    }

    setStoryLoading(true);
    try {
      const response = await productService.getStory(productId);
      const story = response?.data ?? response;
      if (story && (story.story || story.storyMedia)) {
        setStoryData(story);
      } else {
        setStoryData(null);
      }
    } catch (err) {
      // service now handles errors, but we keep this as extra safety
      console.error("[Story] fetch failed:", err);
      setStoryData(null);
    } finally {
      setStoryLoading(false);
    }
  };

  const fetchStoriesList = async () => {
    try {
      const response = await productService.getStories(1, 12);
      const items = response?.data?.data?.items;

      if (Array.isArray(items) && items.length > 0) {
        const mappedStories = mapApiStories(items);
        if (mappedStories.length > 0) {
          setStories(mappedStories);
          setActiveStoryId((currentId) => {
            const currentExists = mappedStories.some((story) => story.id === currentId);
            return currentExists ? currentId : mappedStories[0].id;
          });
        }
      }
    } catch (error) {
      console.error("[Stories] list fetch failed:", error);
    }
  };

  // ─── API: Similar Products ───────────────────────────────────────────────
  const fetchSimilarProducts = async (productId: string) => {
    if (!productId) return;
    
    // Skip API call for mock IDs to avoid 500 errors on backend
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    if (!isObjectId) {
      console.log(`[Similar] Skipping API for mock/invalid ID: ${productId}`);
      setSimilarProducts(FALLBACK_SIMILAR_PRODUCTS);
      return;
    }

    setSimilarLoading(true);
    try {
      const response = await productService.getSimilar(productId);
      const payload = response?.data ?? response;
      const list: SimilarProduct[] = Array.isArray(payload) ? payload : [];
      if (list.length > 0) {
        const transformedProducts = list.map((p) => ({
          id: p._id,
          _id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.price + 150,
          category: p.category,
          image: p.images?.[0]?.url || FALLBACK_IMAGE,
          images: p.images?.length ? p.images.map((img) => img.url) : [FALLBACK_IMAGE],
          rating: p.ratingsAverage || 4.5,
          reviews: p.ratingsCount || 0,
          description: p.description,
          slug: p.slug,
        }));
        setSimilarProducts(transformedProducts);
      } else {
        setSimilarProducts(FALLBACK_SIMILAR_PRODUCTS);
      }
    } catch (err) {
      console.error("[Similar] fetch failed:", err);
      setSimilarProducts(FALLBACK_SIMILAR_PRODUCTS);
    } finally {
      setSimilarLoading(false);
    }
  };

  // Fetch story and similar products when active story changes
  useEffect(() => {
    fetchStoriesList();
  }, []);

  useEffect(() => {
    if (activeStory?.productId) {
      fetchStoryData(activeStory.productId);
      fetchSimilarProducts(activeStory.productId);
    }
  }, [activeStory]);

  const scrollCirclesBy = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    // On mobile show exactly 3 circles per scroll, on larger screens scroll full width
    const buttons = scrollRef.current.querySelectorAll("[data-story-id]");
    if (buttons.length > 0) {
      const btnWidth = buttons[0].getBoundingClientRect().width;
      const gap = window.innerWidth < 640 ? 8 : 12; // gap-2 = 8px, gap-3 = 12px
      // Mobile/tablet: scroll 3 circles; Desktop (lg+): scroll all 5
      const visibleCount = window.innerWidth >= 1024 ? 5 : 3;
      const scrollAmount = (btnWidth + gap) * visibleCount;
      scrollRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + stories.length) % stories.length;
    setActiveStoryId(stories[prevIndex].id);
    scrollCirclesBy("prev");
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % stories.length;
    setActiveStoryId(stories[nextIndex].id);
    scrollCirclesBy("next");
  };

  const handleViewDetails = () => {
    if (activeStory.productId) {
      router.push(`/products/${activeStory.productId}`);
    } else {
      console.error("No product ID for this story");
      setToastMessage("Product details not available");
    }
  };

  const scrollSimilarLeft = () => {
    if (similarScrollRef.current) {
      similarScrollRef.current.scrollBy({ left: -similarScrollRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const scrollSimilarRight = () => {
    if (similarScrollRef.current) {
      similarScrollRef.current.scrollBy({ left: similarScrollRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  // Determine which story content to display (API data or fallback)
  const storyImageSrc = storyData?.storyMedia?.trim()
    ? storyData.storyMedia
    : activeStory.image;

  const storyText = storyData?.story?.trim()
    ? storyData.story
    : activeStory.quote;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 pb-6 pt-2 sm:px-6 md:px-12 md:pb-12 md:pt-4 lg:px-20 lg:pb-20 lg:pt-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">

        {/* Top Stories Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-[#E8456A] mb-5 md:mb-8">Top Stories</h2>

          <div className="mx-6 sm:mx-0 bg-white rounded-2xl p-4 sm:p-6 md:p-10 flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-14 border border-pink-100 shadow-xl shadow-pink-100/30">

            {/* Left Column */}
            <div className="w-full lg:w-5/12 flex flex-col">

              {/* Story Circles with Prev/Next Arrows */}
              <div className="flex items-center justify-center gap-2 mb-5 md:mb-8">
                <button
                  onClick={handlePrev}
                  disabled={isFirst}
                  className="shrink-0 w-8 h-8 rounded-full bg-[#E8456A] text-white flex items-center justify-center shadow-md hover:bg-[#c73a5a] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#E8456A]"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>

                <div className="circles-container" style={{ overflowX: "hidden", overflowY: "visible" }}>
                <div
                  ref={scrollRef}
                  className="flex gap-2 sm:gap-3 overflow-x-auto py-3 px-2 no-scrollbar"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {stories.map((story) => {
                    const isActive = activeStoryId === story.id;
                    return (
                      <button
                        key={story.id}
                        data-story-id={story.id}
                        onClick={() => setActiveStoryId(story.id)}
                        className="relative shrink-0 hover:-translate-y-1 transition-transform snap-start"
                      >
                        <div
                          className="w-14 h-14 sm:w-16.5 sm:h-16.5 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            padding: isActive ? "3px" : "0px",
                            background: isActive
                              ? "linear-gradient(135deg, #f472a0 0%, #E8456A 50%, #e05580 100%)"
                              : "none",
                            boxShadow: isActive
                              ? "0 0 12px 3px rgba(232,69,106,0.5)"
                              : "none",
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-white p-0.5">
                            <img
                              src={story.thumbnail}
                              alt={story.artisan}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        </div>
                        {/* Badge: pink when active, gray when not */}
                        <div
                          className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md"
                          style={{ background: isActive ? "#E8456A" : "#9ca3af" }}
                        >
                          {story.id}
                        </div>
                      </button>
                    );
                  })}
                </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={isLast}
                  className="shrink-0 w-8 h-8 rounded-full bg-[#E8456A] text-white flex items-center justify-center shadow-md hover:bg-[#c73a5a] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#E8456A]"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>

              {/* Main Image */}
              <div
                className="relative w-full rounded-3xl overflow-hidden mb-4 md:mb-6 shadow-lg"
                style={{ backgroundColor: "#f0d9c8", aspectRatio: "4/3" }}
              >
                {storyLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#E8456A] rounded-full animate-spin" />
                  </div>
                ) : (
                  <img
                    src={storyImageSrc}
                    alt={activeStory.title}
                    className="w-full h-full object-cover"
                    style={{ mixBlendMode: "multiply" }}
                  />
                )}
              </div>

              {/* Artisan Identifier */}
              <div className="inline-flex items-center gap-3 bg-[#E8456A]/10 border border-[#E8456A]/30 rounded-full py-2 px-4 w-fit shadow-lg shadow-[#E8456A]/5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E8456A] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                  {activeStory.artisan.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex flex-col pr-1 sm:pr-2">
                  <span className="text-gray-900 text-[12px] sm:text-[13px] font-bold tracking-wide">{activeStory.artisan}</span>
                  <span className="text-[#E8456A] text-[10px] sm:text-[11px] font-medium">{activeStory.role}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-7/12 flex flex-col justify-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight">
                {storyData?.productName || activeStory.title}
              </h1>

              <div className="space-y-4 md:space-y-6 text-gray-600 text-[14px] md:text-[15px] leading-relaxed">
                <p>Every piece we create carries a unique journey from concept to creation.</p>

                {storyLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                  </div>
                ) : (
                  <p>{storyData?.story || activeStory.description}</p>
                )}

                <div className="border-l-[3px] border-[#E8456A] pl-4 md:pl-5 py-2 my-6 md:my-8 bg-linear-to-r from-[#E8456A]/10 to-transparent rounded-r-xl p-3 md:p-4">
                  {storyLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <>
                      <p className="italic text-gray-800 font-medium mb-2 md:mb-3 text-[13px] md:text-[15px]">"{storyText}"</p>
                      <p className="text-[#E8456A] font-bold text-xs md:text-sm">— {activeStory.artisan}, {activeStory.role}</p>
                    </>
                  )}
                </div>

                {storyLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                ) : (
                  <p>{storyData?.story || activeStory.process}</p>
                )}
              </div>

              {/* View Details Button only — Add to Cart removed */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
                <button
                  onClick={handleViewDetails}
                  className="flex-1 sm:max-w-50 flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                  style={{
                    background: "linear-gradient(135deg, #f472a0 0%, #E8456A 50%, #e05580 100%)",
                    boxShadow: "0 4px 20px rgba(232,69,106,0.4)",
                  }}
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Creation Process Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[#E8456A] mb-5 md:mb-8 px-6 sm:px-0">Our Creation Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-6 sm:px-0">
            {PROCESS_STEPS.map((step) => (
              <ProcessStepCard key={step.id} step={step} />
            ))}
          </div>
        </section>

        {/* Similar Products Section */}
        <section className="group/similar">
          <h2 className="text-xl md:text-2xl font-bold text-[#E8456A] mb-5 md:mb-8 px-6 sm:px-0">Similar Products</h2>

          <div className="flex items-center gap-3">
            {/* Navigation Button Left */}
            <button
              onClick={scrollSimilarLeft}
              className="shrink-0 w-10 h-10 bg-white shadow-xl rounded-full border border-gray-200 text-gray-800 hover:bg-[#E8456A] hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
              aria-label="Scroll left"
              disabled={similarLoading}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Scrollable Row */}
            <div
              ref={similarScrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth flex-1"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {similarLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="shrink-0 w-full md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-1rem)] snap-center"
                  >
                    <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                ))
              ) : (
                similarProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 w-full md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-1rem)] snap-center"
                  >
                    <ProductCard
                      product={product}
                      onAdd={(productName) => {
                        setToastTitle("Success!");
                        setToastType("success");
                        setToastMessage(`${productName} has been added to your cart.`);
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Navigation Button Right */}
            <button
              onClick={scrollSimilarRight}
              className="shrink-0 w-10 h-10 bg-white shadow-xl rounded-full border border-gray-200 text-gray-800 hover:bg-[#E8456A] hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
              aria-label="Scroll right"
              disabled={similarLoading}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

      </div>

      {toastMessage && (
        <Toast
          title={toastTitle}
          message={toastMessage}
          type={toastType}
          position="bottom-right"
          onClose={() => setToastMessage("")}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Mobile: show exactly 3 circles (56px each + 8px gap + 10px for badge/glow on right edge) */
        .circles-container {
          width: calc(3 * 56px + 2 * 8px + 10px);
        }
        /* sm: show all 5 circles (66px + 12px gap) */
        @media (min-width: 640px) {
          .circles-container {
            width: calc(5 * 66px + 4 * 12px + 16px);
          }
        }
        /* md/tablet: circles become 72px, recalculate */
        @media (min-width: 768px) {
          .circles-container {
            width: calc(5 * 72px + 4 * 12px + 16px);
          }
        }
        /* lg and above */
        @media (min-width: 1024px) {
          .circles-container {
            width: calc(5 * 72px + 4 * 12px + 16px);
          }
        }
      `}</style>
    </div>
  );
}