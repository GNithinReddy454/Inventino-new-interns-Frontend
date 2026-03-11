import { AddProductCanonicalState } from "./types";

export const ADD_PRODUCT_DEFAULTS: AddProductCanonicalState = {
  basicInformation: {
    name: "",
    description: "",
    category: "",
    subCategory: "",
  },
  publishSetting: {
    status: "published",
    visibility: "public",
    isFeatured: true,
    reviewsEnabled: false,
  },
  pricingInventory: {
    price: "",
    salePrice: "",
    discount: "",
    material: "",
    stock: "",
    stockStatus: "In Stock",
  },
  shipping: {
    weight: "",
    length: "",
    width: "",
    height: "",
    freeShipping: true,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
  },
  productColor: {
    selectedColors: [],
  },
  sizes: {
    sizes: [],
  },
  storyHeader: {
    storyTitle: "",
    storyContent: "",
    quoteText: "",
    quoteAuthor: "",
  },
  linkedProduct: {
    linkedProduct: "",
  },
  storySettings: {
    displayStory: true,
    showArtisanBadge: true,
    showTimeline: true,
    showQuote: true,
  },
  tagsKeywords: {
    storyTags: [],
    featuredStory: false,
  },
  artisanInformation: {
    artisanSteps: [{ title: "", description: "" }],
  },
  productImage: {
    imageFiles: [],
    storyImageFile: null,
  },
  tags: ["Handmade", "Rose Gold", "Bracelet"],
};
