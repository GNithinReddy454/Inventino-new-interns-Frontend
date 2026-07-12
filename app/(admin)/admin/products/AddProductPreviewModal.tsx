"use client";

import Image from "next/image";
import { X, Package } from "lucide-react";
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
  storyTitle: string;
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

function resolvePreviewColor(color: string, colorSwatchMap: Record<string, string>) {
  const normalized = color.trim().toLowerCase();
  if (!normalized) return "#E5E7EB";

  if (colorSwatchMap[normalized]) return colorSwatchMap[normalized];

  const tokenFallbackMap: Record<string, string> = {
    aqua: "#00FFFF",
    blue: "#0000FF",
    red: "#FF0000",
    green: "#008000",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    brown: "#8B4513",
    grey: "#808080",
    gray: "#808080",
    black: "#000000",
    white: "#FFFFFF",
    pink: "#FFC0CB",
    navy: "#000080",
    teal: "#008080",
  };

  if (tokenFallbackMap[normalized]) return tokenFallbackMap[normalized];

  const words = normalized.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (colorSwatchMap[word]) return colorSwatchMap[word];
    if (tokenFallbackMap[word]) return tokenFallbackMap[word];
  }

  const raw = color.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(raw)) return raw;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(raw)) return raw;
  if (/^[a-zA-Z]+$/.test(raw)) return raw;

  return "#E5E7EB";
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
  storyTitle,
  variants,
  colorSwatchMap,
}: AddProductPreviewModalProps) {
  if (!open) return null;

  const productImages = variants.flatMap((variant) => variant.images);
  const activeMedia = productImages[0];
  const effectivePrice = salePrice || regularPrice || "0";
  const comparePrice = salePrice ? regularPrice : "";
  const colors = variants.map((variant) => variant.color);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-205 overflow-hidden rounded-2xl border border-[#E9DDE3] bg-[#FCFBFC] shadow-[0_20px_50px_rgba(30,20,30,0.16)]">
        <div className="flex items-center justify-between border-b border-[#F0E4E8] px-4 py-3">
          <h3 className="text-[14px] font-semibold text-[#201A24]">
            Product Preview
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6D6776] hover:bg-[#F7EEF2]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[344px_1fr]">
            <div>
              <div className="h-46 overflow-hidden rounded-[10px] border border-[#F0E4E8] bg-[#F6F2F4]">
                {activeMedia?.preview ? (
                  activeMedia.mediaType === "video" ? (
                    <video
                      src={activeMedia.preview}
                      className="h-full w-full object-cover"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={activeMedia.preview}
                      alt={name || "Product"}
                      width={344}
                      height={184}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-[#9CA3AF]">
                    <Package size={28} className="mb-2 opacity-50" />
                    <span className="text-xs">No image available</span>
                  </div>
                )}
              </div>

              {productImages.length > 0 && (
                <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                  {productImages.map((image) => (
                    <div
                      key={image.id}
                      className="h-13.5 w-13.5 shrink-0 overflow-hidden rounded-xl border border-[#EB6F96]"
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
                          width={54}
                          height={54}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-61.5 flex-col">
              <div>
                <h2 className="text-[16px] font-semibold leading-tight text-[#1F1728]">
                  {name || "Product"}
                </h2>

                <p className="mt-0.5 text-[10px] text-[#A29AAD]">
                  Status: {status || "-"}
                </p>

                <p className="mt-0.5 text-[10px] text-[#A29AAD]">
                  Category: {category || "-"}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-bold text-[#EB5C8A]">
                    ₹{Number(effectivePrice || 0).toLocaleString()}
                  </span>

                  {comparePrice ? (
                    <span className="text-[10px] text-[#9F98A7] line-through">
                      ₹{Number(comparePrice || 0).toLocaleString()}
                    </span>
                  ) : null}

                  {discountPercent ? (
                    <span className="rounded-full bg-[#DFF4E8] px-2 py-0.5 text-[9px] font-semibold text-[#3D8B5D]">
                      {discountPercent}% OFF
                    </span>
                  ) : null}
                </div>
              </div>

              {colors.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[10px] font-medium text-[#6B6572]">
                    Colour
                  </p>
                  <div className="flex gap-2">
                    {colors.map((color) => {
                      const hex = resolvePreviewColor(color, colorSwatchMap);

                      return (
                        <div
                          key={color}
                          title={color}
                          className="h-6 w-6 rounded-full border border-[#E6E0E5]"
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <p className="mb-1 text-[10px] font-medium text-[#6B6572]">
                  Description
                </p>
                <p className="text-[10px] leading-4 text-[#7B7482]">
                  {description || "No description available."}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[10px] font-medium text-[#6B6572]">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#F1EEF0] px-2 py-0.5 text-[9px] font-medium text-[#625B66]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(storyTitle || story) && (
                <div className="mt-3 rounded-[10px] border border-[#F0E4E8] bg-white p-3">
                  <p className="mb-1 text-[10px] font-medium text-[#6B6572]">
                    Story Preview
                  </p>
                  <p className="text-[11px] font-semibold text-[#1C1630]">
                    {storyTitle || "Untitled story"}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-[#7B7482]">
                    {story || "No story content added."}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8.5 w-full rounded-xl bg-[#EB5C8A] text-[11px] font-semibold text-white hover:bg-[#E35182]"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="mt-4 rounded-[12px] border border-[#F0E4E8] bg-white p-4">
              <p className="mb-3 text-[12px] font-semibold text-[#1C1630]">
                Variant Summary
              </p>

              <div className="space-y-3">
                {variants.map((variant) => {
                  const colorHex = resolvePreviewColor(variant.color, colorSwatchMap);

                  return (
                    <div
                      key={variant.id}
                      className="rounded-[10px] border border-[#F4E9ED] bg-[#FFFDFE] p-3"
                    >
                      <div className="mb-2 flex items-center gap-2.5">
                        {/* ✅ Dot removed — plain color circle only */}
                        <div
                          className="h-5 w-5 rounded-full border border-[#E6E0E5]"
                          style={{ backgroundColor: colorHex }}
                        />
                        <p className="text-[11px] font-semibold text-[#1C1630]">
                          {variant.color}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {variant.sizes.length > 0 ? (
                          variant.sizes.map((entry) => (
                            <span
                              key={`${variant.id}-${entry.size}`}
                              className="rounded-full bg-[#FCEAF1] px-2 py-0.5 text-[9px] font-medium text-[#EB5C8A]"
                            >
                              {entry.size} · stock {entry.stock} · {entry.sku || "No SKU"}
                            </span>
                          ))
                        ) : (
                          <p className="text-[10px] text-[#8E8794]">
                            No sizes added
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}