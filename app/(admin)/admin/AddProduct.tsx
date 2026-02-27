"use client";

import { useState, useRef } from "react";
import { ChevronDown, X, Eye, Upload, CheckCircle2 } from "lucide-react";
// apiMethods removed - we will post FormData directly with fetch


export default function AddProduct() {
    // form toggle states and tag handling (existing)

    // ProductPayload interface is no longer needed since we post multipart/form-data directly
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    }
    const [tags, setTags] = useState(["Handmade", "Rose Gold", "Bracelet"]);
    const [newTag, setNewTag] = useState("");
    const [isFeatured, setIsFeatured] = useState(true);
    const [reviewsEnabled, setReviewsEnabled] = useState(false);
    const [freeShipping, setFreeShipping] = useState(true);
    const [selectedColor, setSelectedColor] = useState("rose");
    const [displayStory, setDisplayStory] = useState(true);
    const [showBadge, setShowBadge] = useState(true);
    const [showTimeline, setShowTimeline] = useState(true);
    const [showQuote, setShowQuote] = useState(true);

    // additional UI state for API integration
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; show: boolean }>({
        message: "",
        type: "success",
        show: false,
    });

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && newTag.trim() !== "") {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const triggerToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setError("");

        const form = e.currentTarget as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
        const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value.trim();
        const price = (form.elements.namedItem("price") as HTMLInputElement)?.value.trim();
        const category = (form.elements.namedItem("category") as HTMLSelectElement)?.value.trim();
        const material = (form.elements.namedItem("material") as HTMLInputElement)?.value.trim();
        const stock = (form.elements.namedItem("stock") as HTMLInputElement)?.value.trim();

        if (!name || !description || !price || !category || !material || !stock) {
            setError("Please fill in all required fields marked with *");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("material", material);
        formData.append("stock", stock);
        selectedFiles.forEach(file => formData.append("images", file));

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(data?.message || `HTTP ${res.status}`);
            }

            triggerToast("Product added successfully", "success");
            setError("");
            form.reset();
            setTags([]);
            setIsFeatured(true);
            setReviewsEnabled(false);
            setFreeShipping(true);
            setSelectedColor("rose");
            setDisplayStory(true);
            setShowBadge(true);
            setShowTimeline(true);
            setShowQuote(true);
            setSelectedFiles([]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err) || "Network error";
            setError(msg);
            triggerToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="max-w-6xl mx-auto font-sans pb-20">
            {/* error message */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>
            )}

            {/* toast notification */}
            <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-8 z-[100] transition-all duration-300 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <div className="bg-white rounded-2xl py-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-gray-100 min-w-[200px] max-w-[88vw]">
                    <div className={`${toast.type === "success" ? "bg-green-500" : "bg-red-500"} w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0`}>
                        {toast.type === "success" ? <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} /> : <X size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{toast.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-xs text-gray-400 truncate">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-gray-300 hover:text-gray-500 flex-shrink-0 ml-1">
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* --- SECTION 1 --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Basic Information</h3>
                        <p className="text-xs text-muted-foreground mb-6">Fill in the basic details of your product</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Product Name <span className="text-destructive">*</span></label>
                                <input name="name" type="text" required placeholder="e.g., Delicate Rose Bracelet" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Description <span className="text-destructive">*</span></label>
                                <textarea name="description" rows={6} required placeholder="Write a detailed description of your product..." className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-dark focus:ring-1 focus:ring-primary-dark transition-all resize-none" />
                                <p className="text-[10px] text-muted-foreground mt-2">Minimum 50 characters recommended</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-2">Category <span className="text-destructive">*</span></label>
                                    <div className="relative">
                                        <select name="category" required className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark appearance-none cursor-pointer">
                                            <option value="">Select Category</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-2">Sub-Category</label>
                                    <div className="relative">
                                        <select name="subCategory" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark appearance-none cursor-pointer">
                                            <option value="">Select Sub-Category</option>
                                            <option value="Bracelets">Bracelets</option>
                                            <option value="Necklaces">Necklaces</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Tags</label>
                                <div className="flex flex-wrap items-center gap-2 p-3 bg-card border border-border rounded-xl min-h-[52px]">
                                    {tags.map((tag, idx) => (
                                        <span key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:opacity-80 ml-1"><X size={12} strokeWidth={3} /></button>
                                        </span>
                                    ))}
                                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleAddTag} placeholder="Add a tag..." className="flex-1 bg-transparent text-sm min-w-[80px] focus:outline-none px-1 text-foreground placeholder-muted-foreground" />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">Press Enter to add tags</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Publish Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Status</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark appearance-none cursor-pointer">
                                        <option>Published</option>
                                        <option>Draft</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Visibility</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark appearance-none cursor-pointer">
                                        <option>Public</option>
                                        <option>Private</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            <div className="pt-2 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div onClick={() => setIsFeatured(!isFeatured)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFeatured ? 'bg-primary' : 'bg-gray-200'}`}>
                                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>Featured Product</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div onClick={() => setReviewsEnabled(!reviewsEnabled)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${reviewsEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${reviewsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setReviewsEnabled(!reviewsEnabled)}>Enable Reviews</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Organization</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Vendor/Brand</label>
                                <input name="vendor" type="text" placeholder="e.g. Handmade By Sarah" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Collections</label>
                                <textarea name="collections" rows={3} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all resize-none" placeholder="Search for collections..." />
                                <p className="text-[10px] text-muted-foreground mt-1">Hold Ctrl to select multiple</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2 --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Pricing & Inventory</h3>
                        <p className="text-xs text-muted-foreground mb-6">Set your product pricing and stock details</p>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-2">Price <span className="text-destructive">*</span></label>
                                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span><input name="price" type="text" required placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-2">Sale Price</label>
                                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span><input name="salePrice" type="text" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-2">Material <span className="text-destructive">*</span></label>
                                    <input name="material" type="text" required placeholder="e.g. beads" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-foreground mb-2">SKU</label><input name="sku" type="text" placeholder="SKU-001" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                                <div><label className="block text-xs font-bold text-foreground mb-2">Stock <span className="text-destructive">*</span></label><input name="stock" type="text" required placeholder="0" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Stock Status <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <select name="stockStatus" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary-dark"><option>In Stock</option><option>Out of Stock</option></select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Product Variants</h3>
                        <p className="text-xs text-muted-foreground mb-6">Add color and size options for your product</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-3">Available Colors</label>
                                <div className="flex gap-3">
                                    {['rose', 'silver', 'gold', 'black', 'white', 'pink'].map((color) => (
                                        <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-primary-dark' : 'border-transparent'}`}>
                                            <div className={`w-7 h-7 rounded-md ${color === 'rose' ? 'bg-[#E3A69C]' : color === 'silver' ? 'bg-[#C0C0C0]' : color === 'gold' ? 'bg-[#FFD700]' : color === 'black' ? 'bg-[#000000]' : color === 'white' ? 'bg-white border border-gray-200' : 'bg-primary'}`}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-3">Sizes</label>
                                <div className="flex flex-wrap items-center gap-2 p-3 bg-card border border-border rounded-xl min-h-[52px]">
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">Small <X size={12} strokeWidth={3} className="cursor-pointer" /></span>
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">Medium <X size={12} strokeWidth={3} className="cursor-pointer" /></span>
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">Large <X size={12} strokeWidth={3} className="cursor-pointer" /></span>
                                    <input type="text" placeholder="Add a size..." className="flex-1 bg-transparent text-sm focus:outline-none px-1 text-foreground placeholder-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Shipping</h3>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-foreground mb-2">Weight (kg)</label><input name="weight" type="text" placeholder="0.00" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-foreground mb-2">Length (cm)</label><input name="length" type="text" placeholder="0" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                                <div><label className="block text-xs font-bold text-foreground mb-2">Width (cm)</label><input name="width" type="text" placeholder="0" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-foreground mb-2">Height (cm)</label><input name="height" type="text" placeholder="0" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /></div>
                            <div className="flex items-center gap-3 pt-2">
                                <div onClick={() => setFreeShipping(!freeShipping)} className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${freeShipping ? 'bg-primary' : 'bg-gray-200'}`}><div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${freeShipping ? 'translate-x-5' : 'translate-x-0'}`} /></div>
                                <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setFreeShipping(!freeShipping)}>Free Shipping</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">SEO</h3>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-foreground mb-2">Meta Title</label><input name="metaTitle" type="text" placeholder="Product meta title" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" /><p className="text-[10px] text-muted-foreground mt-2">0/60 characters</p></div>
                            <div><label className="block text-xs font-bold text-foreground mb-2">Meta Description</label><textarea name="metaDescription" rows={3} placeholder="Product meta description" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary-dark" /><p className="text-[10px] text-muted-foreground mt-2">0/160 characters</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3 --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Story Header</h3>
                        <p className="text-xs text-muted-foreground mb-6">Main title for the story section</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Story Title <span className="text-destructive">*</span></label>
                                <input name="storyTitle" type="text" placeholder="The Story Behind This Treasure" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Story Content <span className="text-destructive">*</span></label>
                                <textarea name="storyContent" rows={5} placeholder="This beautiful rose gold bracelet is the result of..." className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all resize-none" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Artisan Quote</h3>
                        <p className="text-xs text-muted-foreground mb-6">Featured quote from the artisan (optional but recommended)</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Quote Text</label>
                                <textarea name="quoteText" rows={4} placeholder="Every piece I create is infused with love..." className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Quote Author</label>
                                <input name="quoteAuthor" type="text" placeholder="Sarah Anderson, Master Artisan" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">Artisan Information</h3>
                        <p className="text-xs text-muted-foreground mb-6">Details about the maker of this product</p>
                        <div className="p-6 bg-muted border border-border rounded-2xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs font-black">01</div>
                                <span className="font-bold text-foreground text-sm">Step 1</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Step Title</label>
                                <input type="text" placeholder="Design & Concept" className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-2">Step Description</label>
                                <textarea rows={3} placeholder="Each design begins with sketches..." className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary-dark" />
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-dashed border-primary text-primary rounded-xl text-xs font-bold hover:bg-muted transition-all uppercase tracking-widest">
                            + Add Another Step
                        </button>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Link to Product</h3>
                        <label className="block text-xs font-bold text-foreground mb-2">Select Product <span className="text-destructive">*</span></label>
                        <div className="relative">
                            <select className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary-dark"><option>Delicate Rose Gold Bracelet</option></select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Story Settings</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Display Story on Product Page", state: displayStory, fn: setDisplayStory },
                                { label: "Show Artisan Badge", state: showBadge, fn: setShowBadge },
                                { label: "Show Timeline Section", state: showTimeline, fn: setShowTimeline },
                                { label: "Show Quote Section", state: showQuote, fn: setShowQuote }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div onClick={() => item.fn(!item.state)} className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${item.state ? 'bg-primary' : 'bg-gray-200'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${item.state ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <label className="text-xs font-medium text-foreground cursor-pointer" onClick={() => item.fn(!item.state)}>{item.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Preview & Publish</h3>
                        <button className="w-full py-4 border border-primary text-primary rounded-xl text-xs font-bold bg-card hover:bg-muted transition-all mb-3 shadow-sm flex items-center justify-center gap-2">
                            <Eye size={16} strokeWidth={2.5} /> Preview Story
                        </button>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="text-sm font-bold text-card-foreground mb-4">Tags & Keywords</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">Story Tags</label>
                                <input name="storyTags" type="text" placeholder="handmade, artisan, jewelry" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary-dark outline-none" />
                                <p className="text-[10px] text-muted-foreground mt-1">Separate tags with commas</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-foreground mb-1">Featured Story</label>
                                <div className="relative">
                                    <select name="featuredStory" className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm appearance-none outline-none focus:border-primary-dark"><option>No</option><option>Yes</option></select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 4 (PRODUCT IMAGES) --- */}
            <div className="w-full mt-6">
                <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-lg font-bold text-card-foreground mb-1">Product Images</h3>
                    <p className="text-xs text-muted-foreground mb-8">Upload high-quality images of your product</p>
                    <div className="w-full border-2 border-dashed border-border rounded-2xl py-12 flex flex-col items-center justify-center bg-muted">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Upload className="text-primary" size={24} />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1">Drag & drop images here</p>
                        <p className="text-xs text-muted-foreground mb-6">or click to browse</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark transition-all">Choose Files</button>
                        <input ref={fileInputRef} type="file" name="images" multiple className="hidden" onChange={handleFilesChange} />
                    </div>
                    <div className="flex gap-4 mt-8">
                        {selectedFiles.length > 0 ? (
                            selectedFiles.map((file, idx) => (
                                <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-[#D6A681] rounded-xl"></div>
                                <div className="w-24 h-24 bg-[#769383] rounded-xl"></div>
                                <div className="w-24 h-24 bg-[#F2D694] rounded-xl"></div>
                            </>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">Upload up to 10 images. First image will be the main product image.</p>
                </div>
                <div className="flex gap-6 mt-12 justify-center">
                    <button className="w-full max-w-xs py-4 border-2 border-primary text-primary rounded-2xl text-sm font-bold bg-card hover:bg-muted transition-all">Preview</button>
                    <button type="submit" disabled={isLoading} className="w-full max-w-xs py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50">
                    {isLoading ? "Publishing..." : "Publish Product"}
                </button>
                </div>
            </div>
        </form>
    );
}
