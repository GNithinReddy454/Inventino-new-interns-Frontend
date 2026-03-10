import { z } from "zod";
import {
  AddProductCanonicalState,
  ValidationIssue,
  ValidationResult,
} from "./types";

const optionalNumberString = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Number(v)), {
    message: "Must be a valid number",
  });

const nonNegativeNumberString = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message: "Must be a non-negative number",
  });

const baseSchema = z.object({
  basicInformation: z.object({
    name: z.string().trim(),
    description: z.string().trim(),
    category: z.string().trim(),
    subCategory: z.string().trim(),
  }),
  publishSetting: z.object({
    status: z.enum(["published", "draft"]),
    visibility: z.enum(["public", "private"]),
    isFeatured: z.boolean(),
    reviewsEnabled: z.boolean(),
  }),
  pricingInventory: z.object({
    price: z.string().trim(),
    salePrice: optionalNumberString,
    discount: optionalNumberString,
    material: z.string().trim(),
    stock: z.string().trim(),
    stockStatus: z.enum(["In Stock", "Out of Stock"]),
  }),
  shipping: z.object({
    weight: optionalNumberString,
    length: optionalNumberString,
    width: optionalNumberString,
    height: optionalNumberString,
    freeShipping: z.boolean(),
  }),
  seo: z.object({
    metaTitle: z.string().trim().max(60, "Meta title must be at most 60 characters"),
    metaDescription: z
      .string()
      .trim()
      .max(160, "Meta description must be at most 160 characters"),
  }),
  productColor: z.object({
    selectedColors: z.array(z.string().trim().min(1)).max(30),
  }),
  sizes: z.object({
    sizes: z.array(z.string().trim().min(1)).max(50),
  }),
  storyHeader: z.object({
    storyTitle: z.string().trim(),
    storyContent: z.string().trim(),
    quoteText: z.string().trim(),
    quoteAuthor: z.string().trim(),
  }),
  linkedProduct: z.object({
    linkedProduct: z.string().trim(),
  }),
  storySettings: z.object({
    displayStory: z.boolean(),
    showArtisanBadge: z.boolean(),
    showTimeline: z.boolean(),
    showQuote: z.boolean(),
  }),
  tagsKeywords: z.object({
    storyTags: z.array(z.string().trim().min(1)).max(30),
    featuredStory: z.boolean(),
  }),
  artisanInformation: z.object({
    artisanSteps: z
      .array(
        z.object({
          title: z.string().trim(),
          description: z.string().trim(),
        }),
      )
      .min(1),
  }),
  productImage: z.object({
    imageFiles: z.array(z.instanceof(File)),
    storyImageFile: z.instanceof(File).nullable(),
  }),
  tags: z.array(z.string().trim().min(1)).max(50),
});

const draftSchema = baseSchema;

const publishSchema = baseSchema
  .extend({
    basicInformation: baseSchema.shape.basicInformation.extend({
      name: z.string().trim().min(1, "Product name is required"),
      description: z.string().trim().min(1, "Description is required"),
      category: z.string().trim().min(1, "Category is required"),
    }),
    pricingInventory: baseSchema.shape.pricingInventory.extend({
      price: nonNegativeNumberString,
      material: z.string().trim().min(1, "Material is required"),
      stock: nonNegativeNumberString,
    }),
    storyHeader: baseSchema.shape.storyHeader.extend({
      storyTitle: z.string().trim().min(1, "Story title is required"),
      storyContent: z.string().trim().min(1, "Story content is required"),
    }),
    productImage: baseSchema.shape.productImage.extend({
      imageFiles: z.array(z.instanceof(File)).min(1, "At least one product image is required"),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.pricingInventory.salePrice && data.pricingInventory.price) {
      const sale = Number(data.pricingInventory.salePrice);
      const price = Number(data.pricingInventory.price);
      if (!Number.isNaN(sale) && !Number.isNaN(price) && sale > price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricingInventory", "salePrice"],
          message: "Sale price cannot be greater than price",
        });
      }
    }

    if (data.pricingInventory.discount) {
      const discount = Number(data.pricingInventory.discount);
      if (!Number.isNaN(discount) && (discount < 0 || discount > 100)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricingInventory", "discount"],
          message: "Discount must be between 0 and 100",
        });
      }
    }
  });

function toIssues(issues: z.ZodIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateAddProductDraft(
  input: AddProductCanonicalState,
): ValidationResult<AddProductCanonicalState> {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isValid: false,
      data: null,
      issues: toIssues(parsed.error.issues),
    };
  }

  return {
    isValid: true,
    data: parsed.data,
    issues: [],
  };
}

export function validateAddProductPublish(
  input: AddProductCanonicalState,
): ValidationResult<AddProductCanonicalState> {
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isValid: false,
      data: null,
      issues: toIssues(parsed.error.issues),
    };
  }

  return {
    isValid: true,
    data: parsed.data,
    issues: [],
  };
}
