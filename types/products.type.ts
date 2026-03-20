export interface ProductImage {
  id?: string;
  _id?: string;
  url?: string;
}

export type ProductImageInput = string | ProductImage;

export interface ApiProduct {
  _id: string;
  productId?: string;
  productName?: string;
  name?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  category?: string;
  stock?: number;
  slug?: string;
  images?: ProductImageInput[];
  galleryImages?: ProductImageInput[];
  mainImage?: string;
  imageUrl?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  bestSeller?: boolean;
  trendy?: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
  hashtags?: string[] | string;
  material?: string;
  size?: string;
  color?: string;
  colors?: any[];
  sizes?: any[];
  prices?: any[];
  createdAt?: string;
  updatedAt?: string;
  story?: string;
  sku?: string;
  variants?: any[];
  [key: string]: any;
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
  sort?: "featured" | "priceAsc" | "priceDesc" | "newest";
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