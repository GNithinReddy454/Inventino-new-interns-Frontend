"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { ProductVariantGroup } from "./AddProductVariantCard";

interface AddProductPreviewModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  description: string;
  category: string;
  tags: string[];
  regularPrice: string;
  salePrice: string;
  discountPercent: string;
  status: string;
  story: string;
  storyMedia: string;
  variants: ProductVariantGroup[];
  colorSwatchMap: Record<string, string>;
}

function getReadableTextColor(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#111827";

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? "#111827" : "#FFFFFF";
}

export default function AddProductPreviewModal({
  open,
  onClose,
  name,
  description,
  category,
  tags,
  regularPrice,
  salePrice,
  discountPercent,
  status,
  story,
  storyMedia,
  variants,
  colorSwatchMap,
}: AddProductPreviewModalProps) {
  if (!open) return null;

  const productImages = variants.flatMap((variant) => variant.images);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">Product Preview</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="rounded-xl border p-4">
              <p className="mb-2 text-xs font-bold text-gray-500">Basic Info</p>
              <p className="font-semibold">{name || "—"}</p>
              <p className="mt-1 text-sm text-gray-500">{category || "—"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                {description || "—"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tags added</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <p className="mb-2 text-xs font-bold text-gray-500">Pricing</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Regular Price: ₹{regularPrice || "0.00"}</div>
                <div>Sale Price: ₹{salePrice || "0.00"}</div>
                <div>Discount: {discountPercent || "0"}%</div>
                <div>Status: {status || "—"}</div>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <p className="mb-2 text-xs font-bold text-gray-500">Story</p>
              <p className="text-sm font-medium text-gray-800">
                {storyMedia || "No story title"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                {story || "No story content added"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="mb-2 text-xs font-bold text-gray-500">Product Images</p>
              <div className="flex flex-wrap gap-3">
                {productImages.length > 0 ? (
                  productImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={image.preview}
                        alt={image.file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No product images added</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border p-4">
              <p className="mb-3 text-xs font-bold text-gray-500">Variants</p>

              <div className="space-y-4">
                {variants.length > 0 ? (
                  variants.map((variant) => {
                    const colorHex =
                      colorSwatchMap[variant.color.toLowerCase()] || "#E5E7EB";

                    return (
                      <div key={variant.id} className="rounded-xl border p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div
                            className="flex h-8 min-w-8 items-center justify-center rounded-full border"
                            style={{
                              backgroundColor: colorHex,
                              color: getReadableTextColor(colorHex),
                            }}
                          >
                            ●
                          </div>

                          <div>
                            <p className="font-semibold">{variant.color}</p>
                            <p className="text-xs text-gray-500">{colorHex}</p>
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          {variant.sizes.length > 0 ? (
                            variant.sizes.map((entry) => (
                              <span
                                key={`${variant.id}-${entry.size}`}
                                className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700"
                              >
                                {entry.size} · stock {entry.stock}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No sizes added</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {variant.images.length > 0 ? (
                            variant.images.map((image) => (
                              <div
                                key={image.id}
                                className="relative h-16 w-16 overflow-hidden rounded-lg border"
                              >
                                <Image
                                  src={image.preview}
                                  alt={image.file.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No images for this color
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No variants added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}