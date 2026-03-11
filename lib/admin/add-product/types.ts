export type PublishStatus = "published" | "draft";
export type VisibilityStatus = "public" | "private";

export interface BasicInformationSection {
  name: string;
  description: string;
  category: string;
  subCategory: string;
}

export interface PublishSettingSection {
  status: PublishStatus;
  visibility: VisibilityStatus;
  isFeatured: boolean;
  reviewsEnabled: boolean;
}

export interface PricingInventorySection {
  price: string;
  salePrice: string;
  discount: string;
  material: string;
  stock: string;
  stockStatus: "In Stock" | "Out of Stock";
}

export interface ShippingSection {
  weight: string;
  length: string;
  width: string;
  height: string;
  freeShipping: boolean;
}

export interface SEOSection {
  metaTitle: string;
  metaDescription: string;
}

export interface ProductColorSection {
  selectedColors: string[];
}

export interface SizesSection {
  sizes: string[];
}

export interface StoryHeaderSection {
  storyTitle: string;
  storyContent: string;
  quoteText: string;
  quoteAuthor: string;
}

export interface LinkedProductSection {
  linkedProduct: string;
}

export interface StorySettingsSection {
  displayStory: boolean;
  showArtisanBadge: boolean;
  showTimeline: boolean;
  showQuote: boolean;
}

export interface TagsKeywordsSection {
  storyTags: string[];
  featuredStory: boolean;
}

export interface ArtisanStep {
  title: string;
  description: string;
}

export interface ArtisanInformationSection {
  artisanSteps: ArtisanStep[];
}

export interface ProductImageSection {
  imageFiles: File[];
  storyImageFile: File | null;
}

export interface AddProductCanonicalState {
  basicInformation: BasicInformationSection;
  publishSetting: PublishSettingSection;
  pricingInventory: PricingInventorySection;
  shipping: ShippingSection;
  seo: SEOSection;
  productColor: ProductColorSection;
  sizes: SizesSection;
  storyHeader: StoryHeaderSection;
  linkedProduct: LinkedProductSection;
  storySettings: StorySettingsSection;
  tagsKeywords: TagsKeywordsSection;
  artisanInformation: ArtisanInformationSection;
  productImage: ProductImageSection;
  tags: string[];
}

export interface AddProductCreatePayload {
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: string;
  salePrice?: string;
  discount?: string;
  material: string;
  stock: string;
  stockStatus: "In Stock" | "Out of Stock";
  tags: string[];
  colors: string[];
  isFeatured: boolean;
  reviewsEnabled: boolean;
  freeShipping: boolean;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  metaTitle?: string;
  metaDescription?: string;
  storyTitle: string;
  storyContent: string;
  quoteText?: string;
  quoteAuthor?: string;
  artisanSteps: ArtisanStep[];
  storySettings: StorySettingsSection;
  linkedProduct?: string;
  storyTags: string[];
  featuredStory: boolean;
  status: PublishStatus;
  visibility: VisibilityStatus;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  issues: ValidationIssue[];
}
