export interface ProductImage {
  id: string;
  url: string;
}

export interface ApiProduct {
  _id: string;
  name?: string;
  productName?: string; // New field
  description: string;
  price?: number;
  originalPrice?: number | null; // Added for legacy support
  discountPrice?: number;
  pricing?: { // New structure
    price: number;
    originalPrice?: number | null;
    offerPercentage?: number | null;
    taxIncluded?: boolean;
  };
  category: string;
  stock?: number;
  totalStock?: number; // New field
  slug: string;
  images?: ProductImage[];
  media?: { // New structure
    mainImage?: string | null;
    galleryImages?: ProductImage[];
  };
  isActive: boolean;
  isDeleted: boolean;
  bestSeller: boolean;
  trendy: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
  rating?: number; // New field
  reviewCount?: number; // New field
  productId: string;
  hashtags?: string[];
  material?: string;
  size?: string;
  color?: string;
  colors?: any[];
  sizes?: any[];
  prices?: any[];
  createdAt: string;
  updatedAt: string;
  story?: {
    title?: string;
    content?: string;
    isDisplayed?: boolean;
    featured?: boolean;
  };
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