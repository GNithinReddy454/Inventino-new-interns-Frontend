import { ApiProduct, NormalizedProduct } from "@/types/products.type";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x400/f9f0f4/D94F7A?text=No+Image";

function parseHashtags(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    if (raw.length === 1 && typeof raw[0] === "string") {
      const first = raw[0].trim();
      if (first.startsWith("[")) {
        try {
          const parsed = JSON.parse(first);
          if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        } catch {}
      }
      return first.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function resolveBadge(p: ApiProduct): { text: string; color: string } | undefined {
  if (p.bestSeller) return { text: "Best Seller", color: "gold" };
  if (p.trendy) return { text: "Trending", color: "pink" };
  if (p.discountPrice && p.discountPrice < p.price) {
    const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
    return { text: `${pct}% OFF`, color: "green" };
  }
  return undefined;
}

export function normalize(p: ApiProduct): NormalizedProduct {
  const tags = parseHashtags(p.hashtags);

  return {
    id:            p._id,
    name:          p.name,
    description:   p.description,
    price:         p.discountPrice ?? p.price,
    originalPrice: p.price,
    discountPrice: p.discountPrice,
    image:         p.images?.[0]?.url ?? PLACEHOLDER_IMAGE,
    images:        p.images?.map((img) => img.url) ?? [],
    category:      p.category,
    stock:         p.stock,
    slug:          p.slug,
    rating:        p.ratingsAverage,
    reviews:       p.ratingsCount,
    badge:         resolveBadge(p),
    tags:          tags.length > 0 ? tags : [p.category].filter(Boolean) as string[],
    bestSeller:    p.bestSeller,
    trendy:        p.trendy,
  };
}