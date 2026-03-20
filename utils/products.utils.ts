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

  if (
    typeof p.discountPrice === "number" &&
    typeof p.price === "number" &&
    p.discountPrice < p.price
  ) {
    const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
    return { text: `${pct}% OFF`, color: "green" };
  }

  return undefined;
}

export function normalize(p: ApiProduct): NormalizedProduct {
  const tags = parseHashtags(p.hashtags);

  const safeName = p.name || p.productName || "Untitled Product";
  const safeDescription = p.description || "";
  const safePrice = typeof p.price === "number" ? p.price : 0;
  const safeDiscountPrice =
    typeof p.discountPrice === "number" ? p.discountPrice : undefined;
  const safeCategory = p.category || "";
  const safeStock = typeof p.stock === "number" ? p.stock : 0;
  const safeSlug = p.slug || "";
  const safeRating =
    typeof p.ratingsAverage === "number" ? p.ratingsAverage : 0;
  const safeReviews =
    typeof p.ratingsCount === "number" ? p.ratingsCount : 0;

  return {
    id: p._id,
    name: safeName,
    description: safeDescription,
    price: safeDiscountPrice ?? safePrice,
    originalPrice: safePrice,
    discountPrice: safeDiscountPrice,
    image: resolvePrimaryImage(p),
    images: resolveAllImages(p),
    category: safeCategory,
    stock: safeStock,
    slug: safeSlug,
    rating: safeRating,
    reviews: safeReviews,
    badge: resolveBadge(p),
    tags: tags.length > 0 ? tags : [safeCategory].filter(Boolean),
    bestSeller: !!p.bestSeller,
    trendy: !!p.trendy,
  };
}