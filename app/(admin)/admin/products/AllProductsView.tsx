"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  MoreVertical,
  Search,
  Package,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { SkeletonCard, SkeletonTable } from "../_components/Skeleton";
import Pagination from "../_components/Pagination";
import { getCategories } from "@/services/admin.service";
import EditProductView from "../products/EditProductView";
import { adminProductService } from "@/services/admin-product.service";
import ProductPreviewModal from "./ProductPreviewModal";

interface NormalizedAdminProduct {
  _id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  stock: number;
  material?: string;
  isActive: boolean;
  trendy: boolean;
  bestSeller: boolean;
  hashtags?: string[];
  story?: string;
  status: string;
  sku: string;
  imageUrl: string;
  images?: any[];
  createdAt?: string;
  color?: string;
  size?: string;
}

function getImageUrl(img: any): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object" && typeof img.url === "string") return img.url;
  return "";
}

function extractItemsAndMeta(response: any) {
  const root = response?.data?.data ?? response?.data ?? response ?? {};
  const items = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root)
    ? root
    : [];
  const meta = root?.meta ?? {};

  return {
    items,
    total: Number(meta?.total ?? items.length ?? 0),
    page: Number(meta?.page ?? 1),
    limit: Number(meta?.limit ?? 10),
    totalPages: Number(meta?.totalPages ?? 1),
  };
}

function getSortParam(sort: string) {
  switch (sort) {
    case "Sort: Newest First":
      return "newest";
    case "Price: High to Low":
      return "priceDesc";
    case "Price: Low to High":
      return "priceAsc";
    default:
      return "";
  }
}

function getVariantFirstColor(product: any): string {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return product?.color || "";
  }
  return product.variants[0]?.color || "";
}

function getVariantSizesText(product: any): string {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return product?.size || "";
  }

  const sizes = product.variants.flatMap((variant: any) =>
    Array.isArray(variant?.sizes)
      ? variant.sizes.map((sizeItem: any) => sizeItem?.size).filter(Boolean)
      : []
  );

  return Array.from(new Set(sizes)).join(", ");
}

function getVariantStock(product: any): number {
  if (typeof product?.totalStock === "number") return product.totalStock;
  if (typeof product?.stock === "number") return product.stock;

  if (!Array.isArray(product?.variants)) return 0;

  return product.variants.reduce((total: number, variant: any) => {
    const variantStock = Array.isArray(variant?.sizes)
      ? variant.sizes.reduce(
          (sum: number, sizeItem: any) => sum + (Number(sizeItem?.stock) || 0),
          0
        )
      : 0;

    return total + variantStock;
  }, 0);
}

function getPrimaryPrice(product: any): number {
  if (typeof product?.pricing?.price === "number") return product.pricing.price;
  if (typeof product?.price === "number") return product.price;

  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    const firstVariantPrice = Number(product.variants[0]?.price);
    if (Number.isFinite(firstVariantPrice)) return firstVariantPrice;
  }

  return 0;
}

function getOriginalPrice(product: any): number | null {
  if (
    product?.pricing?.originalPrice !== undefined &&
    product?.pricing?.originalPrice !== null
  ) {
    return Number(product.pricing.originalPrice) || 0;
  }

  if (
    product?.originalPrice !== undefined &&
    product?.originalPrice !== null
  ) {
    return Number(product.originalPrice) || 0;
  }

  if (
    product?.discountPrice !== undefined &&
    product?.discountPrice !== null
  ) {
    return Number(product.discountPrice) || 0;
  }

  return null;
}

function getMainImage(product: any): string {
  return (
    product?.media?.mainImage ||
    product?.mainImage ||
    product?.imageUrl ||
    product?.image ||
    getImageUrl(product?.media?.galleryImages?.[0]) ||
    getImageUrl(product?.galleryImages?.[0]) ||
    getImageUrl(product?.images?.[0]) ||
    ""
  );
}

function getAllImages(product: any): any[] {
  if (Array.isArray(product?.media?.galleryImages)) {
    return product.media.galleryImages;
  }

  if (Array.isArray(product?.galleryImages)) {
    return product.galleryImages;
  }

  if (Array.isArray(product?.images)) {
    return product.images;
  }

  return [];
}

function deriveStatusFromProduct(product: {
  isActive: boolean;
  stock: number;
}): string {
  if (!product.isActive) return "Inactive";
  if (product.stock === 0) return "Out of Stock";
  if (product.stock > 0 && product.stock < 5) return "Low Stock";
  return "Active";
}

function normalizeProduct(p: any): NormalizedAdminProduct {
  const price = getPrimaryPrice(p);
  const stock = getVariantStock(p);
  const isActive = p?.isActive !== false;

  const normalized: NormalizedAdminProduct = {
    _id: p?._id || p?.id || "",
    productId: p?.productId || p?.id || "",
    name: p?.productName || p?.name || "",
    description: p?.description || "",
    price,
    originalPrice: getOriginalPrice(p),
    category: p?.category || "",
    stock,
    material: p?.material || "",
    isActive,
    trendy: p?.trendy ?? p?.isFeatured ?? false,
    bestSeller: p?.bestSeller ?? false,
    hashtags: Array.isArray(p?.hashtags)
      ? p.hashtags
      : Array.isArray(p?.tags)
      ? p.tags
      : [],
    story:
      typeof p?.story === "string"
        ? p.story
        : p?.story?.content || p?.storyTitle || "",
    status: "",
    sku: p?.sku || p?.productId || p?._id || "",
    imageUrl: getMainImage(p),
    images: getAllImages(p),
    createdAt: p?.createdAt || "",
    color: getVariantFirstColor(p),
    size: getVariantSizesText(p),
  };

  normalized.status = deriveStatusFromProduct(normalized);
  return normalized;
}

export default function AllProductsView({
  onAddProduct,
}: {
  onAddProduct: () => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState("Sort: Newest First");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [products, setProducts] = useState<NormalizedAdminProduct[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    "All Categories",
  ]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [serverTotalItems, setServerTotalItems] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };

      if (categoryFilter === "All Categories") {
        params.category = "all";
      } else {
        params.category = categoryFilter;
      }

      const backendSort = getSortParam(sort);
      if (backendSort) {
        params.sort = backendSort;
      }

      let response: any;

      if (search.trim()) {
        response = await adminProductService.search(search.trim(), params);
      } else {
        response = await adminProductService.getAll(params);
      }

      const { items, total } = extractItemsAndMeta(response);
      const normalized = items.map(normalizeProduct);

      setProducts(normalized);
      setServerTotalItems(total);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
      setServerTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, categoryFilter, sort, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      const items = response?.items || [];

      const names = Array.isArray(items)
        ? items
            .filter((c: any) => c.isActive)
            .map((c: any) => c.name)
            .filter(Boolean)
        : [];

      const finalNames = names.length > 0 ? Array.from(new Set(names)) : [
        "Bracelets",
        "Necklaces",
        "Rings",
        "Earrings",
        "Pendants",
        "Bags",
        "Home Decor",
        "Textiles"
      ];

      setCategoryOptions(["All Categories", ...finalNames]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoryOptions([
        "All Categories",
        "Bracelets",
        "Necklaces",
        "Rings",
        "Earrings",
        "Pendants",
        "Bags",
        "Home Decor",
        "Textiles"
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sort, pageSize, search]);

  const statuses = [
    "All Status",
    "Active",
    "Inactive",
    "Low Stock",
    "Out of Stock",
  ];

  const visibleProducts = useMemo(() => {
    let result = [...products];

    if (statusFilter !== "All Status") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sort === "Stock: Low to High") {
      result.sort((a, b) => a.stock - b.stock);
    }

    return result;
  }, [products, statusFilter, sort]);

  const totalItemsForPagination =
    statusFilter === "All Status" && sort !== "Stock: Low to High"
      ? serverTotalItems
      : visibleProducts.length;

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#DFF5E7] text-[#159A55]";
      case "Inactive":
        return "bg-[#F2F2F3] text-[#666B74]";
      case "Low Stock":
        return "bg-[#FFF1DE] text-[#F39C12]";
      case "Out of Stock":
        return "bg-[#FDE8E8] text-[#E74C3C]";
      default:
        return "bg-[#F2F2F3] text-[#666B74]";
    }
  };

  const categoryColor = (_category: string) => {
    return "bg-[#F9ECF2] text-[#EB5C8A]";
  };

  const handleDelete = async (prod: NormalizedAdminProduct) => {
    const id = prod.productId || prod._id;
    setActionLoading(prod._id);

    try {
      await adminProductService.delete(id);

      setProducts((prev) => prev.filter((p) => p._id !== prod._id));
      setServerTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = async (prod: NormalizedAdminProduct) => {
    const id = prod.productId || prod._id;
    const newActive = !prod.isActive;
    setActionLoading(prod._id);

    try {
      await adminProductService.updateStatus(id, {
        isActive: newActive,
        status: newActive ? "Active" : "Inactive",
      });

      setProducts((prev) =>
        prev.map((item) => {
          if (item._id !== prod._id) return item;

          const updated = {
            ...item,
            isActive: newActive,
          };

          return {
            ...updated,
            status: deriveStatusFromProduct(updated),
          };
        })
      );
    } catch (err) {
      console.error("Failed to toggle product status:", err);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleEdit = (prod: NormalizedAdminProduct) => {
    setEditProductId(prod.productId || prod._id);
    setOpenMenu(null);
  };

  const handleProductSaved = async () => {
    setEditProductId(null);
    await fetchProducts();
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock < 5
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  if (editProductId) {
    return (
      <EditProductView
        productId={editProductId}
        onBack={() => setEditProductId(null)}
        onSuccess={handleProductSaved}
      />
    );
  }

  return (
    <div className="space-y-6 w-full text-[#1F1728]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] md:text-[22px] font-semibold text-[#1C1630]">
            All Products
          </h2>
          <p className="text-[13px] text-[#817889] mt-1">
            Complete product inventory and management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="flex items-center justify-center gap-2 w-13 h-10.5 bg-white border border-[#E9DDE3] text-[#6D6776] rounded-[14px] hover:bg-[#FAF6F8] transition shadow-sm shrink-0"
            title="Refresh products"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={onAddProduct}
            className="flex items-center justify-center gap-2 px-5 h-10.5 bg-[#EB5C8A] text-white text-[14px] font-semibold rounded-[14px] hover:bg-[#E35182] transition shadow-sm shrink-0"
          >
            <Package size={16} />
            Add New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          [
            {
              label: "TOTAL PRODUCTS",
              value: serverTotalItems,
              color: "text-[#101828]",
            },
            {
              label: "ACTIVE PRODUCTS",
              value: activeCount,
              color: "text-[#EB5C8A]",
            },
            {
              label: "LOW STOCK ITEMS",
              value: lowStockCount,
              color: "text-[#F97316]",
            },
            {
              label: "OUT OF STOCK",
              value: outOfStockCount,
              color: "text-[#EF4444]",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-[18px] border border-[#F0E4E8] shadow-[0_2px_8px_rgba(31,23,40,0.04)] flex flex-col justify-center min-h-24"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7E7786] mb-2">
                {stat.label}
              </span>
              <span className={`text-[22px] font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-[22px] border border-[#F0E4E8] shadow-[0_2px_10px_rgba(31,23,40,0.04)] p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A93A3]"
              size={15}
            />
            <input
              type="text"
              placeholder="Search products by name, ID, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-11 bg-white border border-[#EEE3E8] rounded-[14px] text-[14px] text-[#1F1728] placeholder:text-[#9A93A3] focus:outline-none focus:border-[#EB5C8A] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none min-w-42.5 pl-4 pr-10 h-11 bg-white border border-[#EEE3E8] rounded-[14px] text-[14px] text-[#1F1728] focus:outline-none focus:border-[#EB5C8A] transition-all cursor-pointer"
            >
              {categoryOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93A3] pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none min-w-37.5 pl-4 pr-10 h-11 bg-white border border-[#EEE3E8] rounded-[14px] text-[14px] text-[#1F1728] focus:outline-none focus:border-[#EB5C8A] transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93A3] pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none min-w-47.5 pl-4 pr-10 h-11 bg-white border border-[#EEE3E8] rounded-[14px] text-[14px] text-[#1F1728] focus:outline-none focus:border-[#EB5C8A] transition-all cursor-pointer"
            >
              {[
                "Sort: Newest First",
                "Price: High to Low",
                "Price: Low to High",
                "Stock: Low to High",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A93A3] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : (
        <div className="bg-white border border-[#F0E4E8] rounded-3xl shadow-[0_4px_14px_rgba(31,23,40,0.04)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#FAF8F9] text-[#7E7786] font-semibold text-[11px] uppercase tracking-[0.06em] hidden md:table-header-group">
                <tr>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">Product ID</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Stock</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F3E9ED]">
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-[#8B8492]"
                    >
                      <Package size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No products found matching criteria</p>
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map((prod) => (
                    <tr
                      key={prod._id}
                      className="flex flex-col md:table-row border-b md:border-b-0 border-[#F3E9ED] p-4 md:p-0 hover:bg-[#FFFDFE] transition-colors"
                    >
                      <td className="px-0 py-2 md:px-6 md:py-5">
                        <button
                          onClick={() =>
                            setPreviewProductId(prod.productId || prod._id)
                          }
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[12px] shrink-0 hidden md:flex overflow-hidden bg-[#F4F4F5] items-center justify-center border border-[#F0E8EC]">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package
                                  size={18}
                                  className="text-[#B0A8B3]"
                                />
                              )}
                            </div>

                            <div className="flex justify-between md:block w-full md:w-auto items-center">
                              <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                                Product
                              </span>
                              <div className="text-right md:text-left">
                                <p className="font-semibold text-[#1C1630] text-[14px] line-clamp-1 hover:text-[#EB5C8A] transition-colors">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-[#8B8492] mt-0.5">
                                  SKU: {prod.sku || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 text-[#6F6877] font-medium text-[13px] flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                          Product ID
                        </span>
                        {prod.productId || "-"}
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 font-semibold text-[#EB5C8A] flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                          Price
                        </span>
                        ₹{prod.price.toLocaleString()}
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                          Stock
                        </span>
                        <div className="text-right md:text-left">
                          <span
                            className={`font-semibold ${
                              prod.stock < 10 ? "text-[#F97316]" : "text-[#1C1630]"
                            }`}
                          >
                            {prod.stock}
                          </span>
                          <p className="hidden md:block text-[10px] text-[#8B8492] mt-0.5">
                            units
                          </p>
                        </div>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                          Category
                        </span>
                        <span
                          className={`px-3 py-1 text-[11px] font-semibold rounded-full ${categoryColor(
                            prod.category
                          )}`}
                        >
                          {prod.category}
                        </span>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-[#8B8492] text-xs uppercase font-semibold tracking-wider">
                          Status
                        </span>
                        <span
                          className={`px-3 py-1 text-[11px] font-semibold rounded-full ${statusColor(
                            prod.status
                          )}`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-5 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-[#F3E9ED] pt-3 md:pt-5">
                        {actionLoading === prod._id ? (
                          <div className="flex items-center justify-center p-2">
                            <RefreshCw
                              size={16}
                              className="animate-spin text-[#8B8492]"
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === prod._id ? null : prod._id
                                )
                              }
                              className="p-2 text-[#8B8492] hover:text-[#1C1630] hover:bg-[#F8F3F6] rounded-lg transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenu === prod._id && (
                              <div className="absolute right-0 md:right-6 top-12 md:top-11 z-20 bg-white border border-[#F0E4E8] shadow-[0_12px_30px_rgba(31,23,40,0.1)] rounded-[14px] w-48 text-sm py-2">
                                <button
                                  onClick={() =>
                                    setPreviewProductId(
                                      prod.productId || prod._id
                                    )
                                  }
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-[#1C1630] hover:bg-[#FAF6F8] transition-colors text-left"
                                >
                                  <Eye size={14} /> Preview
                                </button>

                                <button
                                  onClick={() => handleEdit(prod)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-[#1C1630] hover:bg-[#FAF6F8] transition-colors text-left"
                                >
                                  <Edit size={14} /> Edit
                                </button>

                                <button
                                  onClick={() => handleToggleStatus(prod)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-[#1C1630] hover:bg-[#FAF6F8] transition-colors text-left"
                                >
                                  {prod.isActive ? (
                                    <ToggleRight size={14} />
                                  ) : (
                                    <ToggleLeft size={14} />
                                  )}
                                  {prod.isActive ? "Deactivate" : "Activate"}
                                </button>

                                {deleteConfirm === prod._id ? (
                                  <div className="px-4 py-2 border-t border-[#F3E9ED] mt-1">
                                    <p className="text-xs text-[#E74C3C] font-medium mb-2">
                                      Confirm delete?
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDelete(prod)}
                                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#E74C3C] rounded-lg hover:bg-[#D63C2D] transition-colors"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDeleteConfirm(null);
                                          setOpenMenu(null);
                                        }}
                                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-[#666B74] bg-[#F4F4F5] rounded-lg hover:bg-[#ECECEF] transition-colors"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(prod._id)}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[#E74C3C] hover:bg-[#FFF3F2] transition-colors text-left mt-1 border-t border-[#F3E9ED]"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItemsForPagination}
            pageSize={pageSize}
            onPageChange={(p) => {
              setCurrentPage(p);
              setOpenMenu(null);
            }}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {previewProductId && (
        <ProductPreviewModal
          productId={previewProductId}
          onClose={() => setPreviewProductId(null)}
          onEdit={(product: any) => {
            const normalized = normalizeProduct(product);
            setPreviewProductId(null);
            setEditProductId(normalized.productId || normalized._id);
          }}
        />
      )}
    </div>
  );
}