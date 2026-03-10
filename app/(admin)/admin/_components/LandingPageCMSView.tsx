import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Upload, Search, Eye } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toggle from "./Toggle";
import { useToast } from "@/app/components/GlobalToast";
import { getCMSData, updateCMSData } from "@/services/admin.service";

const featureSchema = z.object({
    title: z.string().min(3, "Feature title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    status: z.enum(["enabled", "disabled"]),
});

type FeatureFormData = z.infer<typeof featureSchema>;

const DEFAULT_FEATURES = [
    {
        id: 1,
        title: "Try Before You Buy",
        description: "Experience products virtually with AR technology",
        enabled: true,
        icon: "🛍️",
    },
    {
        id: 2,
        title: "Free Shipping",
        description: "Free shipping on all orders over $50",
        enabled: true,
        icon: "🚚",
    },
    {
        id: 3,
        title: "Secure Payments",
        description: "Your information is always protected",
        enabled: true,
        icon: "🔒",
    },
    {
        id: 4,
        title: "Quality Guarantee",
        description: "30-day money back guarantee on all items",
        enabled: false,
        icon: "💯",
    },
];

export default function LandingPageCMSView() {
    const [offerText, setOfferText] = useState("");
    const [showOfferBar, setShowOfferBar] = useState(true);
    const [bannerHeading, setBannerHeading] = useState("");
    const [bannerText, setBannerText] = useState("");
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [features, setFeatures] = useState<Array<{ id: number; title: string; description: string; enabled: boolean; icon: string }>>(DEFAULT_FEATURES);
    const [showAddModal, setShowAddModal] = useState(false);
    const { showToast } = useToast();
    const [savingOffer, setSavingOffer] = useState(false);
    const [savingBanner, setSavingBanner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch CMS data on mount
    useEffect(() => {
        const fetchCMS = async () => {
            setIsLoading(true);
            try {
                const data = await getCMSData();
                if (data) {
                    setOfferText(data.offerBar.text);
                    setShowOfferBar(data.offerBar.isActive);
                    setBannerHeading(data.heroBanner.heading);
                    setBannerText(data.heroBanner.text);
                    setBannerImage(data.heroBanner.image || null);
                }
            } catch (err) {
                console.error("Failed to fetch CMS data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCMS();
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FeatureFormData>({
        resolver: zodResolver(featureSchema),
        defaultValues: { status: "enabled" },
    });

    const triggerToggleFeature = (id: number) => {
        setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    };

    const openAddModal = () => {
        reset({ title: "", description: "", status: "enabled" });
        setShowAddModal(true);
    };

    const onAddFeature = (data: FeatureFormData) => {
        setFeatures(prev => [
            ...prev,
            {
                id: Date.now(),
                title: data.title,
                description: data.description,
                enabled: data.status === "enabled",
                icon: "✨",
            },
        ]);
        reset();
        setShowAddModal(false);
    };

    const handleResetFeatures = () => {
        setFeatures(DEFAULT_FEATURES);
    };

    const handleSaveFeatures = () => {
        showToast("Success", "Feature section updated", "success");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setBannerImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDivKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            action();
        }
    };

    const handleSaveOffer = async () => {
        setSavingOffer(true);
        try {
            await updateCMSData({ offerBar: { text: offerText, isActive: showOfferBar } });
            showToast("Success", "Offer bar settings saved!", "success");
        } catch (err) {
            console.error("Failed to save offer bar:", err);
            showToast("Error", "Failed to save offer bar settings.", "error");
        } finally {
            setSavingOffer(false);
        }
    };

    const handleSaveBanner = async () => {
        setSavingBanner(true);
        try {
            await updateCMSData({ heroBanner: { heading: bannerHeading, text: bannerText, image: bannerImage || "" } });
            showToast("Success", "Hero banner updated successfully!", "success");
        } catch (err) {
            console.error("Failed to save banner:", err);
            showToast("Error", "Failed to update banner.", "error");
        } finally {
            setSavingBanner(false);
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* 1. OFFER BAR */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h3 className="font-bold text-foreground text-base">
                            Offer Bar Management
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Control the top announcement bar on your landing page
                        </p>
                    </div>
                    {isLoading ? (
                        <Skeleton className="w-10 h-5 rounded-full" />
                    ) : (
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground">
                                Show on Landing Page
                            </span>
                            <Toggle
                                enabled={showOfferBar}
                                onToggle={() => setShowOfferBar(!showOfferBar)}
                            />
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="mt-5 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-10 w-full" />
                        <div className="flex gap-3 mt-5">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-5">
                            <label htmlFor="offerText" className="block text-xs font-bold text-foreground mb-2">
                                Offer Text
                            </label>
                            <input
                                id="offerText"
                                type="text"
                                value={offerText}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setOfferText(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() =>
                                    setOfferText(
                                        "Free Shipping on Orders Over $50! Limited Time Offer",
                                    )
                                }
                                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveOffer}
                                disabled={savingOffer}
                                className="flex-1 py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm disabled:opacity-70"
                            >
                                {savingOffer ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* 2. HERO BANNER */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-bold text-foreground text-base">
                    Hero Banner Management
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                    Update your main landing page banner image and text
                </p>

                {isLoading ? (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="flex gap-3 mt-5">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-5">
                            <label htmlFor="bannerImage" className="block text-xs font-bold text-foreground mb-2">
                                Banner Image
                            </label>
                            <label
                                htmlFor="bannerImage"
                                className="w-full border-2 border-dashed border-pink-300 rounded-xl bg-[#fdf0f4] flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-pink-100 transition-all group"
                            >
                                {bannerImage ? (
                                    <div className="relative h-40 w-full">
                                        <Image
                                            src={bannerImage}
                                            alt="Banner preview"
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 500px"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-all">
                                            <Upload size={22} className="text-primary" />
                                        </div>
                                        <p className="text-sm font-bold text-foreground">
                                            Click to upload banner image
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Recommended size: 1920×1080px (JPG, PNG)
                                        </p>
                                    </>
                                )}
                                <input
                                    id="bannerImage"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="bannerHeading" className="block text-xs font-bold text-foreground mb-2">
                                Banner Heading
                            </label>
                            <input
                                id="bannerHeading"
                                type="text"
                                value={bannerHeading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setBannerHeading(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>

                        <div className="mb-5">
                            <label htmlFor="bannerText" className="block text-xs font-bold text-foreground mb-2">
                                Banner Text
                            </label>
                            <textarea
                                id="bannerText"
                                rows={3}
                                value={bannerText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setBannerText(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setBannerHeading("Created with love");
                                    setBannerText(
                                        "Made for you with passion and dedication. Each piece tells a unique story.",
                                    );
                                    setBannerImage(null);
                                }}
                                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveBanner}
                                disabled={savingBanner}
                                className="flex-1 py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm disabled:opacity-70"
                            >
                                {savingBanner ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* 3. CATEGORIES SECTION */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-foreground text-base">
                            Categories Section
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Preview of category display
                        </p>
                    </div>
                    <button className="px-5 py-2.5 bg-[#DF4C77] text-white text-[13px] font-bold rounded-xl hover:bg-[#C83B61] transition-all shadow-sm shrink-0">
                        + Add New Categories
                    </button>
                </div>

                <div className="bg-[#FDF2F5] border border-pink-200 rounded-2xl p-6 relative">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
                        <Eye size={12} className="text-muted-foreground" /> CATEGORY PREVIEW
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { name: "Jewelry", icon: "💍" },
                            { name: "Bags", icon: "👜" },
                            { name: "Textiles", icon: "🧶" },
                            { name: "Home Decor", icon: "🏠" },
                            { name: "Art & Crafts", icon: "🎨" },
                            { name: "Clothing", icon: "👗" }
                        ].map((cat, i) => (
                            <div key={i} className="bg-white rounded-xl py-6 flex flex-col items-center justify-center shadow-sm border border-transparent hover:border-pink-200 transition-all cursor-pointer">
                                <span className="text-2xl mb-2.5">{cat.icon}</span>
                                <span className="text-[13px] font-bold text-foreground text-center">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. PRODUCT LISTING SECTION */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mt-6">
                <div className="mb-6">
                    <h3 className="font-bold text-foreground text-base">
                        Product Listing Section
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        List the Best of Best
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left side */}
                    <div className="flex flex-col">
                        <h4 className="text-xs font-bold text-foreground mb-3">Available Products</h4>

                        <div className="relative mb-3">
                            <select className="w-full appearance-none px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-pink-300 cursor-pointer shadow-sm">
                                <option>Best Sellers</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>

                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-pink-300 transition-all font-medium placeholder:font-normal placeholder:text-muted-foreground/70 shadow-sm"
                            />
                        </div>

                        <div className="bg-[#DF4C77] text-white text-center py-3 rounded-xl text-sm font-bold mb-4 shadow-sm">
                            1 Products Selected
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-1" style={{ maxHeight: "380px" }}>
                            {[
                                { id: 1, name: "Handmade Rose Gold Bracelet", price: "$34.99", stock: 45, color: "bg-[#D9A16C]", selected: false },
                                { id: 2, name: "Pearl Necklace Set", price: "$129.99", stock: 8, color: "bg-[#BCC4C9]", selected: true },
                                { id: 3, name: "Boho Beaded Bracelet", price: "$44.99", stock: 32, color: "bg-[#45AF4A]", selected: false },
                                { id: 4, name: "Leather Tote Bag", price: "$159.99", stock: 15, color: "bg-[#FF67A1]", selected: false },
                                { id: 5, name: "Gold Plated Earrings", price: "$94.99", stock: 12, color: "bg-[#FFDA00]", selected: false },
                            ].map((prod) => (
                                <div key={prod.id} className={`flex items-center gap-4 p-3.5 rounded-xl border ${prod.selected ? 'border-[#DF4C77] bg-[#FDF2F5]' : 'border-border bg-white'} cursor-pointer hover:border-pink-200 transition-colors shadow-sm`}>
                                    <div className={`w-14 h-14 rounded-lg shrink-0 overflow-hidden ${prod.color}`}>
                                        {prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0] ? (
                                            <img
                                                src={prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0]}
                                                alt={prod.name || "Product"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-foreground truncate">{prod.name}</p>
                                        <p className="text-[13px] text-[#DF4C77] font-bold mt-1">{prod.price}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{prod.stock} in stock</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-5 pt-5">
                            <button className="flex-1 py-3 bg-white border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all shadow-sm">
                                Clear All
                            </button>
                            <button className="flex-1 py-3 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm">
                                Save Selection
                            </button>
                        </div>
                    </div>

                    {/* Right side - Live Preview */}
                    <div className="bg-[#f8f8f8] rounded-2xl p-6 relative flex flex-col items-center h-full border border-border">
                        <div className="flex justify-between items-center mb-8 w-full">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LIVE PREVIEW</span>
                            <span className="bg-[#DF4C77] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">1 Products</span>
                        </div>

                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mx-auto w-full max-w-[320px] mt-4">
                            {/* Card Image Area */}
                            <div className="bg-[#f5e0cf] h-[260px] relative w-full p-4 flex items-center justify-center">
                                <span className="absolute top-4 left-4 bg-[#DF4C77] text-white text-[11px] font-bold px-3 py-1 rounded-full z-10 shadow-sm shadow-[#DF4C77]/30">New</span>
                                {/* Stylized Image Representation */}
                                <div className="relative w-[200px] h-[150px] bg-[#fffcf9] rounded shadow-sm flex before:content-[''] before:absolute before:inset-0 before:border-[3px] before:border-dashed before:border-[#ebd5c1] before:m-2">
                                    <div className="w-1/2 h-full border-r border-[#e8d2bd] shadow-[inset_-5px_0_10px_rgba(0,0,0,0.02)] bg-[#fffcf9]"></div>
                                    <div className="w-1/2 h-full bg-[#fdfaf5]"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-[15px] drop-shadow-md z-10 pointer-events-none">
                                    Pearl Necklace Set
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-5 bg-white">
                                <h4 className="font-bold text-[14px] text-foreground mb-2.5">Pearl Necklace Set</h4>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <div className="flex text-[#FFD700] text-[13px]">
                                        {"★★★★★".split('').map((star, i) => <span key={i}>{star}</span>)}
                                    </div>
                                    <span className="text-[12px] text-muted-foreground font-medium pt-0.5">4.7 / 5.0</span>
                                </div>
                                <p className="text-[#DF4C77] font-bold text-[16px]">$129.99</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. FEATURES SECTION */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 mt-6">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="font-bold text-foreground text-base">
                            Features Section
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage site features and benefits
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-5 py-2 bg-[#DF4C77] text-white text-[11px] font-bold rounded-xl hover:bg-[#C83B61] transition-all shadow-sm"
                    >
                        + Add New Feature
                    </button>
                </div>

                <div className="mt-4 bg-[#FDF2F5] border border-pink-200 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Features Preview
                    </p>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start justify-between gap-4 p-4 border border-border rounded-xl bg-white mb-3">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-4/5" />
                                </div>
                                <Skeleton className="w-10 h-5 rounded-full shrink-0" />
                            </div>
                        ))
                    ) : (
                        <div className="space-y-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    className="flex items-start justify-between gap-4 p-4 border border-border bg-white rounded-xl"
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <span className="text-sm mt-0.5">{feature.icon}</span>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900 leading-tight">
                                                {feature.title}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        <Toggle
                                            enabled={feature.enabled}
                                            onToggle={() => triggerToggleFeature(feature.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    <button
                        onClick={handleResetFeatures}
                        className="py-2.5 border border-border bg-white rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveFeatures}
                        className="py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* --- ADD FEATURE MODAL --- */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop (accessible) */}
                    <div
                        role="button"
                        tabIndex={0}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                        onKeyDown={(e) => handleDivKeyDown(e, () => setShowAddModal(false))}
                        aria-label="Close modal"
                    />
                    {/* Modal Card */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10">
                        <h2 className="text-xl font-bold text-foreground text-center mb-6">
                            Add New Feature
                        </h2>

                        <form onSubmit={handleSubmit(onAddFeature)}>
                            {/* Feature Name */}
                            <div className="mb-4">
                                <label htmlFor="featureName" className="block text-xs font-bold text-foreground mb-1.5">
                                    Feature Name <span className="text-primary">*</span>
                                </label>
                                <input
                                    id="featureName"
                                    type="text"
                                    placeholder="Feature Name"
                                    {...register("title")}
                                    className={`w-full px-4 py-3 bg-[#FDF2F5] border rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all ${errors.title ? "border-red-500" : "border-pink-200"
                                        }`}
                                />
                                {errors.title && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.title.message}
                                    </span>
                                )}
                            </div>

                            {/* Feature Description */}
                            <div className="mb-4">
                                <label htmlFor="featureDesc" className="block text-xs font-bold text-foreground mb-1.5">
                                    Feature Description <span className="text-primary">*</span>
                                </label>
                                <textarea
                                    id="featureDesc"
                                    rows={4}
                                    placeholder="Feature Description"
                                    {...register("description")}
                                    className={`w-full px-4 py-3 bg-[#FDF2F5] border rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none ${errors.description ? "border-red-500" : "border-pink-200"
                                        }`}
                                />
                                {errors.description && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.description.message}
                                    </span>
                                )}
                            </div>

                            {/* Status Dropdown */}
                            <div className="mb-6">
                                <label htmlFor="featureStatus" className="block text-xs font-bold text-foreground mb-1.5">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        id="featureStatus"
                                        {...register("status")}
                                        className="w-full appearance-none px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all cursor-pointer"
                                    >
                                        <option value="enabled">Enable</option>
                                        <option value="disabled">Disable</option>
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm"
                                >
                                    Add Feature
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
