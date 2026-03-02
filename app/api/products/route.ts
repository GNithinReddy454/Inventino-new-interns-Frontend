import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9"); // Default to 9
  const sort = searchParams.get("sort") || "featured";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search") || "";
  const priceMin = searchParams.get("price_min")
    ? parseFloat(searchParams.get("price_min")!)
    : undefined;
  const priceMax = searchParams.get("price_max")
    ? parseFloat(searchParams.get("price_max")!)
    : undefined;

  let filteredProducts = products.map((p) => ({
    _id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    category: p.category
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()), // e.g., "hair-accessories" -> "Hair Accessories"
    stock: 10, // Assume stock
    slug: p.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    images: [{ url: p.image }],
  }));

  // Filter by type
  if (type !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === type.toLowerCase(),
    );
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower),
    );
  }

  // Filter by price
  if (priceMin !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.price >= priceMin);
  }
  if (priceMax !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.price <= priceMax);
  }

  // Sort
  switch (sort) {
    case "price_asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      filteredProducts.sort((a, b) => b._id - a._id);
      break;
    case "featured":
    default:
      // Assume featured is default order
      break;
  }

  // Paginate
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filteredProducts.slice(startIndex, endIndex);

  const meta = {
    total,
    page,
    limit,
    totalPages,
  };

  return NextResponse.json({
    data: {
      items: paginatedItems,
      meta,
    },
  });
}
