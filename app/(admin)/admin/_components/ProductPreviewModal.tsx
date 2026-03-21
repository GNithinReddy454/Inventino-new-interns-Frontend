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

  if (c.includes("rose gold")) return "#D9A6A0";
  if (c.includes("gold")) return "#C9A227";
  if (c.includes("silver")) return "#98A2B3";
  if (c.includes("grey")) return "#98A2B3";
  if (c.includes("gray")) return "#98A2B3";
  if (c.includes("black")) return "#2F3441";
  if (c.includes("white")) return "#EAEAEA";
  if (c.includes("pink")) return "#E8B7C8";
  if (c.includes("red")) return "#E4546B";
  if (c.includes("green")) return "#7BAE7F";
  if (c.includes("blue")) return "#8FA2C9";
  if (c.includes("brown")) return "#9A715B";
  if (c.includes("yellow")) return "#D4B04C";
  if (c.includes("oxidized")) return "#7C8496";
  if (c.includes("multi")) return "#C7A0D8";

  return "#D9A6A0";
}

function unwrapApiResponse(response: any): PreviewProduct | null {
  const payload = response?.data ?? response;

  if (!payload) return null;
  if (payload?.data) return payload.data as PreviewProduct;

  return payload as PreviewProduct;
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
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
    <div className="fixed inset-0 z-[100] bg-[#211A1D]/45 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[820px] rounded-[16px] bg-[#FCFBFC] shadow-[0_20px_50px_rgba(30,20,30,0.16)] border border-[#E9DDE3] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E4E8]">
          <h3 className="text-[14px] font-semibold text-[#201A24]">
            Product Preview
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6D6776] hover:bg-[#F7EEF2] transition"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        {isLoading ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#6B7280]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-medium">
                Loading product preview...
              </span>
            </div>
          </div>
        ) : !product ? (
          <div className="h-[320px] flex flex-col items-center justify-center text-[#6B7280]">
            <Package size={30} className="mb-3 opacity-40" />
            <p className="text-sm">Unable to load product details.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[344px_1fr] gap-4 items-start">
              <div>
                <div className="rounded-[10px] bg-[#F6F2F4] border border-[#F0E4E8] h-[184px] flex items-center justify-center overflow-hidden">
                  {images[activeImage] ? (
                    <img
                      src={images[activeImage]}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#A1A1AA]">
                      <Package size={28} className="mb-2 opacity-50" />
                      <span className="text-xs">No image available</span>
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`w-[54px] h-[54px] rounded-[8px] overflow-hidden border shrink-0 transition ${
                          activeImage === index
                            ? "border-[#EB6F96] ring-1 ring-[#EB6F96]"
                            : "border-[#E7DADF] hover:border-[#EB6F96]"
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

              <div className="flex flex-col min-h-[246px]">
                <div>
                  <h2 className="text-[16px] leading-[1.25] font-semibold text-[#1F1728]">
                    {name}
                  </h2>

                  <p className="text-[10px] text-[#A29AAD] mt-0.5">SKU: {sku}</p>

                  <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                    <span className="text-[15px] font-bold text-[#EB5C8A]">
                      {formatPrice(price)}
                    </span>

                    {comparePrice > price ? (
                      <span className="text-[10px] text-[#9F98A7] line-through">
                        {formatPrice(comparePrice)}
                      </span>
                    ) : null}

                    {offerPercentage > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#DFF4E8] text-[#3D8B5D] text-[9px] font-semibold">
                        {offerPercentage}% OFF
                      </span>
                    ) : null}
                  </div>
                </div>

                {colors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-[#6B6572] mb-1.5">
                      Colour
                    </p>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border transition ${
                            selectedColor === color
                              ? "border-[#EB6F96] shadow-[0_0_0_1.5px_rgba(235,111,150,0.16)]"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: inferColorSwatch(color) }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-[#6B6572] mb-1.5">
                      Size
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] px-2.5 h-7 rounded-[6px] border text-[10px] font-medium transition ${
                            selectedSize === size
                              ? "border-[#EB6F96] text-[#EB6F96] bg-[#FFF7FA]"
                              : "border-[#E6E0E5] text-[#47414E] bg-white hover:border-[#EB6F96]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span
                    className={`w-[6px] h-[6px] rounded-full ${
                      stock > 0 ? "bg-[#16A34A]" : "bg-[#DC2626]"
                    }`}
                  />
                  <span className="text-[#2B2433] font-medium">
                    {stock > 0 ? `In Stock - ${stock} Units` : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-medium text-[#6B6572] mb-1">
                    Description
                  </p>
                  <p className="text-[10px] leading-4 text-[#7B7482]">
                    {description}
                  </p>
                </div>

                {tags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-[#6B6572] mb-1.5">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-2 py-0.5 rounded-full bg-[#F1EEF0] text-[#625B66] text-[9px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => product && onEdit?.(product)}
                    className="w-full h-[34px] rounded-[8px] bg-[#EB5C8A] hover:bg-[#E35182] text-white font-semibold text-[11px] transition"
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