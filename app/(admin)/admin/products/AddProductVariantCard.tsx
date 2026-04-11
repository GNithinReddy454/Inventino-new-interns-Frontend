"use client";

import Image from "next/image";
import { ChevronDown, Upload, X, Plus } from "lucide-react";

export type VariantImageItem = {
  id: string;
  file: File;
  preview: string;
  mediaType: "image" | "video";
};

export type VariantSizeStock = {
  size: string;
  stock: string;
  sku: string;
  originalPrice: string;
  discountPrice: string;
};

export type ProductVariantGroup = {
  id: string;
  color: string;
  sizes: VariantSizeStock[];
  images: VariantImageItem[];
  expanded: boolean;
  material: string;
  stockStatus: "In Stock" | "Out of Stock";
};

interface AddProductVariantCardProps {
  variant: ProductVariantGroup;
  defaultSizeOptions: string[];
  customSizeValue: string;
  setCustomSizeValue: (value: string) => void;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onToggleSize: (size: string) => void;
  onAddCustomSize: () => void;
  onUpdateStock: (size: string, stock: string) => void;
  onUpdateSku: (size: string, sku: string) => void;
  onUpdateOriginalPrice: (size: string, price: string) => void;
  onUpdateDiscountPrice: (size: string, price: string) => void;
  onUpdateMaterial: (value: string) => void;
  onUpdateStockStatus: (value: "In Stock" | "Out of Stock") => void;
  onVariantImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVariantImage: (imageId: string) => void;
  colorSwatchMap: Record<string, string>;
}

export default function AddProductVariantCard({
  variant,
  defaultSizeOptions,
  customSizeValue,
  setCustomSizeValue,
  onToggleExpanded,
  onRemove,
  onToggleSize,
  onAddCustomSize,
  onUpdateStock,
  onUpdateSku,
  onUpdateOriginalPrice,
  onUpdateDiscountPrice,
  onUpdateMaterial,
  onUpdateStockStatus,
  onVariantImagesChange,
  onRemoveVariantImage,
  colorSwatchMap,
}: AddProductVariantCardProps) {
  const swatchColor = colorSwatchMap[variant.color.toLowerCase()] || "#E5E7EB";

  const getDiscountPercent = (originalPrice: string, discountPrice: string) => {
    const original = Number(originalPrice);
    const discount = Number(discountPrice);

    if (!Number.isFinite(original) || original <= 0) return "";
    if (!Number.isFinite(discount) || discount <= 0 || discount >= original) return "";

    return String(Math.round(((original - discount) / original) * 100));
  };

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#F0E3E7] bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleExpanded();
            }
          }}
        >
          <div
            className="h-6 w-6 rounded-[6px] border border-[#E6E0E5]"
            style={{ backgroundColor: swatchColor }}
          />
          <div>
            <p className="text-[12px] font-semibold text-[#1C1630]">
              {variant.color}
            </p>
            <p className="text-[10px] text-[#8E8794]">
              {variant.sizes.length} sizes • {variant.images.length} images
            </p>
          </div>
        </div>

        <div className="ml-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] font-medium text-[#E74C3C] hover:text-[#C7372A]"
          >
            Remove
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="text-[#8E8794] hover:text-[#6D6776]"
          >
            <ChevronDown
              size={15}
              className={`transition-transform ${
                variant.expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {variant.expanded ? (
        <div className="border-t border-[#F1E3E8] bg-[#FFFDFC] p-4">
          <div className="mb-5 space-y-4">
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="h-5 w-5 rounded-[5px] border border-[#E6E0E5]"
                style={{ backgroundColor: swatchColor }}
              />
              <p className="text-[12px] font-semibold text-[#1C1630]">
                {variant.color}
              </p>
            </div>

            <h4 className="mb-1 text-[12px] font-semibold text-[#1C1630]">
              Size Per Color
            </h4>
            <p className="mb-3 text-[10px] text-[#8E8794]">
              Each color can have different sizes
            </p>

            <div className="flex flex-wrap gap-2">
              {defaultSizeOptions.map((size) => {
                const selected = variant.sizes.some((entry) => entry.size === size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onToggleSize(size)}
                    className={`rounded-xl border px-3 py-1.5 text-[10px] font-medium transition ${
                      selected
                        ? "border-[#EB5C8A] bg-[#FFF4F7] text-[#EB5C8A]"
                        : "border-[#E6E0E5] bg-white text-[#5C5562] hover:border-[#F1A6BC]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customSizeValue}
                onChange={(e) => setCustomSizeValue(e.target.value)}
                placeholder="Add Custom Size"
                className="h-9 flex-1 rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] text-[#1C1630] placeholder:text-[#B5AEB8] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
              />
              <button
                type="button"
                onClick={onAddCustomSize}
                className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-dashed border-[#F3A9BF] bg-[#FFF7FA] px-3 text-[11px] font-semibold text-[#EB5C8A] hover:bg-[#FDF0F5]"
              >
                <Plus size={12} />
                Add
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#4B4453]">
                  Material
                </label>
                <input
                  type="text"
                  value={variant.material}
                  onChange={(e) => onUpdateMaterial(e.target.value)}
                  placeholder="e.g. Gold plated brass"
                  className="h-9.5 w-full rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] text-[#1C1630] placeholder:text-[#B5AEB8] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#4B4453]">
                  Stock Status
                </label>
                <div className="relative">
                  <select
                    value={variant.stockStatus}
                    onChange={(e) =>
                      onUpdateStockStatus(e.target.value as "In Stock" | "Out of Stock")
                    }
                    className="h-9.5 w-full appearance-none rounded-[10px] border border-[#F2B8C8] bg-[#FFF8FA] px-3 pr-9 text-[12px] text-[#1C1630] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A199A7]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-[12px] font-semibold text-[#1C1630]">
              Add Images / Videos
            </h4>

            <label className="inline-flex h-9.5 cursor-pointer items-center rounded-[10px] border border-dashed border-[#F3A9BF] bg-[#FFF7FA] px-4 text-[11px] font-semibold text-[#EB5C8A] hover:bg-[#FDF0F5]">
              <Upload size={13} className="mr-2" />
              Upload Variant Media
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={onVariantImagesChange}
              />
            </label>

            <p className="mt-2 text-[10px] text-[#8E8794]">
              Video previews are supported in form UI. Product upload currently saves images only.
            </p>

            {variant.images.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {variant.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative h-17 w-17 overflow-hidden rounded-[10px] border border-[#E8E3E7]"
                  >
                    {image.mediaType === "video" ? (
                      <video
                        src={image.preview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={image.preview}
                        alt={image.file.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveVariantImage(image.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E74C3C] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {variant.sizes.length > 0 ? (
            <div>
              <h4 className="mb-3 text-[12px] font-semibold text-[#1C1630]">
                Variant Size Details
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {variant.sizes.map((entry) => (
                  <div
                    key={`${variant.id}-${entry.size}`}
                    className="rounded-[10px] border border-[#F1E3E8] bg-white p-3"
                  >
                    <div className="mb-2 inline-flex rounded-full bg-[#FCEAF1] px-2 py-0.5 text-[9px] font-semibold text-[#EB5C8A]">
                      {entry.size}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block text-[9px] font-semibold text-[#6B6572]">
                          Original Price
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={entry.originalPrice}
                          placeholder="999"
                          onChange={(e) =>
                            onUpdateOriginalPrice(
                              entry.size,
                              e.target.value.replace(/[^\d.]/g, "")
                            )
                          }
                          className="h-8.5 w-full rounded-xl border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-semibold text-[#6B6572]">
                          Discount Price
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={entry.discountPrice}
                          placeholder="899"
                          onChange={(e) =>
                            onUpdateDiscountPrice(
                              entry.size,
                              e.target.value.replace(/[^\d.]/g, "")
                            )
                          }
                          className="h-8.5 w-full rounded-xl border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-semibold text-[#6B6572]">
                          Discount Percent
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={getDiscountPercent(entry.originalPrice, entry.discountPrice)}
                            placeholder="10"
                            className="h-8.5 w-full rounded-xl border border-[#F2B8C8] bg-[#FFF8FA] px-3 pr-7 text-[12px] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#A199A7]">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-semibold text-[#6B6572]">
                          Stock
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={entry.stock}
                          placeholder="25"
                          onChange={(e) =>
                            onUpdateStock(entry.size, e.target.value.replace(/\D/g, ""))
                          }
                          className="h-8.5 w-full rounded-xl border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-semibold text-[#6B6572]">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={entry.sku}
                          onChange={(e) => onUpdateSku(entry.size, e.target.value)}
                          placeholder={`${variant.color}-${entry.size}`}
                          className="h-8.5 w-full rounded-xl border border-[#F2B8C8] bg-[#FFF8FA] px-3 text-[12px] focus:border-[#EB5C8A] focus:outline-none focus:ring-1 focus:ring-[#EB5C8A]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}