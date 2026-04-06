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
  _id?: string;
  url?: string;
}

interface ProductVariantSize {
  size?: string | null;
  stock?: number;
  sku?: string;
  images?: Array<string | ProductImage>;
  primaryImage?: string;
  price?: number;
}

interface ProductVariant {
  color?: string;
  colorCode?: string;
  price?: number;
  stock?: number;
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
  category?: string;
  material?: string;
  hashtags?: string[];
  sku?: string;

  pricing?: {
    price?: number;
    originalPrice?: number | null;
    offerPercentage?: number | null;
    taxIncluded?: boolean;
  };

  price?: number;
  originalPrice?: number | null;
  discountPrice?: number | null;
  offerPercentage?: number | null;

  totalStock?: number;
  stock?: number;

  media?: {
    mainImage?: string | null;
    galleryImages?: Array<string | ProductImage>;
  };

  mainImage?: string | null;
  galleryImages?: Array<string | ProductImage>;
  images?: Array<string | ProductImage>;

  variants?: ProductVariant[];

  bestSeller?: boolean;
  trendy?: boolean;
  isActive?: boolean;
}

function toNumber(value: unknown, fallback = 0): number {
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

function unwrapApiResponse(response: any): PreviewProduct | null {
  const level1 = response?.data ?? response;
  const level2 = level1?.data ?? level1;
  return level2 || null;
}

function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function inferColorSwatch(color: string) {
  const c = color.toLowerCase();
  if (c.includes("rose gold")) return "#D9A6A0";
  if (c.includes("gold")) return "#C9A227";
  if (c.includes("silver")) return "#98A2B3";
  if (c.includes("black")) return "#2F3441";
  if (c.includes("white")) return "#EAEAEA";
  if (c.includes("pink")) return "#E8B7C8";
  return "#D9A6A0";
}

function getProductName(product: PreviewProduct | null) {
  return product?.productName || product?.name || "Product";
}

function getProductSku(product: PreviewProduct | null) {
  return product?.sku || product?.productId || "-";
}

function getAllColors(product: PreviewProduct | null): string[] {
  if (!Array.isArray(product?.variants)) return [];
  return product.variants
    .map((variant) => variant?.color || "")
    .filter((color, index, arr) => color && arr.indexOf(color) === index);
}

function getVariantByColor(
  product: PreviewProduct | null,
  selectedColor: string
): ProductVariant | null {
  if (!Array.isArray(product?.variants)) return null;
  return (
    product.variants.find(
      (variant) =>
        (variant?.color || "").trim().toLowerCase() ===
        selectedColor.trim().toLowerCase()
    ) || null
  );
}

function getSizeLabels(variant: ProductVariant | null): string[] {
  if (!variant || !Array.isArray(variant.sizes)) return [];
  return variant.sizes
    .map((sizeItem) => (isNonEmptyString(sizeItem?.size) ? sizeItem.size.trim() : ""))
    .filter((size, index, arr) => size && arr.indexOf(size) === index);
}

function getSizeObject(
  variant: ProductVariant | null,
  selectedSize: string
): ProductVariantSize | null {
  if (!variant || !Array.isArray(variant.sizes)) return null;
  return (
    variant.sizes.find(
      (sizeItem) =>
        (sizeItem?.size || "").trim().toLowerCase() ===
        selectedSize.trim().toLowerCase()
    ) || null
  );
}

function getBasePrice(product: PreviewProduct | null): number {
  if (!product) return 0;
  if (toNumber(product?.pricing?.price, 0) > 0) return toNumber(product.pricing?.price, 0);
  if (toNumber(product?.price, 0) > 0) return toNumber(product.price, 0);
  return 0;
}

function getOriginalPrice(product: PreviewProduct | null): number {
  if (!product) return 0;
  if (toNumber(product?.pricing?.originalPrice, 0) > 0) {
    return toNumber(product.pricing?.originalPrice, 0);
  }
  if (toNumber(product?.originalPrice, 0) > 0) {
    return toNumber(product.originalPrice, 0);
  }
  if (toNumber(product?.discountPrice, 0) > 0) {
    return toNumber(product.discountPrice, 0);
  }
  return 0;
}

function getDiscountPercent(product: PreviewProduct | null, currentPrice: number): number {
  if (!product) return 0;

  if (toNumber(product?.pricing?.offerPercentage, 0) > 0) {
    return toNumber(product.pricing?.offerPercentage, 0);
  }

  if (toNumber(product?.offerPercentage, 0) > 0) {
    return toNumber(product.offerPercentage, 0);
  }

  const originalPrice = getOriginalPrice(product);
  if (originalPrice > currentPrice && currentPrice > 0) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  return 0;
}

function getSelectedPrice(
  product: PreviewProduct | null,
  variant: ProductVariant | null,
  sizeObj: ProductVariantSize | null
): number {
  if (toNumber(sizeObj?.price, 0) > 0) return toNumber(sizeObj?.price, 0);
  if (toNumber(variant?.price, 0) > 0) return toNumber(variant?.price, 0);
  return getBasePrice(product);
}

function getSelectedStock(
  product: PreviewProduct | null,
  variant: ProductVariant | null,
  sizeObj: ProductVariantSize | null
): number {
  if (sizeObj) return toNumber(sizeObj?.stock, 0);

  if (variant && Array.isArray(variant.sizes) && variant.sizes.length > 0) {
    return variant.sizes.reduce(
      (sum, item) => sum + toNumber(item?.stock, 0),
      0
    );
  }

  if (toNumber(variant?.stock, 0) > 0) return toNumber(variant?.stock, 0);
  if (toNumber(product?.totalStock, 0) > 0) return toNumber(product?.totalStock, 0);
  if (toNumber(product?.stock, 0) > 0) return toNumber(product?.stock, 0);

  return 0;
}

function getSelectedImages(
  product: PreviewProduct | null,
  variant: ProductVariant | null,
  sizeObj: ProductVariantSize | null
): string[] {
  const urls: string[] = [];

  if (sizeObj) {
    if (Array.isArray(sizeObj.images)) {
      sizeObj.images.forEach((img) => {
        const url = getImageUrl(img);
        if (isNonEmptyString(url)) urls.push(url);
      });
    }
    if (isNonEmptyString(sizeObj.primaryImage)) {
      urls.push(sizeObj.primaryImage);
    }
  }

  if (variant) {
    if (Array.isArray(variant.images)) {
      variant.images.forEach((img) => {
        const url = getImageUrl(img);
        if (isNonEmptyString(url)) urls.push(url);
      });
    }
    if (isNonEmptyString(variant.primaryImage)) {
      urls.push(variant.primaryImage);
    }
  }

  if (isNonEmptyString(product?.media?.mainImage)) {
    urls.push(product.media!.mainImage!);
  }

  if (Array.isArray(product?.media?.galleryImages)) {
    product.media.galleryImages.forEach((img) => {
      const url = getImageUrl(img);
      if (isNonEmptyString(url)) urls.push(url);
    });
  }

  if (Array.isArray(product?.galleryImages)) {
    product.galleryImages.forEach((img) => {
      const url = getImageUrl(img);
      if (isNonEmptyString(url)) urls.push(url);
    });
  }

  if (Array.isArray(product?.images)) {
    product.images.forEach((img) => {
      const url = getImageUrl(img);
      if (isNonEmptyString(url)) urls.push(url);
    });
  }

  return Array.from(new Set(urls.filter(isNonEmptyString)));
}

export default function ProductPreviewModal({
  productId,
  onClose,
  onEdit,
}: ProductPreviewModalProps) {
  const [product, setProduct] = useState<PreviewProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);

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

  const colors = useMemo(() => getAllColors(product), [product]);

  useEffect(() => {
    if (colors.length > 0) {
      setSelectedColor((prev) => (prev && colors.includes(prev) ? prev : colors[0]));
    } else {
      setSelectedColor("");
    }
  }, [colors]);

  const selectedVariant = useMemo(
    () => getVariantByColor(product, selectedColor),
    [product, selectedColor]
  );

  const sizeLabels = useMemo(
    () => getSizeLabels(selectedVariant),
    [selectedVariant]
  );

  useEffect(() => {
    if (sizeLabels.length > 0) {
      setSelectedSize((prev) =>
        prev && sizeLabels.includes(prev) ? prev : sizeLabels[0]
      );
    } else {
      setSelectedSize("");
    }
  }, [sizeLabels]);

  const selectedSizeObj = useMemo(
    () => getSizeObject(selectedVariant, selectedSize),
    [selectedVariant, selectedSize]
  );

  const selectedImages = useMemo(
    () => getSelectedImages(product, selectedVariant, selectedSizeObj),
    [product, selectedVariant, selectedSizeObj]
  );

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor, selectedSize, productId]);

  const currentPrice = getSelectedPrice(product, selectedVariant, selectedSizeObj);
  const originalPrice = getOriginalPrice(product);
  const discountPercent = getDiscountPercent(product, currentPrice);
  const stock = getSelectedStock(product, selectedVariant, selectedSizeObj);

  const tags: string[] = [
    ...(Array.isArray(product?.hashtags) ? product.hashtags : []),
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
              <span className="text-sm font-medium">Loading product preview...</span>
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
                  {selectedImages[activeImage] ? (
                    <img
                      src={selectedImages[activeImage]}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#A1A1AA]">
                      <Package size={28} className="mb-2 opacity-50" />
                      <span className="text-xs">No image available</span>
                    </div>
                  )}
                </div>

                {selectedImages.length > 0 && (
                  <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                    {selectedImages.map((img, index) => (
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
                          alt={`${getProductName(product)}-${index + 1}`}
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
                    {getProductName(product)}
                  </h2>

                  <p className="text-[10px] text-[#A29AAD] mt-0.5">
                    SKU: {selectedSizeObj?.sku || getProductSku(product)}
                  </p>

                  <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                    <span className="text-[15px] font-bold text-[#EB5C8A]">
                      {formatPrice(currentPrice)}
                    </span>

                    {originalPrice > currentPrice ? (
                      <span className="text-[10px] text-[#9F98A7] line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    ) : null}

                    {discountPercent > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#DFF4E8] text-[#3D8B5D] text-[9px] font-semibold">
                        {discountPercent}% OFF
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
                          className={`w-6 h-6 rounded-[6px] border transition ${
                            selectedColor === color
                              ? "border-[#EB6F96] shadow-[0_0_0_1.5px_rgba(235,111,150,0.16)]"
                              : "border-transparent"
                          }`}
                          style={{
                            backgroundColor:
                              selectedVariant?.colorCode && color === selectedColor
                                ? selectedVariant.colorCode
                                : inferColorSwatch(color),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizeLabels.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-[#6B6572] mb-1.5">
                      Size
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {sizeLabels.map((sizeLabel) => (
                        <button
                          key={sizeLabel}
                          type="button"
                          onClick={() => setSelectedSize(sizeLabel)}
                          className={`min-w-[48px] px-2.5 h-7 rounded-[6px] border text-[10px] font-medium transition ${
                            selectedSize === sizeLabel
                              ? "border-[#EB6F96] text-[#EB6F96] bg-[#FFF7FA]"
                              : "border-[#E6E0E5] text-[#47414E] bg-white hover:border-[#EB6F96]"
                          }`}
                        >
                          {sizeLabel}
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
                    {product.description || "No description available."}
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