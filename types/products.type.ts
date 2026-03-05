export interface ProductImage {
  id: string;
  url: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  slug: string;
  images: ProductImage[];
  isActive: boolean;
  isDeleted: boolean;
  bestSeller: boolean;
  trendy: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  productId: string;
  hashtags: string[];
  material?: string;
  size?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
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
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface NormalizedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  image: string;
  images: string[];
  category: string;
  stock: number;
  slug: string;
  rating: number;
  reviews: number;
  badge?: { text: string; color: string };
  tags: string[];
  bestSeller: boolean;
  trendy: boolean;
}