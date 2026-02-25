import { ApiProduct, NormalizedProduct } from "@/types/products.type";


const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/f9f0f4/D94F7A?text=No+Image";

export function normalize(p: ApiProduct): NormalizedProduct {
  const imageUrls = p.images
    ?.map((img) => img.url)
    .filter((url) => url && url.trim() !== "") ?? [];

  // If no valid images returned, fall back to placeholder
  const primaryImage = imageUrls[0] ?? PLACEHOLDER_IMAGE;
  const allImages    = imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];

  return {
    id:          p._id,
    name:        p.name,
    description: p.description ?? "",
    price:       p.price,
    image:       primaryImage,
    images:      allImages,
    category:    p.category,
    stock:       p.stock,
    slug:        p.slug,
    rating:      4.7,
    reviews:     0,
    tags:        [p.category, "Adjustable"],
  };
}

