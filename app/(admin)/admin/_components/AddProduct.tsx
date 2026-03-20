"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X, CheckCircle2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { addProduct } from "@/redux/adminSlice";
import { adminProductService } from "@/services/admin-product.service";
import AddProductVariantCard, {
  ProductVariantGroup,
  VariantImageItem,
  VariantSizeStock,
} from "./AddProductVariantCard";
import AddProductPreviewModal from "./AddProductPreviewModal";

type ArtisanStep = {
  title: string;
  description: string;
};

type BackendVariant = {
  color: string;
  size: string;
  price: number;
  stock: number;
  images: string[];
  sku: string | null;
  isActive: boolean;
};

const COLOR_OPTIONS = [
  "Rose Gold",
  "Silver",
  "Gold",
  "Black",
  "White",
  "Pink",
] as const;

const COLOR_SWATCH_MAP: Record<string, string> = {
  "rose gold": "#D9B08C",
  silver: "#C0C0C0",
  gold: "#F5C400",
  black: "#000000",
  white: "#FFFFFF",
  pink: "#E5649A",
};

const DEFAULT_SIZE_OPTIONS = [
  "14 Cm",
  "15 Cm",
  "16 Cm",
  "17 Cm",
  "18 Cm",
  "19 Cm",
  "20 Cm",
  "21 Cm",
  "22 Cm",
  "Free Size",
  "Adjustable",
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeColor = (value: string) => value.trim().toLowerCase();

const toNumber = (value: string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const buildFlatVariants = (
  groupedVariants: ProductVariantGroup[],
  regularPrice: string,
  salePrice: string,
): BackendVariant[] => {
  return groupedVariants.flatMap((variant: ProductVariantGroup) =>
    variant.sizes.map((sizeItem: VariantSizeStock) => ({
      color: normalizeColor(variant.color),
      size: sizeItem.size,
      price: salePrice.trim() ? toNumber(salePrice) : toNumber(regularPrice),
      stock: Number(sizeItem.stock) || 0,
      images: [],
      sku: null,
      isActive: true,
    })),
  );
};

export default function AddProduct() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [tags, setTags] = useState<string[]>(["Handmade", "Rose Gold", "Bracelet"]);
  const [newTag, setNewTag] = useState("");

  const [status, setStatus] = useState("Published");
  const [visibility, setVisibility] = useState("Public");
  const [isFeatured, setIsFeatured] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);

  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [material, setMaterial] = useState("");
  const [stockStatus, setStockStatus] = useState("In Stock");

  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [freeShipping, setFreeShipping] = useState(true);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [storyMedia, setStoryMedia] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [storyTags, setStoryTags] = useState("");
  const [featuredStory, setFeaturedStory] = useState("No");

  const [artisanSteps, setArtisanSteps] = useState<ArtisanStep[]>([
    {
      title: "Design & Concept",
      description:
        "Each design begins with sketches inspired by nature, art, and emotion. Sarah carefully plans every curve and detail.",
    },
  ]);

  const [storySettings, setStorySettings] = useState({
    displayStory: true,
    showArtisanBadge: true,
    showTimeline: true,
    showQuote: true,
  });

  const [variants, setVariants] = useState<ProductVariantGroup[]>([]);
  const [customColorName, setCustomColorName] = useState("");
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, string>>({});

  const triggerToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = newTag.trim();
    if (!value) return;

    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setNewTag("");
      return;
    }

    setTags((prev) => [...prev, value]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const addVariantColor = (colorName: string) => {
    const normalized = colorName.trim();
    if (!normalized) return;

    setVariants((prev) => {
      const exists = prev.some(
        (variant) => variant.color.toLowerCase() === normalized.toLowerCase(),
      );
      if (exists) return prev;

      return [
        ...prev.map((variant) => ({ ...variant, expanded: false })),
        {
          id: makeId(),
          color: normalized,
          sizes: [],
          images: [],
          expanded: true,
        },
      ];
    });
  };

  const addCustomColor = () => {
    const value = customColorName.trim();
    if (!value) {
      triggerToast("Please enter a color name", "error");
      return;
    }
    addVariantColor(value);
    setCustomColorName("");
  };

  const removeVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
    setCustomSizeInputs((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  };

  const toggleVariantExpanded = (variantId: string) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? { ...variant, expanded: !variant.expanded }
          : { ...variant, expanded: false },
      ),
    );
  };

  const toggleSizeForVariant = (variantId: string, size: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        const exists = variant.sizes.some((entry) => entry.size === size);

        if (exists) {
          return {
            ...variant,
            sizes: variant.sizes.filter((entry) => entry.size !== size),
          };
        }

        return {
          ...variant,
          sizes: [...variant.sizes, { size, stock: 0 }],
        };
      }),
    );
  };

  const addCustomSizeToVariant = (variantId: string) => {
    const sizeValue = (customSizeInputs[variantId] || "").trim();
    if (!sizeValue) return;

    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        const exists = variant.sizes.some(
          (entry) => entry.size.toLowerCase() === sizeValue.toLowerCase(),
        );

        if (exists) return variant;

        return {
          ...variant,
          sizes: [...variant.sizes, { size: sizeValue, stock: 0 }],
        };
      }),
    );

    setCustomSizeInputs((prev) => ({
      ...prev,
      [variantId]: "",
    }));
  };

  const updateVariantStock = (variantId: string, size: string, stock: number) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        return {
          ...variant,
          sizes: variant.sizes.map((entry) =>
            entry.size === size ? { ...entry, stock } : entry,
          ),
        };
      }),
    );
  };

  const handleVariantImagesChange = (
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const newImages: VariantImageItem[] = files.map((file: File) => ({
      id: makeId(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        return {
          ...variant,
          images: [...variant.images, ...newImages].slice(0, 8),
        };
      }),
    );

    e.target.value = "";
  };

  const removeVariantImage = (variantId: string, imageId: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        const imageToDelete = variant.images.find((img) => img.id === imageId);
        if (imageToDelete?.preview) {
          URL.revokeObjectURL(imageToDelete.preview);
        }

        return {
          ...variant,
          images: variant.images.filter((img) => img.id !== imageId),
        };
      }),
    );
  };

  const handleAddArtisanStep = () => {
    setArtisanSteps((prev) => [...prev, { title: "", description: "" }]);
  };

  const updateArtisanStep = (
    index: number,
    field: keyof ArtisanStep,
    value: string,
  ) => {
    setArtisanSteps((prev) =>
      prev.map((step, idx) => (idx === index ? { ...step, [field]: value } : step)),
    );
  };

  const summary = useMemo(() => {
    const totalImages = variants.reduce(
      (sum, variant) => sum + variant.images.length,
      0,
    );
    const totalSkus = variants.reduce(
      (sum, variant) => sum + variant.sizes.length,
      0,
    );

    return {
      colors: variants.length,
      totalImages,
      totalSkus,
    };
  }, [variants]);

  const validateForm = () => {
    if (!name.trim()) return "Product name is required";
    if (!description.trim()) return "Description is required";
    if (!category.trim()) return "Category is required";
    if (!regularPrice.trim()) return "Regular price is required";
    if (!material.trim()) return "Material is required";
    if (variants.length === 0) return "Please add at least one color";

    const emptyVariant = variants.find((variant) => variant.sizes.length === 0);
    if (emptyVariant) {
      return `Please select at least one size for ${emptyVariant.color}`;
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      triggerToast(validationError, "error");
      return;
    }

    try {
      setIsLoading(true);

      const flatVariants = buildFlatVariants(variants, regularPrice, salePrice);
      const totalStock = flatVariants.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0,
      );

      const allVariantImages = variants.flatMap((variant) => variant.images);
      const mainImage = allVariantImages[0]?.preview || null;
      const galleryImages = allVariantImages.slice(1).map((image) => image.preview);

      const minVariantPrice =
        flatVariants.length > 0
          ? Math.min(...flatVariants.map((variant) => variant.price))
          : toNumber(salePrice || regularPrice);

      const payload = {
        productName: name.trim(),
        category: category.trim(),
        subCategory: subCategory.trim() || null,
        description: description.trim(),

        price: minVariantPrice,
        originalPrice: regularPrice.trim() ? toNumber(regularPrice) : null,
        offerPercentage: discountPercent.trim() ? toNumber(discountPercent) : null,
        taxIncluded: false,

        mainImage,
        galleryImages,

        variants: flatVariants,

        stock: totalStock,
        rating: 0,
        reviewCount: 0,
        isActive: status === "Published",
        isDeleted: false,

        story: storyContent.trim(),
        storyMedia: storyTitle.trim() || null,

        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,

        material: material.trim(),
        stockStatus,
        shipping: {
          weight: weight.trim() || null,
          length: length.trim() || null,
          width: width.trim() || null,
          height: height.trim() || null,
          freeShipping,
        },
        publishSettings: {
          status,
          visibility,
          featuredProduct: isFeatured,
          enableReviews: reviewsEnabled,
        },
        storySettings,
        artisanSteps,
        quoteText: quoteText.trim(),
        quoteAuthor: quoteAuthor.trim(),
        storyTags: storyTags.trim(),
        featuredStory,
        tags,
      };

      const created = await adminProductService.create(payload);
      const createdData = created?.data ?? created;

      dispatch(
        addProduct({
          _id:
            createdData?._id ||
            createdData?.id ||
            `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          id:
            createdData?.productId ||
            `#PRD-${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0")}`,
          name,
          price: minVariantPrice,
          category,
          subCategory,
          material,
          tags,
          variants: createdData?.variants || flatVariants,
          colors: variants.map((variant) => variant.color),
          isFeatured,
          reviewsEnabled,
          freeShipping,
          status: status === "Draft" ? "Draft" : "Active",
          totalSales: 0,
          totalRevenue: 0,
          imageUrl:
            createdData?.mainImage ||
            createdData?.images?.[0]?.url ||
            mainImage,
        }),
      );

      triggerToast("Product added successfully", "success");

      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (err: unknown) {
      const apiMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (err as any).response?.data?.message
          : undefined;

      const message =
        apiMessage ||
        (err instanceof Error ? err.message : "Something went wrong");

      setError(message);
      triggerToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl pb-20 font-sans"
      >
        {error && (
          <div className="mb-6 rounded-xl bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div
          className={`fixed bottom-5 left-1/2 z-100 -translate-x-1/2 transition-all duration-300 sm:left-auto sm:right-6 sm:translate-x-0 ${
            toast.show
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <div className="flex min-w-65 max-w-[88vw] items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.13)]">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
              ) : (
                <X size={14} className="text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-sm font-bold text-gray-900">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="truncate text-xs text-gray-500">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Basic Information</h3>
              <p className="mb-6 text-xs text-gray-500">
                Fill in the basic details of your product
              </p>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g., Delicate Rose Bracelet"
                    className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Write a detailed description of your product..."
                    className="w-full resize-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-900">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                      >
                        <option value="">Select Category</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Rings">Rings</option>
                        <option value="Earrings">Earrings</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-900">
                      Sub-Category
                    </label>
                    <div className="relative">
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                      >
                        <option value="">Select Sub-Category</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Rings">Rings</option>
                        <option value="Earrings">Earrings</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Tags
                  </label>
                  <div className="flex min-h-13 flex-wrap items-center gap-2 rounded-xl border border-pink-200 bg-[#FDF2F5] p-3 focus-within:border-[#E91E63] focus-within:ring-1 focus-within:ring-[#E91E63]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-[#E91E63] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:opacity-80"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      type="text"
                      placeholder="Add a tag..."
                      className="min-w-30 flex-1 bg-transparent px-1 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Pricing & Inventory</h3>
              <p className="mb-6 text-xs text-gray-500">
                Set your product pricing and stock details
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-900">
                      Regular Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₹
                      </span>
                      <input
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] py-3 pl-8 pr-4 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-900">
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₹
                      </span>
                      <input
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] py-3 pl-8 pr-4 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="e.g., 15"
                      className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    type="text"
                    placeholder="e.g. beads"
                    className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Stock Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Story Header</h3>
              <p className="mb-6 text-xs text-gray-500">
                Main title for the story section
              </p>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Story Title
                  </label>
                  <input
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    type="text"
                    placeholder="The Story Behind This Treasure"
                    className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Story Content
                  </label>
                  <textarea
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Quote Text
                  </label>
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Quote Author
                  </label>
                  <input
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    type="text"
                    className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Artisan Information</h3>

              <div className="space-y-4">
                {artisanSteps.map((step, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl border border-[#F1E3E8] bg-[#FCF8FA] p-5"
                  >
                    <div className="absolute left-4 -top-3 rounded-full bg-[#E91E63] px-2 py-1 text-[10px] font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="mt-2 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-gray-900">
                          Step Title
                        </label>
                        <input
                          value={step.title}
                          onChange={(e) =>
                            updateArtisanStep(index, "title", e.target.value)
                          }
                          type="text"
                          className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-gray-900">
                          Step Description
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            updateArtisanStep(index, "description", e.target.value)
                          }
                          rows={2}
                          className="w-full resize-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddArtisanStep}
                  className="w-full rounded-xl border-2 border-dashed border-pink-300 bg-[#FDF2F5] py-3 text-xs font-bold text-[#E91E63] hover:bg-pink-100"
                >
                  + Add Another Step
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Product Variants</h3>
              <p className="mb-6 text-xs text-gray-500">
                Add color and size options for your product
              </p>

              <div className="mb-6 border-b border-[#F1E3E8] pb-6">
                <p className="mb-3 text-sm font-semibold text-gray-900">Add Color</p>

                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((colorName) => {
                    const isSelected = variants.some(
                      (variant) =>
                        variant.color.toLowerCase() === colorName.toLowerCase(),
                    );

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => addVariantColor(colorName)}
                        title={colorName}
                        className={`relative h-11 w-11 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-[#E91E63] scale-105"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <div
                          className={`h-full w-full rounded-lg ${
                            colorName === "White" ? "border border-gray-200" : ""
                          }`}
                          style={{
                            backgroundColor:
                              COLOR_SWATCH_MAP[colorName.toLowerCase()] || "#E5E7EB",
                          }}
                        />
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E91E63] text-[10px] text-white">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Add Color Name"
                      className="w-40 rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="rounded-xl border border-dashed border-pink-300 bg-pink-50 px-4 py-3 text-xs font-bold text-[#E91E63] hover:bg-pink-100"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {variants.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold text-gray-900">Selected Colors</p>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2"
                        >
                          <div
                            className="h-6 w-6 rounded-md border border-gray-200"
                            style={{
                              backgroundColor:
                                COLOR_SWATCH_MAP[variant.color.toLowerCase()] || "#E5E7EB",
                            }}
                          />
                          <p className="text-xs font-semibold text-gray-900">
                            {variant.color}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Size Per Color</h3>
              <p className="mb-6 text-xs text-gray-500">
                Each color can have different sizes — click a color to expand and choose its sizes
              </p>

              <div className="space-y-5">
                {variants.map((variant) => (
                  <AddProductVariantCard
                    key={variant.id}
                    variant={variant}
                    defaultSizeOptions={DEFAULT_SIZE_OPTIONS}
                    customSizeValue={customSizeInputs[variant.id] || ""}
                    setCustomSizeValue={(value) =>
                      setCustomSizeInputs((prev) => ({
                        ...prev,
                        [variant.id]: value,
                      }))
                    }
                    onToggleExpanded={() => toggleVariantExpanded(variant.id)}
                    onRemove={() => removeVariant(variant.id)}
                    onToggleSize={(size) => toggleSizeForVariant(variant.id, size)}
                    onAddCustomSize={() => addCustomSizeToVariant(variant.id)}
                    onUpdateStock={(size, stock) =>
                      updateVariantStock(variant.id, size, stock)
                    }
                    onVariantImagesChange={(e) => handleVariantImagesChange(variant.id, e)}
                    onRemoveVariantImage={(imageId) =>
                      removeVariantImage(variant.id, imageId)
                    }
                    colorSwatchMap={COLOR_SWATCH_MAP}
                  />
                ))}
              </div>

              {variants.length === 0 && (
                <div className="rounded-xl border border-dashed border-pink-300 bg-pink-50 p-5 text-sm text-[#E91E63]">
                  Add at least one color to start creating product variants.
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-[#E91E63] bg-white py-3.5 text-sm font-bold text-[#E91E63] hover:bg-pink-50 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 rounded-xl bg-[#E91E63] py-3.5 text-sm font-bold text-white hover:bg-[#C83B61]"
                >
                  Preview Product
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Publish Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-900">
                    Visibility
                  </label>
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFeatured((prev) => !prev)}
                      className={`flex h-7 w-12 items-center rounded-full p-1 ${
                        isFeatured ? "bg-[#E91E63]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          isFeatured ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      Featured Product
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewsEnabled((prev) => !prev)}
                      className={`flex h-7 w-12 items-center rounded-full p-1 ${
                        reviewsEnabled ? "bg-[#E91E63]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          reviewsEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      Enable Reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Shipping</h3>

              <div className="space-y-4">
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  type="text"
                  placeholder="Weight"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />

                <input
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  type="text"
                  placeholder="Length"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />

                <input
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  type="text"
                  placeholder="Width"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />

                <input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  type="text"
                  placeholder="Height"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFreeShipping((prev) => !prev)}
                    className={`flex h-7 w-12 items-center rounded-full p-1 ${
                      freeShipping ? "bg-[#E91E63]" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        freeShipping ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Free Shipping
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">SEO</h3>

              <div className="space-y-4">
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  type="text"
                  placeholder="Meta Title"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Meta Description"
                  className="w-full resize-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Story Settings</h3>

              <div className="space-y-4">
                {(
                  [
                    { key: "displayStory", label: "Display Story on Product Page" },
                    { key: "showArtisanBadge", label: "Show Artisan Badge" },
                    { key: "showTimeline", label: "Show Timeline Section" },
                    { key: "showQuote", label: "Show Quote Section" },
                  ] as {
                    key: keyof typeof storySettings;
                    label: string;
                  }[]
                ).map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setStorySettings((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`flex h-7 w-12 items-center rounded-full p-1 ${
                        storySettings[item.key] ? "bg-[#E91E63]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          storySettings[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-gray-900">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Tags & Keywords</h3>

              <div className="space-y-4">
                <input
                  value={storyTags}
                  onChange={(e) => setStoryTags(e.target.value)}
                  type="text"
                  placeholder="handmade, artisan, jewelry"
                  className="w-full rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                />

                <div className="relative">
                  <select
                    value={featuredStory}
                    onChange={(e) => setFeaturedStory(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-2.5 text-sm focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F1E3E8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-500">Colours</span>
                  <span className="font-semibold text-[#E91E63]">
                    {summary.colors} Selected
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-500">Total SKUs</span>
                  <span className="font-semibold text-[#E91E63]">
                    {summary.totalSkus} Size pairs
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Images</span>
                  <span className="font-semibold text-[#E91E63]">
                    {summary.totalImages}/8
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-300 bg-[#FDF2F5] py-3 text-xs font-bold text-[#E91E63] hover:bg-pink-100"
              >
                <Eye size={14} />
                Preview Product
              </button>
            </div>
          </div>
        </div>
      </form>

      <AddProductPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        name={name}
        description={description}
        category={category}
        tags={tags}
        regularPrice={regularPrice}
        salePrice={salePrice}
        discountPercent={discountPercent}
        status={status}
        story={storyContent}
        storyTitle={storyTitle}
        variants={variants}
        colorSwatchMap={COLOR_SWATCH_MAP}
      />
    </>
  );
}