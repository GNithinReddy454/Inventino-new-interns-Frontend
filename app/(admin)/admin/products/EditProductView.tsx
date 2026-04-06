"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  DollarSign,
  Circle,
  ShoppingBag,
  Eye,
  Save,
} from "lucide-react";
import { adminProductService } from "@/services/admin-product.service";

type VariantImage = {
  id: string;
  file?: File;
  preview: string;
  isNew?: boolean;
};

type VariantSize = {
  id: string;
  size: string;
  stock: number | "";
  sku: string;
  price: number | "";
};

type VariantForm = {
  id: string;
  color: string;
  colorCode?: string;
  expanded: boolean;
  images: VariantImage[];
  sizes: VariantSize[];
};

type ProductForm = {
  name: string;
  description: string;
  tags: string[];
  regularPrice: number | "";
  salePrice: number | "";
  taxIncluded: boolean;
  category: string;
  subcategory: string;
  brand: string;
  fabric: string;
  material: string;
  shortDescription: string;
  story: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  variants: VariantForm[];
};

type Props = {
  productId: string;
  onBack: () => void;
  onSuccess?: () => void;
};

const defaultColorPalette = [
  { name: "Rose Gold", hex: "#d4a373" },
  { name: "Yellow Gold", hex: "#d4af37" },
  { name: "Black", hex: "#222222" },
  { name: "Pink Coral", hex: "#ef709d" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "White", hex: "#f8f8f8" },
];

const defaultSizeOptions = ["14 cm", "16 cm", "17 cm", "18 cm", "20 cm", "22 cm"];

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value: unknown, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function getColorHex(color: string, colorCode?: string) {
  if (colorCode) return colorCode;

  const found = defaultColorPalette.find(
    (item) => item.name.toLowerCase() === String(color).toLowerCase()
  );
  return found?.hex || "#e5e7eb";
}

function normalizeTagArray(tags: any) {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => String(tag)).filter(Boolean);
}

function normalizeVariantImages(images: any[]): VariantImage[] {
  return toArray(images)
    .map((img: any) => {
      if (typeof img === "string" && img.trim()) {
        return {
          id: makeId(),
          preview: img,
          isNew: false,
        };
      }

      if (img?.url) {
        return {
          id: img.id || img._id || makeId(),
          preview: img.url,
          isNew: false,
        };
      }

      return null;
    })
    .filter(Boolean) as VariantImage[];
}

function normalizeVariants(product: any): VariantForm[] {
  const variants = toArray(product?.variants);

  if (!variants.length) {
    return [
      {
        id: makeId(),
        color: "Rose Gold",
        colorCode: "#d4a373",
        expanded: true,
        images: [],
        sizes: [
          {
            id: makeId(),
            size: "",
            stock: "",
            sku: "",
            price: "",
          },
        ],
      },
    ];
  }

  return variants.map((variant: any, index: number) => {
    let sizes: VariantSize[] = [];

    if (Array.isArray(variant?.sizes) && variant.sizes.length > 0) {
      sizes = variant.sizes.map((sizeItem: any) => ({
        id: makeId(),
        size: sizeItem?.size || "",
        stock:
          sizeItem?.stock === null || sizeItem?.stock === undefined
            ? ""
            : Number(sizeItem.stock),
        sku: sizeItem?.sku || "",
        price:
          sizeItem?.price === null || sizeItem?.price === undefined
            ? ""
            : Number(sizeItem.price),
      }));
    } else if (variant?.size || variant?.stock !== undefined || variant?.sku) {
      sizes = [
        {
          id: makeId(),
          size: variant?.size || "",
          stock:
            variant?.stock === null || variant?.stock === undefined
              ? ""
              : Number(variant.stock),
          sku: variant?.sku || "",
          price:
            variant?.price === null || variant?.price === undefined
              ? ""
              : Number(variant.price),
        },
      ];
    } else {
      sizes = [
        {
          id: makeId(),
          size: "",
          stock: "",
          sku: "",
          price: "",
        },
      ];
    }

    return {
      id: makeId(),
      color: variant?.color || `Color ${index + 1}`,
      colorCode: variant?.colorCode || "",
      expanded: index === 0,
      images: normalizeVariantImages(variant?.images || []),
      sizes,
    };
  });
}

function normalizeProduct(product: any): ProductForm {
  const pricing = product?.pricing || {};
  const storyValue =
    typeof product?.story === "string"
      ? product.story
      : product?.story?.content || "";

  return {
    name: product?.productName || product?.name || "",
    description: product?.description || "",
    tags: normalizeTagArray(product?.tags || product?.hashtags),
    regularPrice:
      pricing?.originalPrice !== undefined && pricing?.originalPrice !== null
        ? Number(pricing.originalPrice)
        : "",
    salePrice:
      pricing?.price !== undefined && pricing?.price !== null
        ? Number(pricing.price)
        : "",
    taxIncluded: Boolean(pricing?.taxIncluded),
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    brand: product?.brand || "",
    fabric: product?.fabric || "",
    material: product?.material || "",
    shortDescription: product?.shortDescription || "",
    story: storyValue,
    isActive:
      typeof product?.isActive === "boolean" ? product.isActive : true,
    isFeatured: !!product?.isFeatured,
    isBestSeller: !!product?.isBestSeller || !!product?.bestSeller,
    variants: normalizeVariants(product),
  };
}

export default function EditProductView({
  productId,
  onBack,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<ProductForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [newColorName, setNewColorName] = useState("");

  const selectedColors = useMemo(() => {
    if (!form) return [];
    return form.variants.map((v) => v.color.toLowerCase());
  }, [form]);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await adminProductService.getById(productId);
        const product =
          res?.data?.data ||
          res?.data?.product ||
          res?.data ||
          res?.product ||
          res;

        if (!active) return;

        setForm(normalizeProduct(product));
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load product."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateVariant = (variantId: string, updates: Partial<VariantForm>) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        variants: prev.variants.map((variant) =>
          variant.id === variantId ? { ...variant, ...updates } : variant
        ),
      };
    });
  };

  const toggleVariantExpanded = (variantId: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        variants: prev.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, expanded: !variant.expanded }
            : variant
        ),
      };
    });
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || !form) return;
    if (form.tags.includes(value)) {
      setTagInput("");
      return;
    }
    updateField("tags", [...form.tags, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!form) return;
    updateField(
      "tags",
      form.tags.filter((item) => item !== tag)
    );
  };

  const addColor = (colorName: string) => {
    if (!form) return;
    const trimmed = colorName.trim();
    if (!trimmed) return;

    const exists = form.variants.some(
      (variant) => variant.color.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;

    const matched = defaultColorPalette.find(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase()
    );

    updateField("variants", [
      ...form.variants,
      {
        id: makeId(),
        color: trimmed,
        colorCode: matched?.hex || "",
        expanded: false,
        images: [],
        sizes: [
          {
            id: makeId(),
            size: "",
            stock: "",
            sku: "",
            price: form.salePrice === "" ? "" : Number(form.salePrice),
          },
        ],
      },
    ]);
  };

  const removeColorVariant = (variantId: string) => {
    if (!form) return;
    if (form.variants.length === 1) return;

    updateField(
      "variants",
      form.variants.filter((variant) => variant.id !== variantId)
    );
  };

  const addSizeToVariant = (variantId: string, sizeValue?: string) => {
    if (!form) return;
    const variant = form.variants.find((v) => v.id === variantId);
    if (!variant) return;

    const nextSize =
      sizeValue ||
      defaultSizeOptions.find(
        (size) =>
          !variant.sizes.some(
            (existing) => existing.size.toLowerCase() === size.toLowerCase()
          )
      ) ||
      "";

    updateVariant(variantId, {
      sizes: [
        ...variant.sizes,
        {
          id: makeId(),
          size: nextSize,
          stock: "",
          sku: nextSize ? `${variant.color}-${nextSize}`.replace(/\s+/g, "-") : "",
          price: form.salePrice === "" ? "" : Number(form.salePrice),
        },
      ],
    });
  };

  const removeSizeFromVariant = (variantId: string, sizeId: string) => {
    const variant = form?.variants.find((v) => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      sizes:
        variant.sizes.length === 1
          ? variant.sizes
          : variant.sizes.filter((size) => size.id !== sizeId),
    });
  };

  const updateVariantSize = (
    variantId: string,
    sizeId: string,
    key: keyof VariantSize,
    value: string | number
  ) => {
    const variant = form?.variants.find((v) => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      sizes: variant.sizes.map((size) =>
        size.id === sizeId ? { ...size, [key]: value } : size
      ),
    });
  };

  const handleVariantImages = (variantId: string, files: FileList | null) => {
    if (!files?.length) return;
    const variant = form?.variants.find((v) => v.id === variantId);
    if (!variant) return;

    const newImages: VariantImage[] = Array.from(files).map((file) => ({
      id: makeId(),
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    updateVariant(variantId, {
      images: [...variant.images, ...newImages],
    });
  };

  const removeVariantImage = (variantId: string, imageId: string) => {
    const variant = form?.variants.find((v) => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      images: variant.images.filter((img) => img.id !== imageId),
    });
  };

  const uploadNewVariantImagesIfNeeded = async (variants: VariantForm[]) => {
    const hasNew = variants.some((variant) =>
      variant.images.some((img) => img.isNew && img.file)
    );

    if (!hasNew) return variants;

    const updatedVariants: VariantForm[] = [];

    for (const variant of variants) {
      const newFiles = variant.images.filter((img) => img.isNew && img.file);

      if (!newFiles.length) {
        updatedVariants.push(variant);
        continue;
      }

      const fd = new FormData();
      newFiles.forEach((img) => {
        if (img.file) fd.append("images", img.file);
      });

      const res = await adminProductService.addImages(productId, fd);
      const uploaded =
        res?.data?.data?.media?.galleryImages ||
        res?.data?.media?.galleryImages ||
        res?.data?.galleryImages ||
        res?.galleryImages ||
        res?.data?.images ||
        res?.images ||
        [];

      const uploadedUrls = toArray(uploaded)
        .map((img: any) => {
          if (typeof img === "string") return img;
          if (img?.url) return img.url;
          return "";
        })
        .filter(Boolean);

      let uploadIndex = 0;

      updatedVariants.push({
        ...variant,
        images: variant.images.map((img) => {
          if (img.isNew) {
            const finalUrl = uploadedUrls[uploadIndex] || img.preview;
            uploadIndex += 1;
            return {
              id: img.id,
              preview: finalUrl,
              isNew: false,
            };
          }
          return {
            id: img.id,
            preview: img.preview,
            isNew: false,
          };
        }),
      });
    }

    return updatedVariants;
  };

  const validateForm = () => {
    if (!form) return "Form not loaded.";
    if (!form.name.trim()) return "Product name is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.variants.length) return "At least one color variant is required.";

    for (const variant of form.variants) {
      if (!variant.color.trim()) return "Each color must have a name.";
      if (!variant.sizes.length) return `Add at least one size for ${variant.color}.`;

      for (const size of variant.sizes) {
        if (!size.size.trim()) return `Each size must have a value in ${variant.color}.`;
        if (size.stock === "" || Number(size.stock) < 0) {
          return `Each size must have valid stock in ${variant.color}.`;
        }
      }
    }

    return "";
  };

  const buildPayload = (variants: VariantForm[]) => {
    if (!form) return {};

    const sale = safeNumber(form.salePrice, 0);
    const regular =
      form.regularPrice === "" ? sale : safeNumber(form.regularPrice, sale);

    const offerPercentage =
      regular > sale && regular > 0
        ? Math.round(((regular - sale) / regular) * 100)
        : 0;

    const totalStock = variants.reduce(
      (sum, variant) =>
        sum +
        variant.sizes.reduce(
          (innerSum, size) => innerSum + safeNumber(size.stock, 0),
          0
        ),
      0
    );

    return {
      productName: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      brand: form.brand.trim(),
      fabric: form.fabric.trim(),
      material: form.material.trim(),
      subcategory: form.subcategory.trim(),
      tags: form.tags,
      totalStock,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      bestSeller: form.isBestSeller,
      pricing: {
        price: sale,
        originalPrice: regular,
        offerPercentage,
        taxIncluded: form.taxIncluded,
      },
      variants: variants.map((variant) => ({
        color: variant.color.trim(),
        colorCode: variant.colorCode || null,
        images: variant.images.map((img) => img.preview),
        sizes: variant.sizes.map((size) => ({
          size: size.size.trim(),
          stock: safeNumber(size.stock, 0),
          sku: size.sku || null,
          price:
            size.price === "" ? sale : safeNumber(size.price, sale),
        })),
      })),
      story: {
        title: form.name.trim(),
        content: form.story || "",
        isDisplayed: true,
        featured: false,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!form) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const uploadedVariants = await uploadNewVariantImagesIfNeeded(form.variants);
      const payload = buildPayload(uploadedVariants);

      await adminProductService.update(productId, payload);

      setForm((prev) => (prev ? { ...prev, variants: uploadedVariants } : prev));
      setSuccessMessage("Product updated successfully.");
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      await adminProductService.getById(productId);
      window.open(`/product/${productId}`, "_blank");
    } catch {
      window.open(`/product/${productId}`, "_blank");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="w-full rounded-[28px] border border-[#F0E4E8] bg-white p-10 shadow-[0_4px_20px_rgba(31,23,40,0.04)]">
        <div className="flex items-center justify-center gap-3 py-20 text-[#6F6877]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[28px] bg-[#FDF6F8] p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#EADDE3] bg-white text-[#7D7482] shadow-sm hover:bg-[#FAF7F8]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="mb-2 text-[12px] text-[#A0949E]">
                Products / All Products / Edit Product
              </div>
              <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[#251B2A]">
                {form.name || "Edit Product"}
              </h1>
              <div className="mt-3 inline-flex rounded-full bg-[#FDE7EF] px-3 py-1 text-[12px] font-semibold text-[#EB5C8A]">
                #{String(productId).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E8DDE3] bg-white px-4 text-[14px] font-medium text-[#5F5563] hover:bg-[#FAF7F8] disabled:opacity-60"
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] bg-[#EB5C8A] px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#e14f80] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-[16px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[24px] border border-[#F0E4E8] bg-white shadow-[0_2px_10px_rgba(31,23,40,0.03)]">
          <div className="border-b border-[#F4E9EE] px-6 py-5">
            <h2 className="text-[28px] font-semibold text-[#2A1F2F]">Basic Information</h2>
            <p className="mt-1 text-[13px] text-[#A0959F]">
              Fill in the basic details of your product
            </p>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#352B39]">
                Product Name <span className="text-[#EB5C8A]">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Delicate Rose Bracelet"
                className="h-[48px] w-full rounded-[14px] border border-[#F4B8C8] bg-[#FFF7FA] px-4 text-[14px] text-[#2A1F2F] placeholder:text-[#B6AAB4] outline-none focus:border-[#EB5C8A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#352B39]">
                Description <span className="text-[#EB5C8A]">*</span>
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Write a detailed description of your product..."
                className="w-full rounded-[14px] border border-[#F4B8C8] bg-[#FFF7FA] px-4 py-4 text-[14px] text-[#2A1F2F] placeholder:text-[#B6AAB4] outline-none focus:border-[#EB5C8A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#352B39]">
                Tags
              </label>
              <div className="rounded-[14px] border border-[#F0E4E8] bg-[#FFFDFC] px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full bg-[#F26E99] px-3 py-1 text-[12px] font-medium text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full bg-white/20 p-0.5 hover:bg-white/30"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="min-w-[160px] flex-1 bg-transparent text-[13px] text-[#4B4250] outline-none placeholder:text-[#B6AAB4]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#F0E4E8] bg-white shadow-[0_2px_10px_rgba(31,23,40,0.03)]">
          <div className="flex items-start gap-3 border-b border-[#F4E9EE] px-6 py-5">
            <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF2F6] text-[#EB5C8A]">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-[#2A1F2F]">
                Pricing Information
              </h3>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#352B39]">
                  Regular Price
                </label>
                <input
                  type="number"
                  value={form.regularPrice}
                  onChange={(e) =>
                    updateField(
                      "regularPrice",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-[48px] w-full rounded-[14px] border border-[#F4B8C8] bg-[#FFF7FA] px-4 text-[14px] outline-none focus:border-[#EB5C8A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#352B39]">
                  Sale Price
                </label>
                <input
                  type="number"
                  value={form.salePrice}
                  onChange={(e) =>
                    updateField(
                      "salePrice",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-[48px] w-full rounded-[14px] border border-[#F4B8C8] bg-[#FFF7FA] px-4 text-[14px] outline-none focus:border-[#EB5C8A]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-[14px] border border-[#F0E4E8] bg-[#FFFDFC] px-4 py-3 max-w-[260px]">
              <input
                type="checkbox"
                checked={form.taxIncluded}
                onChange={(e) => updateField("taxIncluded", e.target.checked)}
              />
              <span className="text-[14px] font-medium text-[#4C424F]">
                Tax Included
              </span>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#F0E4E8] bg-white shadow-[0_2px_10px_rgba(31,23,40,0.03)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#F4E9EE] px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF2F6] text-[#EB5C8A]">
                <Circle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[20px] font-semibold text-[#2A1F2F]">
                  Product Colors
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Add color"
                className="h-[40px] rounded-[12px] border border-[#EADDE3] bg-white px-3 text-[13px] outline-none focus:border-[#EB5C8A]"
              />
              <button
                type="button"
                onClick={() => {
                  addColor(newColorName);
                  setNewColorName("");
                }}
                className="inline-flex h-[40px] items-center gap-2 rounded-[12px] border border-[#EADDE3] bg-white px-4 text-[13px] font-medium text-[#7D7482]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Color
              </button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex flex-wrap gap-4">
              {defaultColorPalette.map((item) => {
                const isSelected = selectedColors.includes(item.name.toLowerCase());

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        const target = form.variants.find(
                          (v) => v.color.toLowerCase() === item.name.toLowerCase()
                        );
                        if (target) removeColorVariant(target.id);
                      } else {
                        addColor(item.name);
                      }
                    }}
                    className="group text-left"
                  >
                    <div
                      className={`relative h-[58px] w-[58px] rounded-[14px] border-2 transition ${
                        isSelected
                          ? "border-[#EB5C8A]"
                          : "border-[#ECE5E9] hover:border-[#F3A6BF]"
                      }`}
                      style={{ backgroundColor: item.hex }}
                    >
                      {isSelected ? (
                        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F26E99] text-white">
                          <span className="text-[10px]">✓</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 text-center text-[12px] text-[#6E6572]">
                      {item.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#F0E4E8] bg-white shadow-[0_2px_10px_rgba(31,23,40,0.03)]">
          <div className="flex items-start gap-3 border-b border-[#F4E9EE] px-6 py-5">
            <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF2F6] text-[#EB5C8A]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-[#2A1F2F]">
                Size & Stock Per Color
              </h3>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
            {form.variants.map((variant, variantIndex) => (
              <div
                key={variant.id}
                className="overflow-hidden rounded-[18px] border border-[#F1E3E8] bg-[#FFFDFC]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#F3E8EC] px-4 py-4">
                  <button
                    type="button"
                    onClick={() => toggleVariantExpanded(variant.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className="h-7 w-7 rounded-[8px] border border-[#E7DFE3]"
                      style={{ backgroundColor: getColorHex(variant.color, variant.colorCode) }}
                    />
                    <span className="text-[15px] font-semibold text-[#2A1F2F]">
                      {variant.color}
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#FDE7EF] px-3 py-1 text-[12px] font-semibold text-[#EB5C8A]">
                      {variant.sizes.length} sizes
                    </span>

                    {variantIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeColorVariant(variant.id)}
                        className="text-[13px] font-medium text-[#E25D7A]"
                      >
                        Remove
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleVariantExpanded(variant.id)}
                      className="text-[#A4949F]"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          variant.expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {variant.expanded ? (
                  <div className="space-y-6 px-4 py-5">
                    <div>
                      <div className="mb-3 text-[13px] font-semibold text-[#2A1F2F]">
                        Sizes
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {variant.sizes.map((size) => (
                          <div
                            key={size.id}
                            className="relative min-h-[110px] w-[120px] rounded-[14px] border border-[#F3B2C7] bg-white px-3 py-3 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => removeSizeFromVariant(variant.id, size.id)}
                              className="absolute right-1.5 top-1.5 text-[#D6A0B2] hover:text-[#EB5C8A]"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>

                            <input
                              value={size.size}
                              onChange={(e) =>
                                updateVariantSize(
                                  variant.id,
                                  size.id,
                                  "size",
                                  e.target.value
                                )
                              }
                              className="w-full bg-transparent text-center text-[14px] font-semibold text-[#EB5C8A] outline-none"
                              placeholder="Size"
                            />
                            <input
                              type="number"
                              value={size.stock}
                              onChange={(e) =>
                                updateVariantSize(
                                  variant.id,
                                  size.id,
                                  "stock",
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              className="mt-2 w-full rounded-[8px] border border-[#F3B2C7] bg-[#FFF7FA] px-2 py-1 text-center text-[12px] outline-none"
                              placeholder="Stock"
                            />
                            <input
                              value={size.sku}
                              onChange={(e) =>
                                updateVariantSize(
                                  variant.id,
                                  size.id,
                                  "sku",
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-[8px] border border-[#F3B2C7] bg-[#FFF7FA] px-2 py-1 text-center text-[12px] outline-none"
                              placeholder="SKU"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addSizeToVariant(variant.id)}
                          className="flex min-h-[110px] w-[120px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#F2C2D1] bg-[#FFF9FB] text-[13px] font-medium text-[#EB5C8A]"
                        >
                          <Plus className="mb-1 h-4 w-4" />
                          Add Size
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-[#F3E8EC] pt-6">
                      <div className="mb-3 text-[13px] font-semibold text-[#2A1F2F]">
                        Product Images
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {variant.images.map((image, imageIndex) => (
                          <div
                            key={image.id}
                            className="relative h-[118px] w-[118px] overflow-hidden rounded-[14px] border border-[#EADDE3] bg-[#F9F4F6]"
                          >
                            {image.preview ? (
                              <Image
                                src={image.preview}
                                alt={`${variant.color}-${imageIndex}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : null}

                            {imageIndex === 0 ? (
                              <div className="absolute left-2 top-2 rounded-full bg-[#F26E99] px-2 py-1 text-[10px] font-semibold text-white">
                                Primary
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => removeVariantImage(variant.id, image.id)}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#E0617C] shadow"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        <label className="flex h-[118px] w-[118px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#F2C2D1] bg-[#FFF9FB] text-[#EB5C8A]">
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-4 w-4" />
                            <span className="text-[12px] font-medium">Upload</span>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleVariantImages(variant.id, e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}