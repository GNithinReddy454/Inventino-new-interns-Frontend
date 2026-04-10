"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  X,
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { addProduct } from "@/redux/adminSlice";
import { adminProductService } from "@/services/admin-product.service";
import { getCategories } from "@/services/admin.service";
import AddProductVariantCard, {
  ProductVariantGroup,
  VariantImageItem,
} from "./AddProductVariantCard";
import AddProductPreviewModal from "../products/AddProductPreviewModal";

type ArtisanStep = {
  title: string;
  description: string;
};

type CategoryItem = {
  _id?: string;
  categoryId?: string;
  name: string;
  isActive?: boolean;
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

const toNumber = (value: string | number | undefined | null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex h-5 w-8 items-center rounded-full p-0.5 transition ${
        checked ? "bg-[#EB5C8A]" : "bg-[#D7D5D9]"
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-3" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[#F0E3E7] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(31,23,40,0.04)]">
      <h3 className="text-[14px] font-semibold text-[#1C1630]">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-[10px] text-[#9A93A3]">{subtitle}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Label({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold text-[#4B4453]">
      {children}
      {required ? <span className="text-[#EB5C8A]"> *</span> : null}
    </label>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    prefix?: string;
    suffix?: string;
  }
) {
  const { prefix, suffix, className = "", ...rest } = props;
  return (
    <div className="relative">
      {prefix ? (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#A199A7]">
          {prefix}
        </span>
      ) : null}
      <input
        {...rest}
        className={`h-9.5 w-full rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] text-[#1C1630] placeholder:text-[#B5AEB8] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A] ${
          prefix ? "pl-7" : ""
        } ${suffix ? "pr-8" : ""} ${className}`}
      />
      {suffix ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#A199A7]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full resize-none rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 py-2.5 text-[12px] text-[#1C1630] placeholder:text-[#B5AEB8] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A] ${className}`}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9.5 w-full appearance-none rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 pr-9 text-[12px] text-[#1C1630] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A199A7]"
      />
    </div>
  );
}

export default function AddProduct() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

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
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [storyTags, setStoryTags] = useState("");
  const [featuredStory, setFeaturedStory] = useState("No");

  const [artisanSteps, setArtisanSteps] = useState<ArtisanStep[]>([
    {
      title: "Design & Concept",
      description:
        "Each design begins with sketches inspired by nature, art, and emotion.",
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
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, string>>(
    {}
  );

useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await getCategories();
      console.log("FULL CATEGORY RESPONSE:", response);

      const responseAny = response as any;

      const rawItems =
        responseAny?.items ||
        responseAny?.data?.items ||
        responseAny?.data?.data?.items ||
        responseAny?.data ||
        [];

      const items = Array.isArray(rawItems) ? rawItems : [];

      const names = items
        .map((item: any) => item?.name?.trim())
        .filter(Boolean);

      setCategoryOptions(Array.from(new Set(names)));
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategoryOptions([]);
    }
  };

  loadCategories();
}, []);
  useEffect(() => {
    return () => {
      variants.forEach((variant) => {
        variant.images.forEach((image) => {
          if (image.preview) URL.revokeObjectURL(image.preview);
        });
      });
    };
  }, [variants]);

  const triggerToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const unwrapApiData = <T = any,>(raw: any): T => {
    if (!raw) return raw as T;
    const level1 = raw?.data ?? raw;
    const level2 = level1?.data ?? level1;
    return level2 as T;
  };

  const extractPrimaryProduct = (raw: any): any => {
    const payload = unwrapApiData<any>(raw);

    if (Array.isArray(payload?.items) && payload.items.length > 0) {
      return payload.items[0];
    }

    if (Array.isArray(payload) && payload.length > 0) {
      return payload[0];
    }

    return payload;
  };

  const extractProductResourceId = (raw: any): string => {
    const product = extractPrimaryProduct(raw);
    return String(product?.productId || product?.id || product?._id || "");
  };

  const extractBatchUploadedUrls = (raw: any): string[] => {
    const product = extractPrimaryProduct(raw);

    const mainImage =
      typeof product?.media?.mainImage === "string" ? product.media.mainImage : "";

    const galleryImages = Array.isArray(product?.media?.galleryImages)
      ? product.media.galleryImages
          .map((img: any) => {
            if (typeof img === "string") return img;
            return img?.url || "";
          })
          .filter(Boolean)
      : [];

    const legacyImages = Array.isArray(product?.images)
      ? product.images
          .map((img: any) => {
            if (typeof img === "string") return img;
            return img?.url || "";
          })
          .filter(Boolean)
      : [];

    return Array.from(
      new Set([mainImage, ...galleryImages, ...legacyImages].filter(Boolean))
    );
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
        (variant) => variant.color.toLowerCase() === normalized.toLowerCase()
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
    setVariants((prev) => {
      const next = prev.filter((variant) => {
        if (variant.id === variantId) {
          variant.images.forEach((img) => {
            if (img.preview) URL.revokeObjectURL(img.preview);
          });
          return false;
        }
        return true;
      });
      return next;
    });

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
          : { ...variant, expanded: false }
      )
    );
  };

  const toggleSizeForVariant = (variantId: string, size: string) => {
    const defaultPrice = salePrice.trim()
      ? toNumber(salePrice)
      : toNumber(regularPrice);

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
          sizes: [
            ...variant.sizes,
            {
              size,
              price: defaultPrice,
              stock: 0,
              sku: `${variant.color}-${size}`.replace(/\s+/g, "-").toUpperCase(),
            },
          ],
        };
      })
    );
  };

  const addCustomSizeToVariant = (variantId: string) => {
    const sizeValue = (customSizeInputs[variantId] || "").trim();
    if (!sizeValue) return;

    const defaultPrice = salePrice.trim()
      ? toNumber(salePrice)
      : toNumber(regularPrice);

    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        const exists = variant.sizes.some(
          (entry) => entry.size.toLowerCase() === sizeValue.toLowerCase()
        );

        if (exists) return variant;

        return {
          ...variant,
          sizes: [
            ...variant.sizes,
            {
              size: sizeValue,
              price: defaultPrice,
              stock: 0,
              sku: `${variant.color}-${sizeValue}`
                .replace(/\s+/g, "-")
                .toUpperCase(),
            },
          ],
        };
      })
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
            entry.size === size ? { ...entry, stock } : entry
          ),
        };
      })
    );
  };

  const updateVariantSku = (variantId: string, size: string, sku: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        return {
          ...variant,
          sizes: variant.sizes.map((entry) =>
            entry.size === size ? { ...entry, sku } : entry
          ),
        };
      })
    );
  };

  const updateVariantPrice = (variantId: string, size: string, price: number) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;

        return {
          ...variant,
          sizes: variant.sizes.map((entry) =>
            entry.size === size ? { ...entry, price } : entry
          ),
        };
      })
    );
  };

  const handleVariantImagesChange = (
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>
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
      })
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
      })
    );
  };

  const handleAddArtisanStep = () => {
    setArtisanSteps((prev) => [...prev, { title: "", description: "" }]);
  };

  const updateArtisanStep = (
    index: number,
    field: keyof ArtisanStep,
    value: string
  ) => {
    setArtisanSteps((prev) =>
      prev.map((step, idx) => (idx === index ? { ...step, [field]: value } : step))
    );
  };

  const summary = useMemo(() => {
    const totalImages = variants.reduce(
      (sum, variant) => sum + variant.images.length,
      0
    );
    const totalSkus = variants.reduce(
      (sum, variant) => sum + variant.sizes.length,
      0
    );

    return {
      colors: variants.length,
      totalImages,
      totalSkus,
    };
  }, [variants]);

  const totalStock = useMemo(() => {
    return variants.reduce(
      (sum, variant) =>
        sum +
        variant.sizes.reduce(
          (inner, sizeItem) => inner + (Number(sizeItem.stock) || 0),
          0
        ),
      0
    );
  }, [variants]);

  const computedDiscountPercent = useMemo(() => {
    const reg = toNumber(regularPrice);
    const sale = toNumber(salePrice);
    if (reg > 0 && sale > 0 && sale < reg) {
      return Math.round(((reg - sale) / reg) * 100).toString();
    }
    return "";
  }, [regularPrice, salePrice]);

  const finalDiscountPercent = salePrice.trim() ? computedDiscountPercent : "";

  const validateForm = () => {
    if (!name.trim()) return "Product name is required";
    if (!description.trim()) return "Description is required";
    if (!category.trim()) return "Category is required";
    if (!regularPrice.trim()) return "Regular price is required";
    if (variants.length === 0) return "Please add at least one color";

    const emptyVariant = variants.find((variant) => variant.sizes.length === 0);
    if (emptyVariant) {
      return `Please select at least one size for ${emptyVariant.color}`;
    }

    const invalidStockVariant = variants.find((variant) =>
      variant.sizes.some((size) => Number.isNaN(Number(size.stock)))
    );

    if (invalidStockVariant) {
      return `Invalid stock value found in ${invalidStockVariant.color}`;
    }

    return "";
  };

  const buildPayloadForBackend = (uploadedUrlsByVariant: Record<string, string[]>) => {
    const effectivePrice = salePrice.trim()
      ? toNumber(salePrice)
      : toNumber(regularPrice);

    const originalPrice = regularPrice.trim() ? toNumber(regularPrice) : null;

    const flatUploadedImages = Object.values(uploadedUrlsByVariant)
      .flat()
      .filter(Boolean);

    const mainImage = flatUploadedImages[0] || null;

    const galleryImages = flatUploadedImages.slice(1).map((url) => ({
      id: makeId(),
      url,
    }));

    return {
      productName: name.trim(),
      category: category.trim(),
      description: description.trim(),

      pricing: {
        price: effectivePrice,
        originalPrice,
        offerPercentage: finalDiscountPercent
          ? Number(finalDiscountPercent)
          : null,
        taxIncluded: false,
      },

      media: {
        mainImage,
        galleryImages,
      },

      variants: variants.map((variant) => ({
        color: variant.color,
        colorCode: COLOR_SWATCH_MAP[variant.color.toLowerCase()] || "#E5E7EB",
        price: effectivePrice,
        images: (uploadedUrlsByVariant[variant.id] || []).filter(Boolean),
        sizes: variant.sizes.map((sizeItem) => ({
          size: sizeItem.size?.trim() || null,
          price: Number(sizeItem.price) || effectivePrice,
          stock: Number(sizeItem.stock) || 0,
          sku:
            sizeItem.sku?.trim() ||
            `${variant.color}-${sizeItem.size || "default"}`
              .replace(/\s+/g, "-")
              .toUpperCase(),
        })),
      })),

      totalStock,
      rating: 0,
      reviewCount: 0,

      story: storyContent.trim() || storyTitle.trim() || "",

      material: material.trim() || "",
      stockStatus,
      hashtags: tags,
      isActive: status === "Published",
      trendy: isFeatured,
      bestSeller: false,
      visibility,
      reviewsEnabled,

      shipping: {
        weight: weight.trim() || "",
        length: length.trim() || "",
        width: width.trim() || "",
        height: height.trim() || "",
        freeShipping,
      },

      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      subCategory: subCategory.trim(),
      quoteText: quoteText.trim(),
      quoteAuthor: quoteAuthor.trim(),
      storyTags: storyTags.trim(),
      artisanSteps: artisanSteps
        .filter((step) => step.title.trim() || step.description.trim())
        .map((step) => ({
          title: step.title.trim(),
          description: step.description.trim(),
        })),
      showArtisanBadge: storySettings.showArtisanBadge,
      showTimeline: storySettings.showTimeline,
      showQuote: storySettings.showQuote,
    };
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

      const effectivePrice = salePrice.trim()
        ? toNumber(salePrice)
        : toNumber(regularPrice);

      const createPayload = {
        name: name.trim(),
        description: description.trim(),
        price: effectivePrice,
        discountPrice: salePrice.trim() ? effectivePrice : undefined,
        category: category.trim(),
        material: material.trim() || "Material",
        stock: totalStock || 0,
      };

      const created = await adminProductService.create(createPayload);
      const productResourceId = extractProductResourceId(created);

      if (!productResourceId) {
        throw new Error("Product created but no product id was returned");
      }

      const uploadedUrlsByVariant: Record<string, string[]> = {};

      for (const variant of variants) {
        const validFiles = variant.images.filter((img) => img.file instanceof File);

        if (!validFiles.length) {
          uploadedUrlsByVariant[variant.id] = [];
          continue;
        }

        const formData = new FormData();
        validFiles.forEach((image) => {
          formData.append("images", image.file);
        });

        const imageResponse = await adminProductService.addImages(
          productResourceId,
          formData
        );

        const batchUrls = extractBatchUploadedUrls(imageResponse);

        if (!batchUrls.length) {
          uploadedUrlsByVariant[variant.id] = [];
        } else if (batchUrls.length >= validFiles.length) {
          uploadedUrlsByVariant[variant.id] = batchUrls.slice(-validFiles.length);
        } else {
          uploadedUrlsByVariant[variant.id] = batchUrls;
        }
      }

      const finalPayload = buildPayloadForBackend(uploadedUrlsByVariant);
      await adminProductService.update(productResourceId, finalPayload);

      const createdProduct = extractPrimaryProduct(created);

const serializableVariants = variants.map((variant) => ({
  id: variant.id,
  color: variant.color,
  expanded: variant.expanded,
  sizes: variant.sizes.map((sizeItem) => ({
    size: sizeItem.size,
    price: Number(sizeItem.price) || effectivePrice,
    stock: Number(sizeItem.stock) || 0,
    sku: sizeItem.sku || "",
  })),
  images: variant.images.map((image, index) => ({
    id: image.id,
    preview:
      uploadedUrlsByVariant[variant.id]?.[index] ||
      image.preview ||
      "",
  })),
}));

dispatch(
  addProduct({
    _id:
      createdProduct?._id ||
      `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    id:
      createdProduct?.productId ||
      createdProduct?._id ||
      String(productResourceId),
    name: name.trim(),
    price: effectivePrice,
    category: category.trim(),
    subCategory: subCategory.trim(),
    material: material.trim(),
    tags,
    variants: serializableVariants,
    colors: serializableVariants.map((variant) => variant.color),
    isFeatured,
    reviewsEnabled,
    freeShipping,
    status: status === "Draft" ? "Draft" : "Active",
    totalSales: 0,
    totalRevenue: 0,
    imageUrl:
      Object.values(uploadedUrlsByVariant).flat()[0] ||
      serializableVariants[0]?.images[0]?.preview ||
      "",
  })
);
      triggerToast("Product added successfully", "success");

      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      triggerToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl pb-20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1C1630]">
              Add Product
            </h1>
            <p className="mt-1 text-[12px] text-[#8E8794]">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex h-9.5 items-center justify-center rounded-[10px] border border-[#EADDE3] bg-white px-4 text-[12px] font-medium text-[#6D6776] hover:bg-[#FAF6F8]"
          >
            Cancel
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-[12px] bg-[#FDE8E8] px-4 py-3 text-[12px] text-[#D92D20]">
            {error}
          </div>
        ) : null}

        <div
          className={`fixed bottom-5 left-1/2 z-100 -translate-x-1/2 transition-all duration-300 sm:left-auto sm:right-6 sm:translate-x-0 ${
            toast.show
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <div className="flex min-w-65 max-w-[88vw] items-center gap-3 rounded-2xl border border-[#F0E4E8] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(31,23,40,0.12)]">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success" ? "bg-[#16A34A]" : "bg-[#E74C3C]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
              ) : (
                <X size={14} className="text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[13px] font-semibold text-[#1C1630]">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="truncate text-[11px] text-[#8E8794]">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-[#A8A1AD] hover:text-[#6D6776]"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_0.85fr]">
          <div className="space-y-4">
            <SectionCard
              title="Basic Information"
              subtitle="Fill in the basic details of your product"
            >
              <div className="space-y-4">
                <div>
                  <Label required>Product Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. Delicate Rose Bracelet"
                  />
                </div>

                <div>
                  <Label required>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Write a detailed description of your product..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label required>Category</Label>
                    <Select
                      value={category}
                      onChange={setCategory}
                      options={categoryOptions}
                      placeholder="Select Category"
                    />
                  </div>

                  <div>
                    <Label>Sub-Category</Label>
                    <Input
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="Select Sub-Category"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex min-h-10.5 flex-wrap items-center gap-2 rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 py-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-[#EB5C8A] px-2 py-1 text-[10px] font-medium text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="opacity-90 hover:opacity-100"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      type="text"
                      placeholder="Add a tag..."
                      className="min-w-30 flex-1 bg-transparent text-[12px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Pricing & Inventory"
              subtitle="Set your product pricing and stock details"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label required>Regular Price</Label>
                    <Input
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      prefix="₹"
                    />
                  </div>

                  <div>
                    <Label>Sale Price</Label>
                    <Input
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      prefix="₹"
                    />
                  </div>
                </div>

                <div>
                  <Label>Offer Percentage</Label>
                  <Input
                    value={finalDiscountPercent}
                    readOnly
                    type="text"
                    placeholder="0"
                    suffix="%"
                  />
                </div>

                <div>
                  <Label>Material</Label>
                  <Input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    type="text"
                    placeholder="e.g. Gold plated brass"
                  />
                </div>

                <div>
                  <Label>Stock Status</Label>
                  <Select
                    value={stockStatus}
                    onChange={setStockStatus}
                    options={["In Stock", "Out of Stock"]}
                    placeholder="Select Stock Status"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Story Header"
              subtitle="Main title for the story section"
            >
              <div className="space-y-4">
                <div>
                  <Label>Story Title</Label>
                  <Input
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    type="text"
                    placeholder="The Story Behind This Treasure"
                  />
                </div>

                <div>
                  <Label>Story Content</Label>
                  <Textarea
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Quote Text</Label>
                  <Textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Quote Author</Label>
                  <Input
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    type="text"
                    placeholder="Sarah Anderson, Master Artisan"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Artisan Information"
              subtitle="Details about the maker of this product"
            >
              <div className="space-y-4">
                {artisanSteps.map((step, index) => (
                  <div
                    key={index}
                    className="relative rounded-[12px] border border-[#F1E3E8] bg-[#FFFCFD] p-4"
                  >
                    <div className="mb-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EB5C8A] px-1.5 text-[9px] font-semibold text-white">
                      {index + 1}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Step Title</Label>
                        <Input
                          value={step.title}
                          onChange={(e) =>
                            updateArtisanStep(index, "title", e.target.value)
                          }
                          type="text"
                        />
                      </div>

                      <div>
                        <Label>Step Description</Label>
                        <Textarea
                          value={step.description}
                          onChange={(e) =>
                            updateArtisanStep(index, "description", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddArtisanStep}
                  className="flex h-9.5 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#F3A9BF] bg-[#FFF7FA] text-[11px] font-semibold text-[#EB5C8A] hover:bg-[#FDF0F5]"
                >
                  <Plus size={13} />
                  Add Another Step
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Product Variants"
              subtitle="Add color and size options for your product"
            >
              <div className="border-b border-[#F1E3E8] pb-5">
                <p className="mb-3 text-[12px] font-semibold text-[#1C1630]">
                  Add Color
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {COLOR_OPTIONS.map((colorName) => {
                    const isSelected = variants.some(
                      (variant) =>
                        variant.color.toLowerCase() === colorName.toLowerCase()
                    );

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => addVariantColor(colorName)}
                        title={colorName}
                        className={`relative h-8 w-8 rounded-xl border transition ${
                          isSelected
                            ? "border-[#EB5C8A] ring-1 ring-[#EB5C8A]"
                            : "border-[#E6E0E5] hover:border-[#F1A6BC]"
                        }`}
                      >
                        <div
                          className={`h-full w-full rounded-[6px] ${
                            colorName === "White" ? "border border-[#E6E0E5]" : ""
                          }`}
                          style={{
                            backgroundColor:
                              COLOR_SWATCH_MAP[colorName.toLowerCase()] || "#E5E7EB",
                          }}
                        />
                      </button>
                    );
                  })}

                  <div className="flex items-center gap-2">
                    <Input
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      type="text"
                      placeholder="Add Color Name"
                      className="w-37.5"
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="h-9.5 rounded-[10px] border border-dashed border-[#F3A9BF] bg-[#FFF7FA] px-4 text-[11px] font-semibold text-[#EB5C8A] hover:bg-[#FDF0F5]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Size Per Color"
              subtitle="Each color can have different sizes — click a color to expand and choose its sizes"
            >
              <div className="space-y-4">
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
                    onUpdateSku={(size, sku) =>
                      updateVariantSku(variant.id, size, sku)
                    }
                    onUpdatePrice={(size, price) =>
                      updateVariantPrice(variant.id, size, price)
                    }
                    onVariantImagesChange={(e) => handleVariantImagesChange(variant.id, e)}
                    onRemoveVariantImage={(imageId) =>
                      removeVariantImage(variant.id, imageId)
                    }
                    colorSwatchMap={COLOR_SWATCH_MAP}
                    inheritedPrice={
                      salePrice.trim() ? toNumber(salePrice) : toNumber(regularPrice)
                    }
                  />
                ))}
              </div>

              {variants.length === 0 ? (
                <div className="mt-4 rounded-[10px] border border-dashed border-[#F3A9BF] bg-[#FFF7FA] p-4 text-[12px] text-[#EB5C8A]">
                  Add at least one color to start creating product variants.
                </div>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-[#EB5C8A] bg-white text-[12px] font-semibold text-[#EB5C8A] hover:bg-[#FFF7FA] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Product"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-[#EB5C8A] text-[12px] font-semibold text-white hover:bg-[#E35182]"
                >
                  Preview Product
                </button>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title="Publish Settings">
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onChange={setStatus}
                    options={["Published", "Draft"]}
                    placeholder="Select Status"
                  />
                </div>

                <div>
                  <Label>Visibility</Label>
                  <Select
                    value={visibility}
                    onChange={setVisibility}
                    options={["Public", "Private"]}
                    placeholder="Select Visibility"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Toggle
                      checked={isFeatured}
                      onChange={() => setIsFeatured((prev) => !prev)}
                    />
                    <span className="text-[11px] font-medium text-[#1C1630]">
                      Featured Product
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Toggle
                      checked={reviewsEnabled}
                      onChange={() => setReviewsEnabled((prev) => !prev)}
                    />
                    <span className="text-[11px] font-medium text-[#1C1630]">
                      Enable Reviews
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Shipping">
              <div className="space-y-3">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    type="text"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Length (cm)</Label>
                    <Input
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      type="text"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Width (cm)</Label>
                    <Input
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      type="text"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    type="text"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <Toggle
                    checked={freeShipping}
                    onChange={() => setFreeShipping((prev) => !prev)}
                  />
                  <span className="text-[11px] font-medium text-[#1C1630]">
                    Free Shipping
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="SEO">
              <div className="space-y-3">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    type="text"
                    placeholder="Product meta title"
                  />
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Product meta description"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Story Settings">
              <div className="space-y-3">
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
                  <div key={item.key} className="flex items-center gap-2.5">
                    <Toggle
                      checked={storySettings[item.key]}
                      onChange={() =>
                        setStorySettings((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                    />
                    <span className="text-[11px] font-medium text-[#1C1630]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Tags & Keywords">
              <div className="space-y-3">
                <div>
                  <Label>Story Tags</Label>
                  <Input
                    value={storyTags}
                    onChange={(e) => setStoryTags(e.target.value)}
                    type="text"
                    placeholder="handmade, artisan, jewelry"
                  />
                </div>

                <div>
                  <Label>Featured Story</Label>
                  <Select
                    value={featuredStory}
                    onChange={setFeaturedStory}
                    options={["No", "Yes"]}
                    placeholder="Select"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Summary">
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between border-b border-[#F3E9ED] pb-2">
                  <span className="text-[#8E8794]">Colours</span>
                  <span className="font-semibold text-[#EB5C8A]">
                    {summary.colors} Selected
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#F3E9ED] pb-2">
                  <span className="text-[#8E8794]">Total SKUs</span>
                  <span className="font-semibold text-[#EB5C8A]">
                    {summary.totalSkus} Size pairs
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8E8794]">Images</span>
                  <span className="font-semibold text-[#EB5C8A]">
                    {summary.totalImages}/8
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="mt-4 flex h-9.5 w-full items-center justify-center gap-2 rounded-[10px] border border-[#F2B8C8] bg-[#FFF4F7] text-[11px] font-semibold text-[#EB5C8A] hover:bg-[#FDECF2]"
              >
                <Eye size={14} />
                Preview Product
              </button>
            </SectionCard>
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
        discountPercent={finalDiscountPercent}
        status={status}
        story={storyContent}
        storyTitle={storyTitle}
        variants={variants}
        colorSwatchMap={COLOR_SWATCH_MAP}
      />
    </>
  );
}