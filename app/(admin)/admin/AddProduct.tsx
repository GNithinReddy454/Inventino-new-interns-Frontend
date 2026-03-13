"use client";

import { useState, useRef } from "react";
import { ChevronDown, X, Eye, Upload, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { addProduct } from "@/redux/adminSlice";
import { productService } from "@/services/product.service";

export default function AddProduct() {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyImageInputRef = useRef<HTMLInputElement>(null);

  // File states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(
    null,
  );

  // Tags
  const [tags, setTags] = useState(["Handmade", "Rose Gold", "Bracelet"]);
  const [newTag, setNewTag] = useState("");

  // Multi-color selection
  const colorOptions = [
    { id: "rose", label: "Rose", bg: "bg-[#E3A69C]" },
    { id: "silver", label: "Silver", bg: "bg-[#C0C0C0]" },
    { id: "gold", label: "Gold", bg: "bg-[#FFD700]" },
    { id: "black", label: "Black", bg: "bg-[#000000]" },
    { id: "white", label: "White", bg: "bg-white border border-gray-200" },
    { id: "pink", label: "Pink", bg: "bg-primary" },
  ];
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Custom sizes
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  // Custom color input
  const [customColorHex, setCustomColorHex] = useState("");

  // Story fields (including Artisan Quote & Artisan Info steps)
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [artisanSteps, setArtisanSteps] = useState([{ title: "", description: "" }]);

  // Other toggles & Settings
  const [isFeatured, setIsFeatured] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);
  const [freeShipping, setFreeShipping] = useState(true);
  const [storySettings, setStorySettings] = useState({
    displayStory: true,
    showArtisanBadge: true,
    showTimeline: true,
    showQuote: true,
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Color toggle
  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : [...prev, colorId],
    );
  };

  // Sizes handlers
  const handleAddSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSize.trim() !== "") {
      e.preventDefault();
      if (!sizes.includes(newSize.trim())) {
        setSizes([...sizes, newSize.trim()]);
      }
      setNewSize("");
    }
  };
  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((s) => s !== sizeToRemove));
  };

  // Custom color handler
  const addCustomColor = () => {
    const hex = customColorHex.trim();
    if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex) && !selectedColors.includes(hex)) {
      setSelectedColors((prev) => [...prev, hex]);
      setCustomColorHex("");
    }
  };

  // Artisan Steps handlers
  const handleAddStep = () => {
    setArtisanSteps([...artisanSteps, { title: "", description: "" }]);
  };
  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...artisanSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setArtisanSteps(newSteps);
  };

  // File handlers
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 5); // Max 5 images per backend limit
      });
    }
    // Reset input so same file can be re-selected
    if (e.target) e.target.value = "";
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleStoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryImage(file);
      setStoryImagePreview(URL.createObjectURL(file));
    }
  };

  // Toast
  const triggerToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");

    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value.trim();
    const price = (form.elements.namedItem("price") as HTMLInputElement)?.value.trim();
    const category = (form.elements.namedItem("category") as HTMLSelectElement)?.value.trim();
    const subCategory = (form.elements.namedItem("subCategory") as HTMLSelectElement)?.value.trim();
    const material = (form.elements.namedItem("material") as HTMLInputElement)?.value.trim();
    const stock = (form.elements.namedItem("stock") as HTMLInputElement)?.value.trim();
    const discount = (form.elements.namedItem("discount") as HTMLInputElement)?.value.trim();

    if (!name || !description || !price || !category || !material || !stock) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    const createPayload = new FormData();
    createPayload.append("name", name);
    createPayload.append("description", description);
    createPayload.append("price", String(Number(price)));
    createPayload.append("category", category);
    if (subCategory) createPayload.append("subCategory", subCategory);
    createPayload.append("material", material);
    createPayload.append("stock", String(Number(stock)));
    if (discount) createPayload.append("discountPrice", String(Number(discount)));
    tags.forEach((tag) => createPayload.append("hashtags", tag));
    if (selectedColors.length > 0) createPayload.append("color", selectedColors.join(","));
    if (sizes.length > 0) createPayload.append("size", sizes.join(","));
    createPayload.append("trendy", String(isFeatured));
    createPayload.append("bestSeller", String(reviewsEnabled));
    if (storyContent) createPayload.append("story", storyContent);
    if (storyImage) createPayload.append("storyMedia", storyImage);
    selectedFiles.forEach((file) => createPayload.append("images", file));

    try {
      setIsLoading(true);

      let created;
      let imageUploadFailed = false;

      try {
        created = await productService.create(createPayload);
      } catch (uploadErr: any) {
        // If S3/image upload fails, retry without images
        const errMsg = uploadErr?.response?.data?.message || uploadErr?.message || "";
        if (selectedFiles.length > 0 && (errMsg.toLowerCase().includes("s3") || errMsg.toLowerCase().includes("upload"))) {
          imageUploadFailed = true;
          const retryPayload = new FormData();
          createPayload.forEach((value, key) => {
            if (key !== "images") {
              retryPayload.append(key, value);
            }
          });
          created = await productService.create(retryPayload);
        } else {
          throw uploadErr;
        }
      }

      const createdData = created?.data ?? created;
      const newProduct = {
        _id:
          createdData?._id ||
          createdData?.id ||
          `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        id:
          createdData?.productId ||
          `#PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
        name: createdData?.name || name,
        price: Number(createdData?.price ?? price) || 0,
        stock: Number(createdData?.stock ?? stock) || 0,
        category: createdData?.category || category,
        subCategory: createdData?.subCategory || subCategory,
        material: createdData?.material || material,
        discount: createdData?.discount ?? discount,
        sku:
          createdData?.sku ||
          createdData?.productId ||
          `SKU-${Date.now().toString().slice(-6)}`,
        tags: createdData?.hashtags || tags,
        colors: createdData?.colors || selectedColors,
        isFeatured,
        reviewsEnabled,
        freeShipping,
        status: createdData?.isActive === false ? "Draft" : "Active",
        totalSales: Number(createdData?.totalSales) || 0,
        totalRevenue: Number(createdData?.totalRevenue) || 0,
        imageUrl:
          createdData?.images?.[0]?.url ||
          (selectedFiles.length > 0
            ? URL.createObjectURL(selectedFiles[0])
            : null),
      };

      const createdProductId =
        createdData?.productId || createdData?._id || createdData?.id;

      // If initial create succeeded but had no images (or we retried without), try adding images separately
      if (createdProductId && !createdData?.images?.length && selectedFiles.length > 0 && !imageUploadFailed) {
        try {
          const imageFormData = new FormData();
          selectedFiles.forEach((file) => imageFormData.append("images", file));
          await productService.addImages(createdProductId, imageFormData);
        } catch {
          imageUploadFailed = true;
        }
      }

      dispatch(addProduct(newProduct));

      if (imageUploadFailed) {
        triggerToast("Product created, but images could not be uploaded (S3 not configured)", "success");
      } else {
        triggerToast("Product added successfully", "success");
      }

      setTimeout(() => {
        router.push("/admin");
      }, 700);

    } catch (err: unknown) {
      const apiMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (err as any).response?.data?.message
          : undefined;
      const msg =
        apiMessage ||
        (err instanceof Error ? err.message : String(err)) ||
        "An error occurred";
      setError(msg);
      triggerToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Preview modal
  const PreviewModal = () => {
    if (!showPreview) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 z-10">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold mb-6">Product Preview</h2>

          {/* Images */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Images</h3>
            <div className="flex gap-2 overflow-x-auto">
              {selectedFiles.length > 0 ? (
                selectedFiles.map((file, idx) => (
                  <div key={idx} className="w-24 h-24 relative shrink-0 rounded-lg overflow-hidden border">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No images uploaded</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">Name</label>
              <p className="font-medium">{(document.querySelector('input[name="name"]') as HTMLInputElement)?.value || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Description</label>
              <p className="text-sm">{(document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Price</label>
                <p className="font-medium">${(document.querySelector('input[name="price"]') as HTMLInputElement)?.value || "0.00"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Discount</label>
                <p className="font-medium">{(document.querySelector('input[name="discount"]') as HTMLInputElement)?.value || "0"}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Category</label>
                <p>{(document.querySelector('select[name="category"]') as HTMLSelectElement)?.value || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Subcategory</label>
                <p>{(document.querySelector('select[name="subCategory"]') as HTMLSelectElement)?.value || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Material</label>
                <p>{(document.querySelector('input[name="material"]') as HTMLInputElement)?.value || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Stock</label>
                <p>{(document.querySelector('input[name="stock"]') as HTMLInputElement)?.value || "0"}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Colors</label>
              <div className="flex gap-1 mt-1">
                {selectedColors.map((c) => {
                  const preset = colorOptions.find((co) => co.id === c);
                  return preset ? (
                    <div
                      key={c}
                      className={`w-6 h-6 rounded-full ${preset.bg} border border-gray-300`}
                      title={preset.label}
                    />
                  ) : (
                    <div
                      key={c}
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Sizes</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {sizes.length > 0 ? sizes.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">{s}</span>
                )) : (
                  <p className="text-sm text-gray-500">No sizes added</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Story</label>
              <div className="border rounded-lg p-4 mt-2">
                {storyImagePreview && (
                  <div className="relative w-full h-40 mb-3">
                    <Image
                      src={storyImagePreview}
                      alt="Story"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="font-semibold">{storyTitle || "—"}</p>
                <p className="text-sm text-gray-600 mt-1">{storyContent || "—"}</p>
                {(quoteText || quoteAuthor) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg italic border-l-4 border-primary">
                    <p className="text-sm text-gray-700">&quot;{quoteText || "—"}&quot;</p>
                    <p className="text-xs text-gray-500 mt-1">— {quoteAuthor || "—"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="max-w-6xl mx-auto font-sans pb-20"
      >
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>
        )}

        {/* Toast */}
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-8 z-100 transition-all duration-300 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
        >
          <div className="bg-white rounded-2xl py-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-gray-100 min-w-50 max-w-[88vw]">
            <div
              className={`${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                } w-7 h-7 rounded-full flex items-center justify-center shrink-0`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
              ) : (
                <X size={14} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-xs text-gray-400 truncate">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-gray-300 hover:text-gray-500 shrink-0 ml-1"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Basic Information + Right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Left column – consistent vertical spacing */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Basic Information
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Fill in the basic details of your product
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Delicate Rose Bracelet"
                    className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    required
                    placeholder="Write a detailed description of your product..."
                    className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Minimum 50 characters recommended
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        required
                        className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all"
                      >
                        <option value="">Select Category</option>
                        <option value="Jewelry">Jewelry</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                  </div>
                  {/* Sub-category added back */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Subcategory
                    </label>
                    <div className="relative">
                      <select
                        name="subCategory"
                        className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all"
                      >
                        <option value="">Select Subcategory</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Rings">Rings</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FDF2F5] border border-pink-200 rounded-xl min-h-13 transition-all focus-within:border-[#E91E63] focus-within:ring-1 focus-within:ring-[#E91E63]">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:opacity-80 ml-1"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add a tag..."
                      className="flex-1 bg-transparent text-sm min-w-20 focus:outline-none px-1 text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Press Enter to add tags
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar – consistent vertical spacing */}
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Publish Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all">
                      <option>Published</option>
                      <option>Draft</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Visibility
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all">
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
                <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFeatured ? "bg-primary" : "bg-gray-200"}`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${isFeatured ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                    <label
                      className="text-sm font-medium text-foreground cursor-pointer"
                      onClick={() => setIsFeatured(!isFeatured)}
                    >
                      Featured Product
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setReviewsEnabled(!reviewsEnabled)}
                      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${reviewsEnabled ? "bg-primary" : "bg-gray-200"}`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${reviewsEnabled ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                    <label
                      className="text-sm font-medium text-foreground cursor-pointer"
                      onClick={() => setReviewsEnabled(!reviewsEnabled)}
                    >
                      Enable Reviews
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Organization section removed */}
          </div>
        </div>

        {/* Pricing & Inventory + Right column (Shipping & SEO) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Left column – continues space-y-4 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Pricing & Inventory
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Set your product pricing and stock details
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Price <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <input
                        name="price"
                        type="text"
                        required
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <input
                        name="salePrice"
                        type="text"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount field (replaces SKU) */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="e.g., 15"
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Leave empty for no discount
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Material <span className="text-destructive">*</span>
                    </label>
                    <input
                      name="material"
                      type="text"
                      required
                      placeholder="e.g. beads"
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Stock <span className="text-destructive">*</span>
                    </label>
                    <input
                      name="stock"
                      type="text"
                      required
                      placeholder="0"
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Stock Status <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="stockStatus"
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    >
                      <option>In Stock</option>
                      <option>Out of Stock</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Colors (multi-select) */}
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Product Colors
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Select all available colors (click to toggle)
              </p>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={`relative w-12 h-12 rounded-lg border-2 transition-all ${selectedColors.includes(color.id)
                      ? "border-primary-dark scale-110"
                      : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <div
                      className={`w-full h-full rounded-md ${color.bg} ${color.id === "white" ? "border border-gray-200" : ""
                        }`}
                    />
                    {selectedColors.includes(color.id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[10px]">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {/* Custom color input */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="color"
                  value={customColorHex || "#000000"}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-pink-200 cursor-pointer p-0.5"
                  title="Pick a custom color"
                />
                <input
                  type="text"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  placeholder="#FF5733"
                  className="w-28 px-3 py-2 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="px-4 py-2 bg-[#E91E63] text-white text-xs font-bold rounded-xl hover:bg-[#C83B61] transition-all disabled:opacity-50"
                  disabled={!customColorHex || !/^#[0-9A-Fa-f]{6}$/.test(customColorHex.trim())}
                >
                  Add Color
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Selected colors: {selectedColors.length} — Pick a preset or add a custom hex color
              </p>
            </div>

            {/* Sizes (optional) */}
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Sizes (Optional)
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Add custom size options — press Enter to add
              </p>
              <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FDF2F5] border border-pink-200 rounded-xl min-h-13 transition-all focus-within:border-[#E91E63] focus-within:ring-1 focus-within:ring-[#E91E63]">
                {sizes.map((size, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="hover:opacity-80 ml-1"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={handleAddSize}
                  placeholder="Add a size..."
                  className="flex-1 bg-transparent text-sm min-w-20 focus:outline-none px-1 text-foreground placeholder-muted-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Press Enter to add sizes • {sizes.length} size{sizes.length !== 1 ? "s" : ""} added
              </p>
            </div>
          </div>

          {/* Right column – Shipping & SEO (same vertical spacing) */}
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Shipping
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Weight (kg)
                  </label>
                  <input
                    name="weight"
                    type="text"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Length (cm)
                    </label>
                    <input
                      name="length"
                      type="text"
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Width (cm)
                    </label>
                    <input
                      name="width"
                      type="text"
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Height (cm)
                  </label>
                  <input
                    name="height"
                    type="text"
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div
                    onClick={() => setFreeShipping(!freeShipping)}
                    className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${freeShipping ? "bg-primary" : "bg-gray-200"}`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${freeShipping ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </div>
                  <label
                    className="text-sm font-medium text-foreground cursor-pointer"
                    onClick={() => setFreeShipping(!freeShipping)}
                  >
                    Free Shipping
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Meta Title
                  </label>
                  <input
                    name="metaTitle"
                    type="text"
                    placeholder="Product meta title"
                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    0/60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    rows={3}
                    placeholder="Product meta description"
                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm resize-none focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    0/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4 mt-6">
          {/* Left Column: Story Header, Quote, Artisan Info, Images */}
          <div className="lg:col-span-2 space-y-4">

            {/* Story Header & Quote Card */}
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Story Header
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Main title for the story section
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Story Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="storyTitle"
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="The Story Behind This Treasure"
                    className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">
                    Story Content <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    name="storyContent"
                    rows={5}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="This beautiful rose gold bracelet is the result of..."
                    className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Minimum 50 characters recommended
                  </p>
                </div>
              </div>

              {/* Artisan Quote Fields */}
              <div className="border-t border-border mt-8 pt-6">
                <p className="text-xs text-muted-foreground mb-4">
                  Featured quote from the artisan (optional but recommended)
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Quote Text
                    </label>
                    <textarea
                      name="quoteText"
                      rows={3}
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      placeholder="Every piece I create is infused with love..."
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Minimum 50 characters recommended
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Quote Author
                    </label>
                    <input
                      name="quoteAuthor"
                      type="text"
                      value={quoteAuthor}
                      onChange={(e) => setQuoteAuthor(e.target.value)}
                      placeholder="Sarah Anderson, Master Artisan"
                      className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Artisan Information Card */}
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Artisan Information
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Details about the maker of this product
              </p>

              <div className="space-y-4">
                {artisanSteps.map((step, idx) => (
                  <div key={idx} className="bg-muted border border-border rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#E91E63] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute top-2 right-4 text-xs font-bold text-foreground">
                      Step {idx + 1}
                    </div>
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          Step Title
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(idx, "title", e.target.value)}
                          placeholder="Design & Concept"
                          className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          Step Description
                        </label>
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => updateStep(idx, "description", e.target.value)}
                          placeholder="Each design begins with..."
                          className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="w-full py-3 mt-2 border-2 border-dashed border-pink-300 text-[#E91E63] rounded-xl text-xs font-bold bg-[#FDF2F5] hover:bg-pink-100 transition-all"
                >
                  + Add Another Step
                </button>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-1">
                Product Images
              </h3>
              <p className="text-xs text-muted-foreground mb-8">
                Upload high-quality images of your product
              </p>
              <div className="w-full border-2 border-dashed border-border rounded-2xl py-12 flex flex-col items-center justify-center bg-muted">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-pink-300">
                  <Upload className="text-[#E91E63]" size={24} />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">
                  Drag & drop images here
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#E91E63] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#C83B61] transition-all"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </div>
              {selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-6 mb-2">
                  {selectedFiles.length}/5 images selected
                </p>
              )}
              <div className="flex gap-4 mt-2 overflow-x-auto">
                {selectedFiles.length > 0 && (
                  selectedFiles.map((file, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 py-3.5 border border-[#E91E63] text-gray-700 rounded-xl text-sm font-bold bg-white hover:bg-pink-50 transition-all"
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#e75a89] to-[#E91E63] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? "Publishing..." : "Publish Product"}
              </button>
            </div>

          </div>

          {/* Right Column: Settings */}
          <div className="space-y-4">

            {/* Link to Product */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Link to Product
              </h3>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-2">
                  Select Product <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all">
                    <option>Delicate Rose Gold Bracelet</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  This story will be displayed on the product page
                </p>
              </div>
            </div>

            {/* Story Settings */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Story Settings
              </h3>
              <div className="space-y-4">
                {(
                  [
                    { key: "displayStory", label: "Display Story on Product Page" },
                    { key: "showArtisanBadge", label: "Show Artisan Badge" },
                    { key: "showTimeline", label: "Show Timeline Section" },
                    { key: "showQuote", label: "Show Quote Section" },
                  ] as { key: keyof typeof storySettings; label: string }[]
                ).map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div
                      onClick={() => setStorySettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${storySettings[item.key] ? "bg-[#E91E63]" : "bg-gray-200"}`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${storySettings[item.key] ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                    <label
                      className="text-xs font-bold text-foreground cursor-pointer"
                      onClick={() => setStorySettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview & Publish */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Preview & Publish
              </h3>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full py-3 mb-2 border border-pink-300 text-[#E91E63] rounded-xl text-xs font-bold bg-[#FDF2F5] hover:bg-pink-100 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={14} /> Preview Story
              </button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                See how your story will look on the product page
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 bg-[#E91E63] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#C83B61] transition-all disabled:opacity-50"
              >
                {isLoading ? "Publishing..." : "Publish Product"}
              </button>
            </div>

            {/* Tags & Keywords */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-sm font-bold text-card-foreground mb-4">
                Tags & Keywords
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-2">
                    Story Tags
                  </label>
                  <input
                    type="text"
                    placeholder="handmade, artisan, jewelry"
                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Separate tags with commas
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-2">
                    Featured Story
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] appearance-none cursor-pointer transition-all">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <PreviewModal />
    </>
  );
}