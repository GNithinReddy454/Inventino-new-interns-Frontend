import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Upload, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toggle from "./Toggle";
import { useToast } from "@/app/components/GlobalToast";
import { getCMSData, updateCMSData, getActiveBanners, createBanner, updateBanner, deleteBanner, getAdminCategories, createCategory, updateCategory, deleteCategory } from "@/services/admin.service";
import type { Banner, Category } from "@/services/admin.service";
import axios from "axios";

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
    const [banners, setBanners] = useState<Banner[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [bannerHeading, setBannerHeading] = useState("");
    const [bannerText, setBannerText] = useState("");
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
    const [activeBannerId, setActiveBannerId] = useState<string | null>(null);
    const [features, setFeatures] = useState<Array<{ id: number; title: string; description: string; enabled: boolean; icon: string }>>(DEFAULT_FEATURES);
    const [showAddModal, setShowAddModal] = useState(false);
    const { showToast } = useToast();
    const [savingOffer, setSavingOffer] = useState(false);
    const [savingBanner, setSavingBanner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categoryActive, setCategoryActive] = useState(true);
    const [savingCategory, setSavingCategory] = useState(false);

    // Fetch CMS data on mount
    useEffect(() => {
        const fetchCMS = async () => {
            setIsLoading(true);
            try {
                const [cms, fetchedBanners] = await Promise.all([getCMSData(), getActiveBanners()]);
                if (cms) {
                    setOfferText(cms.offerBar.text);
                    setShowOfferBar(cms.offerBar.isActive);
                }
                if (fetchedBanners && fetchedBanners.length > 0) {
                    setBanners(fetchedBanners);
                }
                // Fetch categories
                const catResult = await getAdminCategories();
                if (catResult?.items) {
                    setCategories(catResult.items);
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
            setBannerImageFile(file);
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

    const resolveImageUrl = (imagePath: string | null | undefined): string | null => {
        if (!imagePath) return null;
        if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
        const serverOrigin = apiBase.replace(/\/api$/, "");
        return `${serverOrigin}${imagePath}`;
    };

    const startEditBanner = (index: number) => {
        const b = banners[index];
        setEditingIndex(index);
        setActiveBannerId(b._id);
        setBannerHeading(b.title ?? "");
        setBannerText(b.link ?? "");
        setBannerImage(resolveImageUrl(b.image) || null);
        setBannerImageFile(null);
    };

    const startNewBanner = () => {
        setEditingIndex(null);
        setActiveBannerId(null);
        setBannerHeading("");
        setBannerText("");
        setBannerImage(null);
        setBannerImageFile(null);
    };

    const handleDeleteBanner = async (id: string) => {
        try {
            await deleteBanner(id);
            setBanners(prev => prev.filter(b => b._id !== id));
            if (activeBannerId === id) startNewBanner();
            showToast("Success", "Banner deleted successfully!", "success");
        } catch (err) {
            console.error("Failed to delete banner:", err);
            showToast("Error", "Failed to delete banner.", "error");
        }
    };

    const refetchBanners = async () => {
        const fresh = await getActiveBanners();
        if (fresh) setBanners(fresh);
    };

    const handleSaveBanner = async () => {
        if (!bannerHeading.trim()) {
            showToast("Error", "Banner heading is required.", "error");
            return;
        }
        setSavingBanner(true);
        try {
            const formData = new FormData();
            formData.append("title", bannerHeading);
            formData.append("link", bannerText);
            formData.append("isActive", "true");
            if (bannerImageFile) formData.append("image", bannerImageFile);

            if (activeBannerId) {
                const updated = await updateBanner(activeBannerId, formData);
                if (!updated) {
                    showToast("Error", "Failed to update banner.", "error");
                    return;
                }
                showToast("Success", "Banner updated successfully!", "success");
            } else {
                const created = await createBanner(formData);
                if (!created?._id) {
                    showToast("Error", "Failed to create banner.", "error");
                    return;
                }
                setActiveBannerId(created._id);
                showToast("Success", "New banner created! It will now appear on the homepage.", "success");
            }
            await refetchBanners();
        } catch (err) {
            console.error("Failed to save banner:", err);
            showToast("Error", "Failed to save banner.", "error");
        } finally {
            setSavingBanner(false);
        }
    };

    // ── Category Handlers ─────────────────────────────────────────────────────

    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setCategoryName("");
        setCategoryDescription("");
        setCategoryActive(true);
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setCategoryDescription(cat.description ?? "");
        setCategoryActive(cat.isActive);
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
    };

    const refetchCategories = async () => {
        const catResult = await getAdminCategories();
        if (catResult?.items) setCategories(catResult.items);
    };

    const getErrorMessage = (err: unknown, fallback: string): string => {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.message || fallback;
        }
        return fallback;
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            showToast("Error", "Category name is required.", "error");
            return;
        }
        setSavingCategory(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.categoryId, {
                    name: categoryName,
                    description: categoryDescription,
                    isActive: categoryActive,
                });
                showToast("Success", "Category updated successfully!", "success");
            } else {
                await createCategory({
                    name: categoryName,
                    description: categoryDescription,
                    isActive: categoryActive,
                });
                showToast("Success", "Category created successfully!", "success");
            }
            await refetchCategories();
            closeCategoryModal();
        } catch (err) {
            console.error("Failed to save category:", err);
            const msg = getErrorMessage(err, editingCategory ? "Failed to update category." : "Failed to create category.");
            showToast("Error", msg, "error");
        } finally {
            setSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteCategory(categoryId);
            setCategories(prev => prev.filter(c => c.categoryId !== categoryId));
            showToast("Success", "Category deleted successfully!", "success");
        } catch (err) {
            console.error("Failed to delete category:", err);
            showToast("Error", getErrorMessage(err, "Failed to delete category."), "error");
        }
    };

    const handleToggleCategoryActive = async (cat: Category) => {
        try {
            await updateCategory(cat.categoryId, { isActive: !cat.isActive });
            await refetchCategories();
        } catch (err) {
            console.error("Failed to toggle category:", err);
            showToast("Error", getErrorMessage(err, "Failed to toggle category."), "error");
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
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h3 className="font-bold text-foreground text-base">
                            Hero Banner Management
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage your landing page banner carousel
                        </p>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={startNewBanner}
                            className="px-5 py-2.5 bg-[#DF4C77] text-white text-[13px] font-bold rounded-xl hover:bg-[#C83B61] transition-all shadow-sm shrink-0"
                        >
                            + Add New Banner
                        </button>
                    )}
                </div>

                {/* Existing Banners List */}
                {!isLoading && banners.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-bold text-foreground mb-2">Existing Banners ({banners.length})</p>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                            {banners.map((b, idx) => (
                                <div
                                    key={b._id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                        activeBannerId === b._id
                                            ? "border-[#DF4C77] bg-[#FDF2F5]"
                                            : "border-border bg-white hover:border-pink-200"
                                    }`}
                                    onClick={() => startEditBanner(idx)}
                                    onKeyDown={(e) => handleDivKeyDown(e, () => startEditBanner(idx))}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {b.image && (
                                        <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            <img
                                                src={resolveImageUrl(b.image) || ""}
                                                alt={b.title || "Banner"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-foreground truncate">{b.title || "Untitled Banner"}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{b.link || "No description"}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteBanner(b._id); }}
                                        className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all shrink-0"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-border pt-5">
                    <p className="text-xs font-bold text-foreground mb-3">
                        {activeBannerId ? "Edit Banner" : "New Banner"}
                    </p>
                </div>

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
                                            unoptimized
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
                                onClick={startNewBanner}
                                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveBanner}
                                disabled={savingBanner}
                                className="flex-1 py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm disabled:opacity-70"
                            >
                                {savingBanner ? "Saving..." : activeBannerId ? "Update Banner" : "Create Banner"}
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
                            Manage categories displayed on your landing page
                        </p>
                    </div>
                    <button
                        onClick={openAddCategoryModal}
                        className="px-5 py-2.5 bg-[#DF4C77] text-white text-[13px] font-bold rounded-xl hover:bg-[#C83B61] transition-all shadow-sm shrink-0"
                    >
                        + Add New Category
                    </button>
                </div>

                {isLoading ? (
                    <div className="bg-[#FDF2F5] border border-pink-200 rounded-2xl p-6">
                        <Skeleton className="h-3 w-32 mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#FDF2F5] border border-pink-200 rounded-2xl p-6 relative">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
                            <Eye size={12} className="text-muted-foreground" /> CATEGORY PREVIEW
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-10 text-sm text-muted-foreground">
                                No categories found. Click &quot;+ Add New Category&quot; to create one.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.categoryId}
                                        className={`bg-white rounded-xl py-5 px-4 flex flex-col items-center justify-center shadow-sm border transition-all relative group ${
                                            cat.isActive ? "border-transparent hover:border-pink-200" : "border-dashed border-gray-300 opacity-60"
                                        }`}
                                    >
                                        {/* Action buttons */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditCategoryModal(cat)}
                                                className="p-1 rounded-md hover:bg-pink-50 text-muted-foreground hover:text-[#DF4C77] transition-colors"
                                                title="Edit category"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.categoryId)}
                                                className="p-1 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                                                title="Delete category"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>

                                        {/* Active/Inactive indicator */}
                                        <div className="absolute top-2 left-2">
                                            <button
                                                onClick={() => handleToggleCategoryActive(cat)}
                                                className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-green-400" : "bg-gray-300"}`}
                                                title={cat.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                                            />
                                        </div>

                                        {cat.image?.url ? (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden mb-2.5">
                                                <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-2xl mb-2.5">📦</span>
                                        )}
                                        <span className="text-[13px] font-bold text-foreground text-center">{cat.name}</span>
                                        {cat.productCount !== undefined && (
                                            <span className="text-[10px] text-muted-foreground mt-1">{cat.productCount} products</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
                            {(
                                [
                                    { id: 1, name: "Handmade Rose Gold Bracelet", price: "$34.99", stock: 45, color: "bg-[#D9A16C]", selected: false },
                                    { id: 2, name: "Pearl Necklace Set", price: "$129.99", stock: 8, color: "bg-[#BCC4C9]", selected: true },
                                    { id: 3, name: "Boho Beaded Bracelet", price: "$44.99", stock: 32, color: "bg-[#45AF4A]", selected: false },
                                    { id: 4, name: "Leather Tote Bag", price: "$159.99", stock: 15, color: "bg-[#FF67A1]", selected: false },
                                    { id: 5, name: "Gold Plated Earrings", price: "$94.99", stock: 12, color: "bg-[#FFDA00]", selected: false },
                                ] as Array<{
                                    id: number;
                                    name: string;
                                    price: string;
                                    stock: number;
                                    color: string;
                                    selected: boolean;
                                    imageUrl?: string;
                                    image?: string;
                                    images?: Array<{ url?: string } | string>;
                                }>
                            ).map((prod) => {
                                const firstImage = prod.images?.[0];
                                const src =
                                    prod.imageUrl ||
                                    prod.image ||
                                    (typeof firstImage === "string" ? firstImage : firstImage?.url);

                                return (
                                <div key={prod.id} className={`flex items-center gap-4 p-3.5 rounded-xl border ${prod.selected ? 'border-[#DF4C77] bg-[#FDF2F5]' : 'border-border bg-white'} cursor-pointer hover:border-pink-200 transition-colors shadow-sm`}>
                                    <div className={`w-14 h-14 rounded-lg shrink-0 overflow-hidden ${prod.color}`}>
                                        {src ? (
                                            <img
                                                src={src}
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
                                );
                            })}
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

            {/* --- CATEGORY MODAL --- */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        role="button"
                        tabIndex={0}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeCategoryModal}
                        onKeyDown={(e) => handleDivKeyDown(e, closeCategoryModal)}
                        aria-label="Close modal"
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10">
                        <button
                            onClick={closeCategoryModal}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-xl font-bold text-foreground text-center mb-6">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                        </h2>

                        <div className="mb-4">
                            <label htmlFor="categoryName" className="block text-xs font-bold text-foreground mb-1.5">
                                Category Name <span className="text-primary">*</span>
                            </label>
                            <input
                                id="categoryName"
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Jewelry, Bags, Textiles"
                                className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="categoryDesc" className="block text-xs font-bold text-foreground mb-1.5">
                                Description
                            </label>
                            <textarea
                                id="categoryDesc"
                                rows={3}
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                                placeholder="Brief description of this category"
                                className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                            />
                        </div>

                        <div className="mb-6 flex items-center justify-between">
                            <label htmlFor="categoryActiveToggle" className="text-xs font-bold text-foreground">
                                Active on Landing Page
                            </label>
                            <Toggle
                                enabled={categoryActive}
                                onToggle={() => setCategoryActive(!categoryActive)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={closeCategoryModal}
                                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCategory}
                                disabled={savingCategory}
                                className="flex-1 py-2.5 bg-[#DF4C77] text-white rounded-xl text-sm font-bold hover:bg-[#C83B61] transition-all shadow-sm disabled:opacity-70"
                            >
                                {savingCategory ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
