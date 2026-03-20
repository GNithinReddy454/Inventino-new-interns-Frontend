"use client";

import Image from "next/image";
import { ChevronDown, Upload, X, Plus } from "lucide-react";

export type VariantImageItem = {
  id: string;
  file: File;
  preview: string;
};

export type VariantSizeStock = {
  size: string;
  stock: number;
};

export type ProductVariantGroup = {
  id: string;
  color: string;
  sizes: VariantSizeStock[];
  images: VariantImageItem[];
  expanded: boolean;
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
  onUpdateStock: (size: string, stock: number) => void;
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
  onVariantImagesChange,
  onRemoveVariantImage,
  colorSwatchMap,
}: AddProductVariantCardProps) {
  const swatchColor = colorSwatchMap[variant.color.toLowerCase()] || "#E5E7EB";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#F1E3E8] bg-white">
      <div className="flex items-center justify-between bg-white px-5 py-4">
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
            className="h-8 w-8 rounded-lg border border-gray-200"
            style={{ backgroundColor: swatchColor }}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{variant.color}</p>
            <p className="text-xs text-gray-500">
              {variant.sizes.length} sizes • {variant.images.length} images
            </p>
          </div>
        </div>

        <div className="ml-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Remove
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${variant.expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {variant.expanded && (
        <div className="border-t border-[#F1E3E8] bg-[#FFFDFC] p-5">
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="h-6 w-6 rounded-md border border-gray-200"
                style={{ backgroundColor: swatchColor }}
              />
              <p className="text-sm font-semibold text-gray-900">{variant.color}</p>
            </div>

            <h4 className="mb-1 text-sm font-bold text-gray-900">Size Per Color</h4>
            <p className="mb-4 text-xs text-gray-500">
              Each color can have different sizes
            </p>

            <div className="flex flex-wrap gap-2">
              {defaultSizeOptions.map((size) => {
                const selected = variant.sizes.some(
                  (entry) => entry.size === size
                );

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onToggleSize(size)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                      selected
                        ? "border-[#E91E63] bg-pink-50 text-[#E91E63]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customSizeValue}
                onChange={(e) => setCustomSizeValue(e.target.value)}
                placeholder="Add Custom Size (e.g., 16.5 cm or 30)"
                className="flex-1 rounded-xl border border-pink-200 bg-[#FDF2F5] px-4 py-3 text-sm transition-all focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
              />
              <button
                type="button"
                onClick={onAddCustomSize}
                className="rounded-xl border border-dashed border-pink-300 bg-pink-50 px-4 py-3 text-xs font-bold text-[#E91E63] hover:bg-pink-100"
              >
                <Plus size={14} className="mr-1 inline" />
                Add
              </button>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold text-gray-900">Add Images</h4>

            <label className="inline-flex cursor-pointer items-center rounded-xl border border-dashed border-pink-300 bg-pink-50 px-4 py-3 text-xs font-bold text-[#E91E63] hover:bg-pink-100">
              <Upload size={14} className="mr-2" />
              Upload Variant Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onVariantImagesChange}
              />
            </label>

            {variant.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {variant.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200"
                  >
                    <Image
                      src={image.preview}
                      alt={image.file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveVariantImage(image.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {variant.sizes.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900">Stock Quantity</h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {variant.sizes.map((entry) => (
                  <div
                    key={`${variant.id}-${entry.size}`}
                    className="rounded-xl border border-[#F1E3E8] bg-white p-3"
                  >
                    <div className="mb-2 inline-flex rounded-full bg-pink-100 px-2 py-1 text-[10px] font-semibold text-[#E91E63]">
                      {entry.size}
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={entry.stock}
                      onChange={(e) =>
                        onUpdateStock(entry.size, Number(e.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-pink-200 bg-[#FDF2F5] px-3 py-2 text-sm transition-all focus:border-[#E91E63] focus:outline-none focus:ring-1 focus:ring-[#E91E63]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}