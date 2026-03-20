"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Package, Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";

interface ProductPreviewModalProps {
  productId: string;
  onClose: () => void;
  onEdit?: (product: PreviewProduct) => void;
}

interface ProductImage {
  id?: string;
  url?: string;
  _id?: string;
}

interface ProductVariantSize {
  size?: string;
  images?: Array<string | ProductImage>;
  primaryImage?: string;
}

interface ProductVariant {
  color?: string;
  size?: string;
  images?: Array<string | ProductImage>;
  primaryImage?: string;
  sizes?: ProductVariantSize[];
}

interface PreviewProduct {
  _id?: string;
  productId?: string;
  productName?: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  discountPrice?: number | null;
  offerPercentage?: number | null;
  category?: string;
  material?: string;
  stock?: number;
  isActive?: boolean;
  trendy?: boolean;
  bestSeller?: boolean;
  hashtags?: string[];
  story?: string;
  storyMedia?: string;
  mainImage?: string | null;
  galleryImages?: ProductImage[];
  images?: Array<string | ProductImage>;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
  sku?: string;
  slug?: string;
  size?: string;
  color?: string;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getImageUrl(image: string | ProductImage | undefined | null): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  return typeof image.url === "string" ? image.url : "";
}

function normalizeImages(product: PreviewProduct | null): string[] {
  if (!product) return [];

  const urls: string[] = [];

  if (isNonEmptyString(product.mainImage)) {
    urls.push(product.mainImage);
  }

  if (Array.isArray(product.galleryImages)) {
    for (const img of product.galleryImages) {
      const url = getImageUrl(img);
      if (isNonEmptyString(url)) urls.push(url);
    }
  }

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const url = getImageUrl(img);
      if (isNonEmptyString(url)) urls.push(url);
    }
  }

  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      if (Array.isArray(variant.images)) {
        for (const img of variant.images) {
          const url = getImageUrl(img);
          if (isNonEmptyString(url)) urls.push(url);
        }
      }

      if (isNonEmptyString(variant.primaryImage)) {
        urls.push(variant.primaryImage);
      }

      if (Array.isArray(variant.sizes)) {
        for (const size of variant.sizes) {
          if (Array.isArray(size.images)) {
            for (const img of size.images) {
              const url = getImageUrl(img);
              if (isNonEmptyString(url)) urls.push(url);
            }
          }

          if (isNonEmptyString(size.primaryImage)) {
            urls.push(size.primaryImage);
          }
        }
      }
    }
  }

  return Array.from(new Set(urls.filter(isNonEmptyString)));
}

function deriveOfferPercentage(product: PreviewProduct | null) {
  if (!product) return 0;

  if (toNumber(product.offerPercentage, 0) > 0) {
    return toNumber(product.offerPercentage, 0);
  }

  const price = toNumber(product.price, 0);
  const compare =
    toNumber(product.originalPrice, 0) || toNumber(product.discountPrice, 0);

  if (compare > price && price > 0) {
    return Math.round(((compare - price) / compare) * 100);
  }

  return 0;
}

function getAllColors(product: PreviewProduct | null): string[] {
  const colorSet = new Set<string>();

  if (isNonEmptyString(product?.color)) {
    colorSet.add(product.color);
  }

  if (Array.isArray(product?.variants)) {
    for (const variant of product.variants) {
      if (isNonEmptyString(variant?.color)) {
        colorSet.add(variant.color);
      }
    }
  }

  return Array.from(colorSet);
}

function getAllSizes(product: PreviewProduct | null): string[] {
  const sizeSet = new Set<string>();

  if (isNonEmptyString(product?.size)) {
    sizeSet.add(product.size);
  }

  if (Array.isArray(product?.variants)) {
    for (const variant of product.variants) {
      if (isNonEmptyString(variant?.size)) {
        sizeSet.add(variant.size);
      }

      if (Array.isArray(variant?.sizes)) {
        for (const s of variant.sizes) {
          if (isNonEmptyString(s?.size)) {
            sizeSet.add(s.size);
          }
        }
      }
    }
  }

  return Array.from(sizeSet);
}

function inferColorSwatch(color: string) {
  const c = color.toLowerCase();

  if (c.includes("gold")) return "#D4AF37";
  if (c.includes("rose")) return "#D9A5A5";
  if (c.includes("silver")) return "#98A2B3";
  if (c.includes("black")) return "#1F2937";
  if (c.includes("white")) return "#E5E7EB";
  if (c.includes("pink")) return "#F4B6C2";
  if (c.includes("red")) return "#EF4444";
  if (c.includes("green")) return "#22C55E";
  if (c.includes("blue")) return "#60A5FA";
  if (c.includes("brown")) return "#A16207";
  if (c.includes("yellow")) return "#FACC15";
  if (c.includes("oxidized")) return "#6B7280";
  if (c.includes("multi")) return "#C084FC";

  return "#D1D5DB";
}

function unwrapApiResponse(response: any): PreviewProduct | null {
  const payload = response?.data ?? response;

  if (!payload) return null;
  if (payload?.data) return payload.data as PreviewProduct;

  return payload as PreviewProduct;
}

export default function ProductPreviewModal({
  productId,
  onClose,
  onEdit,
}: ProductPreviewModalProps) {
  const [product, setProduct] = useState<PreviewProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        const response = await productService.getById(productId);
        const data = unwrapApiResponse(response);

        if (mounted) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product preview:", error);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const images = useMemo(() => normalizeImages(product), [product]);
  const colors = useMemo(() => getAllColors(product), [product]);
  const sizes = useMemo(() => getAllSizes(product), [product]);

  useEffect(() => {
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0] ?? "");
    }
  }, [colors, selectedColor]);

  useEffect(() => {
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0] ?? "");
    }
  }, [sizes, selectedSize]);

  useEffect(() => {
    if (activeImage >= images.length) {
      setActiveImage(0);
    }
  }, [images.length, activeImage]);

  const name = product?.productName || product?.name || "Product";
  const sku = product?.sku || product?.productId || "-";
  const price = toNumber(product?.price, 0);
  const comparePrice =
    toNumber(product?.originalPrice, 0) || toNumber(product?.discountPrice, 0);
  const offerPercentage = deriveOfferPercentage(product);
  const stock = toNumber(product?.stock, 0);
  const description = product?.description || "No description available.";

  const tags: string[] = [
    ...(Array.isArray(product?.hashtags)
      ? product.hashtags.filter(isNonEmptyString)
      : []),
    product?.category,
    product?.material,
    product?.bestSeller ? "Best Seller" : undefined,
    product?.trendy ? "Trending" : undefined,
  ].filter(isNonEmptyString);

  return (
    <div className="fixed inset-0 z-100 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="w-full max-w-300 rounded-3xl bg-white shadow-2xl border border-[#F1D7E2] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4E4EB]">
          <h3 className="text-[20px] font-bold text-[#1F1728]">
            Product Preview
          </h3>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F9EFF4] hover:text-[#111827] transition"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="h-115 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#6B7280]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">
                Loading product preview...
              </span>
            </div>
          </div>
        ) : !product ? (
          <div className="h-115 flex flex-col items-center justify-center text-[#6B7280]">
            <Package size={34} className="mb-3 opacity-40" />
            <p className="text-sm">Unable to load product details.</p>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5">
              <div>
                <div className="rounded-[20px] bg-[#FCF8FA] border border-[#F4E4EB] h-82.5 flex items-center justify-center overflow-hidden">
                  {images[activeImage] ? (
                    <img
                      src={images[activeImage]}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
                      <Package size={36} className="mb-2 opacity-50" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`w-18 h-14.5 rounded-[12px] overflow-hidden border transition shrink-0 ${
                          activeImage === index
                            ? "border-[#E85D8E] ring-2 ring-[#F7C8D8]"
                            : "border-[#E9DDE4] hover:border-[#E85D8E]"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${name}-${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div>
                  <h2 className="text-[28px] leading-[1.15] font-bold text-[#1F1728]">
                    {name}
                  </h2>

                  <p className="text-[12px] text-[#98A2B3] mt-1">SKU: {sku}</p>

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <span className="text-[32px] font-extrabold text-[#E85D8E]">
                      ₹{price.toLocaleString()}
                    </span>

                    {comparePrice > price ? (
                      <span className="text-[16px] text-[#98A2B3] line-through">
                        ₹{comparePrice.toLocaleString()}
                      </span>
                    ) : null}

                    {offerPercentage > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-[#D9FBE8] text-[#067647] text-[12px] font-bold">
                        {offerPercentage}% OFF
                      </span>
                    ) : null}
                  </div>
                </div>

                {colors.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[13px] font-semibold text-[#4B5563] mb-2">
                      Colour
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-xl border-2 transition ${
                            selectedColor === color
                              ? "border-[#E85D8E]"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: inferColorSwatch(color) }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[13px] font-semibold text-[#4B5563] mb-2">
                      Size
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-15.5 px-3 h-9 rounded-[10px] border text-[13px] font-medium transition ${
                            selectedSize === size
                              ? "border-[#E85D8E] text-[#E85D8E] bg-[#FFF5F8]"
                              : "border-[#E5E7EB] text-[#374151] bg-white hover:border-[#E85D8E]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 text-[14px]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stock > 0 ? "bg-[#16A34A]" : "bg-[#DC2626]"
                    }`}
                  />
                  <span className="text-[#1F1728] font-medium">
                    {stock > 0 ? `In Stock - ${stock} Units` : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[13px] font-semibold text-[#4B5563] mb-2">
                    Description
                  </p>
                  <p className="text-[14px] leading-6 text-[#6B7280]">
                    {description}
                  </p>
                </div>

                {tags.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[13px] font-semibold text-[#4B5563] mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-3 py-1 rounded-full bg-[#F5F5F5] text-[#5B5B5B] text-[12px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => product && onEdit?.(product)}
                    className="w-full h-12 rounded-[12px] bg-[#E85D8E] hover:bg-[#D84E80] text-white font-bold text-[14px] transition shadow-sm"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}