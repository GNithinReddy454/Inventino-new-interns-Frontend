import {
  AddProductCanonicalState,
  AddProductCreatePayload,
  ValidationResult,
} from "./types";
import { validateAddProductDraft, validateAddProductPublish } from "./validators";

function normalizeStringList(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
}

export function toAddProductPayload(
  input: AddProductCanonicalState,
): AddProductCreatePayload {
  return {
    name: input.basicInformation.name.trim(),
    description: input.basicInformation.description.trim(),
    category: input.basicInformation.category.trim(),
    subCategory: input.basicInformation.subCategory.trim() || undefined,
    price: input.pricingInventory.price.trim(),
    salePrice: input.pricingInventory.salePrice.trim() || undefined,
    discount: input.pricingInventory.discount.trim() || undefined,
    material: input.pricingInventory.material.trim(),
    stock: input.pricingInventory.stock.trim(),
    stockStatus: input.pricingInventory.stockStatus,
    tags: normalizeStringList(input.tags),
    colors: normalizeStringList(input.productColor.selectedColors),
    isFeatured: input.publishSetting.isFeatured,
    reviewsEnabled: input.publishSetting.reviewsEnabled,
    freeShipping: input.shipping.freeShipping,
    weight: input.shipping.weight.trim() || undefined,
    length: input.shipping.length.trim() || undefined,
    width: input.shipping.width.trim() || undefined,
    height: input.shipping.height.trim() || undefined,
    metaTitle: input.seo.metaTitle.trim() || undefined,
    metaDescription: input.seo.metaDescription.trim() || undefined,
    storyTitle: input.storyHeader.storyTitle.trim(),
    storyContent: input.storyHeader.storyContent.trim(),
    quoteText: input.storyHeader.quoteText.trim() || undefined,
    quoteAuthor: input.storyHeader.quoteAuthor.trim() || undefined,
    artisanSteps: input.artisanInformation.artisanSteps
      .map((step) => ({
        title: step.title.trim(),
        description: step.description.trim(),
      }))
      .filter((step) => step.title || step.description),
    storySettings: input.storySettings,
    linkedProduct: input.linkedProduct.linkedProduct.trim() || undefined,
    storyTags: normalizeStringList(input.tagsKeywords.storyTags),
    featuredStory: input.tagsKeywords.featuredStory,
    status: input.publishSetting.status,
    visibility: input.publishSetting.visibility,
  };
}

export function buildDraftPayload(
  input: AddProductCanonicalState,
): ValidationResult<AddProductCreatePayload> {
  const validation = validateAddProductDraft(input);
  if (!validation.isValid || !validation.data) {
    return {
      isValid: false,
      data: null,
      issues: validation.issues,
    };
  }

  return {
    isValid: true,
    data: toAddProductPayload(validation.data),
    issues: [],
  };
}

export function buildPublishPayload(
  input: AddProductCanonicalState,
): ValidationResult<AddProductCreatePayload> {
  const validation = validateAddProductPublish(input);
  if (!validation.isValid || !validation.data) {
    return {
      isValid: false,
      data: null,
      issues: validation.issues,
    };
  }

  return {
    isValid: true,
    data: toAddProductPayload(validation.data),
    issues: [],
  };
}
