"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation"; 
import productsData from "@/lib/products.json"; // <--- IMPORTING THE JSON

export default function ProductDetailsPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      // LOGIC: Map the URL ID (e.g. "150") to one of our 3 real products
      // We subtract 1 because arrays start at 0
      const index = (Number(params.id) - 1) % productsData.length;
      const foundProduct = productsData[index];
      
      setProduct(foundProduct);
    }
  }, [params.id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: IMAGES */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
             <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover"/>
             <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-pink-500"><Heart size={20} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === idx ? 'border-pink-500' : 'border-transparent'}`}>
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col gap-6">
           <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">{product.category}</span>
           <h1 className="text-4xl font-serif text-gray-900">{product.title}</h1>
           <div className="flex items-center gap-3">
             <span className="text-3xl font-bold text-pink-500">${product.price}</span>
             {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>}
           </div>
           <p className="text-gray-600 leading-relaxed text-sm border-b border-gray-100 pb-6">{product.description}</p>
           
           <div className="flex gap-4 pt-4">
              <div className="flex items-center border border-gray-200 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus size={16}/></button>
                 <span className="font-bold w-8 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-3"><Plus size={16}/></button>
              </div>
              <button className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-all">
                 <ShoppingBag size={18} /> Add to Cart
              </button>
           </div>
        </div>
      </div>
      
      {/* ADD YOUR STORY SECTION & SIMILAR PRODUCTS HERE (Reuse previous code) */}
    </div>
  );
}