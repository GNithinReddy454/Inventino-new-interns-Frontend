// ─── Raw API shape ─────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  slug: string;
  images: ProductImage[];
}

export interface ProductListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListResponse {
  statusCode: number;
  message: string;
  data: {
    items: ApiProduct[];
    meta: ProductListMeta;
  };
}

export interface ProductDetailResponse {
  statusCode: number;
  message: string;
  data: ApiProduct;
}

export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  sort?: "featured" | "price_asc" | "price_desc" | "newest" | "rating";
  category?: string;
  search?: string;
}

// ─── Normalized shape used by UI components ────────────────────────────────────

export interface NormalizedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  stock: number;
  slug: string;
  rating: number;
  reviews: number;
  badge?: { text: string; color: string };
  tags: string[];
}
