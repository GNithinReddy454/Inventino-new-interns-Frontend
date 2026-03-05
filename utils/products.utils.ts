import { ApiProduct, NormalizedProduct } from "@/types/products.type";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x400/f9f0f4/D94F7A?text=No+Image";

export function normalize(p: ApiProduct): NormalizedProduct {
  // ✅ images is array of { id, url } objects
  const imageUrls =
    p.images
      ?.map((img) => img.url)
      .filter((url) => url && url.trim() !== "") ?? [];

  const primaryImage = imageUrls[0] ?? PLACEHOLDER_IMAGE;
  const allImages = imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];

  // ✅ Build badge from bestSeller / trendy flags
  let badge: { text: string; color: string } | undefined;
  if (p.bestSeller) badge = { text: "Best Seller", color: "gold" };
  else if (p.trendy) badge = { text: "Trending", color: "pink" };

  return {
    id: p._id,
    name: p.name,
    description: p.description ?? "",
    price: p.discountPrice ?? p.price,   // ✅ show discounted price if available
    originalPrice: p.discountPrice ? p.price : undefined,
    discountPrice: p.discountPrice,
    image: primaryImage,
    images: allImages,
    category: p.category,
    stock: p.stock,
    slug: p.slug,
    rating: p.ratingsAverage ?? 0,
    reviews: p.ratingsCount ?? 0,
    badge,
    tags: [...(p.hashtags ?? []), p.category],
    bestSeller: p.bestSeller ?? false,
    trendy: p.trendy ?? false,
  };
}