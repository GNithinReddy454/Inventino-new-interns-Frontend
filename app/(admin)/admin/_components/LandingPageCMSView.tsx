import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Plus, Trash2, Upload } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toggle from "./Toggle";
import { useToast } from "@/app/components/GlobalToast";

const featureSchema = z.object({
    title: z.string().min(3, "Feature title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    status: z.enum(["enabled", "disabled"]),
});

type FeatureFormData = z.infer<typeof featureSchema>;

export default function LandingPageCMSView() {
    const [offerText, setOfferText] = useState(
        "Free Shipping on Orders Over $50! Limited Time Offer",
    );
    const [showOfferBar, setShowOfferBar] = useState(true);
    const [bannerHeading, setBannerHeading] = useState("Created with love");
    const [bannerText, setBannerText] = useState(
        "Made for you with passion and dedication. Each piece tells a unique story.",
    );
    const [bannerImage, setBannerImage] = useState<string | null>(null);

    const [features, setFeatures] = useState([
        {
            id: 1,
            title: "Virtual Try-On",
            description:
                "Experience our products virtually before making a purchase. Use AR technology to see how items look in your space.",
            enabled: true,
        },
        {
            id: 2,
            title: "Book Try at Home",
            description: "Schedule a doorstep trial of your favorite jewellery.",
            enabled: true,
        },
        {
            id: 3,
            title: "Talk to an Expert",
            description: "Need guidance? Speak to our jewellery consultant.",
            enabled: false,
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const { showToast } = useToast();

    // Loading states for mock saves
    const [savingOffer, setSavingOffer] = useState(false);
    const [savingBanner, setSavingBanner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
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

    const toggleFeature = (id: number) => {
        setFeatures((prev) =>
            prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        );
    };

    const openAddModal = () => {
        reset({ title: "", description: "", status: "enabled" });
        setShowAddModal(true);
    };

    const onAddFeature = (data: FeatureFormData) => {
        setFeatures((prev) => [
            ...prev,
            {
                id: Date.now(),
                title: data.title,
                description: data.description,
                enabled: data.status === "enabled",
            },
        ]);
        reset();
        setShowAddModal(false);
    };

    const removeFeature = (id: number) => {
        setFeatures((prev) => prev.filter((f) => f.id !== id));
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
        await new Promise(r => setTimeout(r, 600));
        setSavingOffer(false);
        showToast("Success", "Offer bar settings saved!", "success");
    };

    const handleSaveBanner = async () => {
        setSavingBanner(true);
        await new Promise(r => setTimeout(r, 800));
        setSavingBanner(false);
        showToast("Success", "Hero banner updated successfully!", "success");
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

            {/* 3. FEATURES MANAGEMENT */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <h3 className="font-bold text-foreground text-base">
                            Features Management
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage the &apos;Why Buy Here&apos; section features
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#DF4C77] text-white text-xs font-bold rounded-lg hover:bg-[#C83B61] transition-all shadow-sm"
                    >
                        <Plus size={14} /> Add New Feature
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start justify-between gap-4 p-4 border border-border rounded-xl mb-3">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-4/5" />
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="w-10 h-5 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="space-y-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    className="flex items-start justify-between gap-4 p-4 border border-pink-200 bg-[#FDF2F5] rounded-xl hover:border-[#E91E63] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-gray-900 mb-1">
                                            {feature.title}
                                        </p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => removeFeature(feature.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove feature"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <Toggle
                                            enabled={feature.enabled}
                                            onToggle={() => toggleFeature(feature.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
