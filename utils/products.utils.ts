import { ApiProduct, NormalizedProduct, ProductImageInput } from "@/types/products.type";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x400/f9f0f4/D94F7A?text=No+Image";

function parseHashtags(raw: unknown): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    if (raw.length === 1 && typeof raw[0] === "string") {
      const first = raw[0].trim();

      if (first.startsWith("[")) {
        try {
          const parsed = JSON.parse(first);
          if (Array.isArray(parsed)) {
            return parsed.map(String).filter(Boolean);
          }
        } catch {
          // ignore parse error
        }
      }

      return first
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return raw.map(String).filter(Boolean);
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      // ignore parse error
    }

    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

function getImageUrl(img: ProductImageInput | undefined): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || "";
}

function normalizeImageArray(images?: ProductImageInput[]): string[] {
  const urls = (images ?? []).map(getImageUrl).filter(Boolean);
  return urls.length > 0 ? urls : [PLACEHOLDER_IMAGE];
}

function resolvePrimaryImage(p: ApiProduct): string {
  if (p.mainImage) return p.mainImage;
  if (p.imageUrl) return p.imageUrl;

  const galleryUrls = normalizeImageArray(p.galleryImages);
  if (galleryUrls[0] && galleryUrls[0] !== PLACEHOLDER_IMAGE) return galleryUrls[0];

  const imageUrls = normalizeImageArray(p.images);
  if (imageUrls[0]) return imageUrls[0];

  return PLACEHOLDER_IMAGE;
}

function resolveAllImages(p: ApiProduct): string[] {
  const galleryUrls = normalizeImageArray(p.galleryImages);
  if (galleryUrls[0] && galleryUrls[0] !== PLACEHOLDER_IMAGE) return galleryUrls;

  return normalizeImageArray(p.images);
}

function resolveBadge(p: ApiProduct): { text: string; color: string } | undefined {
  if (p.bestSeller) return { text: "Best Seller", color: "gold" };
  if (p.trendy) return { text: "Trending", color: "pink" };
  const basePrice = p.pricing?.price ?? p.discountPrice ?? p.price;
  const original = p.pricing?.originalPrice ?? p.price;
  if (basePrice && original && basePrice < original) {
    const pct = Math.round(((original - basePrice) / original) * 100);
    return { text: `${pct}% OFF`, color: "green" };
  }

  return undefined;
}

export function normalize(p: ApiProduct): NormalizedProduct {
  const tags = parseHashtags(p.hashtags);

  const name = p.productName || p.name || (typeof p.story === 'object' ? p.story?.title : undefined) || "Unnamed Product";
  const desc = p.description || (typeof p.story === 'object' ? p.story?.content : undefined) || "";
  const priceVal = p.pricing?.price ?? p.discountPrice ?? p.price ?? 0;
  const originalPrice = p.pricing?.originalPrice ?? p.price ?? 0;
  const stock = p.totalStock ?? p.stock ?? 0;
  const rating = p.rating ?? p.ratingsAverage ?? 0;
  const reviews = p.reviewCount ?? p.ratingsCount ?? 0;
  
  const mainImage = p.media?.mainImage || p.mainImage || p.imageUrl || getImageUrl(p.images?.[0]) || PLACEHOLDER_IMAGE;
  const gallery = p.media?.galleryImages?.map(img => getImageUrl(img)).filter((url): url is string => !!url) || p.images?.map(img => getImageUrl(img)).filter((url): url is string => !!url) || [];

  return {
    id:            p._id || p.productId || Math.random().toString(36).substr(2, 9),
    name:          name,
    description:   desc,
    price:         priceVal,
    originalPrice: originalPrice,
    discountPrice: p.discountPrice,
    image:         mainImage,
    images:        gallery.length > 0 ? gallery : [mainImage],
    category:      p.category || "General",
    stock:         stock,
    slug:          p.slug || "",
    rating:        rating,
    reviews:       reviews,
    badge:         resolveBadge(p),
    tags:          tags.length > 0 ? tags : [p.category].filter(Boolean) as string[],
    bestSeller:    p.bestSeller || (typeof p.story === 'object' ? p.story?.featured : undefined) || false,
    trendy:        p.trendy || false,
  };
}