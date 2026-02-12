"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation"; 

// --- FINAL STABLE MOCK DATA ---
const ALL_PRODUCTS = [
  {
    id: 1,
    title: "Delicate Rose Gold Bracelet",
    category: "Bracelets",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 128,
    description: "This exquisite handcrafted rose gold bracelet features delicate detailing and an adjustable chain, making it the perfect accessory for any occasion.",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop",
    ],
    features: ["Handcrafted with love", "18k rose gold plating", "Adjustable chain", "Hypoallergenic"]
  },
  {
    id: 2,
    title: "Bohemian Beaded Hoop Earrings",
    category: "Earrings",
    price: 44.99,
    originalPrice: 59.99,
    rating: 4.7,
    reviews: 84,
    description: "These stunning bohemian hoop earrings feature natural stones and intricate gold-tone beading.",
    images: [
      // 1. Main Green/Gold Earrings (The one that works!)
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop", 
      // 2. Fallback Detail Shot (Gold Jewelry vibe)
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop", 
      // 3. Lifestyle Shot
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=600&auto=format&fit=crop",
    ],
    features: ["Natural semi-precious stones", "Gold-tone finish", "Lightweight design", "Nickel-free posts"]
  },
  {
    id: 3,
    title: "Pearl Layered Chain Necklace",
    category: "Necklaces",
    price: 64.99,
    originalPrice: null,
    rating: 5.0,
    reviews: 42,
    description: "An elegant multi-layered necklace featuring genuine freshwater pearls.",
    images: [
      // 1. Main Pearl Necklace (Updated & Working)
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
      // 2. Detail Shot
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop",
      // 3. Lifestyle Shot
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
    ],
    features: ["Genuine freshwater pearls", "Tarnish-resistant chain", "Lobster clasp closure", "Adjustable length"]
  }
];

export default function ProductDetailsPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    if (params.id) {
      const foundProduct = ALL_PRODUCTS.find((p) => p.id === Number(params.id));
      setProduct(foundProduct || null);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans">
      
      {/* ================= TOP SECTION: GALLERY & DETAILS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
             <img 
               src={product.images[selectedImage]} 
               alt={product.title} 
               className="w-full h-full object-cover"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = "https://placehold.co/600x600?text=Image+Unavailable"; // Fallback image
               }}
             />
             <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-pink-500 transition-colors"><Heart size={20} /></button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-pink-500' : 'border-transparent'}`}>
                <img 
                  src={img} 
                  alt="thumb" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none'; // Hide broken thumbnails
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-2">
             <span className="text-pink-500 text-xs font-bold uppercase">{product.category}</span>
             <div className="flex items-center text-yellow-400 text-xs ml-auto"><Star fill="currentColor" size={12} /> <span className="text-gray-500 ml-1 font-medium">{product.rating} ({product.reviews} reviews)</span></div>
           </div>
           
           <h1 className="text-4xl font-serif text-gray-900">{product.title}</h1>
           
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-pink-500">${product.price}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>}
             {product.originalPrice && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">SALE</span>}
           </div>

           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-6">{product.description}</p>

           <div className="space-y-3">
             <h3 className="font-bold text-sm text-gray-900">Key Features</h3>
             <ul className="space-y-2">
               {product.features.map((feat: string, i: number) => (
                 <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                   <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">✓</div> {feat}
                 </li>
               ))}
             </ul>
           </div>

           <div className="flex flex-col gap-4 pt-2">
             <div>
               <span className="text-sm font-bold text-gray-900 block mb-2">Choose Color</span>
               <div className="flex gap-3">
                 {['#E0BFB8', '#FFD700', '#C0C0C0'].map((col, idx) => (
                   <button key={idx} onClick={() => setSelectedColor(idx)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx ? 'border-gray-800 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: col }}/>
                 ))}
               </div>
             </div>
           </div>

           <div className="flex gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-200 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:text-pink-500"><Minus size={16}/></button>
                 <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:text-pink-500"><Plus size={16}/></button>
              </div>
              <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                 <ShoppingBag size={18} /> Add to Cart
              </button>
           </div>
           
           <div className="grid grid-cols-3 gap-4 pt-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><Truck size={16} className="text-pink-500"/> Free Shipping</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-pink-500"/> 2 Year Warranty</div>
              <div className="flex items-center gap-2"><RefreshCw size={16} className="text-pink-500"/> Easy Returns</div>
           </div>
        </div>
      </div>

      {/* ================= MIDDLE SECTION: THE STORY ================= */}
      <div className="bg-[#1a1a1a] text-white py-20 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-serif mb-4">The Story Behind <span className="text-pink-500">This Treasure</span></h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-sm">Every piece we create carries a unique journey from concept to creation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white/10">
                  <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop" alt="Story" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-6 left-6 bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                     <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">SA</div>
                     <div>
                       <p className="font-bold text-xs">Sarah Anderson</p>
                       <p className="text-[10px] text-gray-500">Master Artisan</p>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed text-sm">This beautiful piece is the result of over 20 years of craftsmanship perfected by Sarah Anderson, a third-generation jewelry maker.</p>
                  <p className="text-gray-300 leading-relaxed text-sm">Sarah learned the art of jewelry making from her grandmother, who passed down traditional techniques that have been refined over generations.</p>
                  <blockquote className="border-l-4 border-pink-500 pl-4 py-2 my-6 bg-white/5 rounded-r-lg">
                    <p className="italic text-gray-200 text-sm">"Every piece I create is infused with love and intention. I want the wearer to feel special and confident."</p>
                  </blockquote>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                     {[1,2,3].map(step => (
                        <div key={step} className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm mb-3">0{step}</div>
                           <h4 className="font-bold text-xs mb-1">{step === 1 ? 'Design' : step === 2 ? 'Craft' : 'Quality'}</h4>
                           <p className="text-[10px] text-gray-400">Meticiulous attention to every detail.</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    
      {/* ================= BOTTOM SECTION: SIMILAR PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-20 bg-gray-50">
         <h3 className="text-2xl font-serif text-gray-900 mb-8">Similar Products</h3>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             {/* Filter out the current product, then map the rest */}
             {ALL_PRODUCTS.filter(p => p.id !== product.id).map((similarProduct) => (
                 <SimilarProductCard key={similarProduct.id} product={similarProduct} />
             ))}
         </div>
      </div>

    </div>
  );
}

// ================= SIMILAR PRODUCT CARD COMPONENT =================
function SimilarProductCard({ product }: { product: any }) {
  // Use Next.js Link for navigation
  const Link = require("next/link").default; 

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
        <Link href={`/AllProducts/${product.id}`} className="block w-full h-full">
           <img 
             src={product.images[0]} 
             alt={product.title} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
        </Link>
        <div className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-600 shadow-sm">
           <Heart size={16} />
        </div>
        {/* Sale Badge if applicable */}
        {product.originalPrice && (
           <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
             Sale
           </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-1">
         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</span>
         <Link href={`/AllProducts/${product.id}`}>
            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 hover:text-pink-500 transition-colors line-clamp-2">
              {product.title}
            </h4>
         </Link>
         
         <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex flex-col">
               <span className="font-bold text-pink-500">${product.price}</span>
               {product.originalPrice && (
                 <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
               )}
            </div>
            <button className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold px-3 py-2 rounded-full shadow-md transition-colors uppercase tracking-wide">
               Add to Bag
            </button>
         </div>
      </div>
    </div>
  );
}