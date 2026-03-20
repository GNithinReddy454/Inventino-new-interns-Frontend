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
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import Pagination from "./Pagination";
import { productService } from "@/services/product.service";
import { getCategories } from "@/services/admin.service";
import { useAppSelector } from "@/redux/store";
import EditProductModal, { EditableProduct } from "./EditProductModal";
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

type EditImage = { id: string; url: string };

function deriveStatus(p: any): string {
  if (!p.isActive) return "Inactive";
  if (p.stock === 0) return "Out of Stock";
  if (p.stock > 0 && p.stock < 5) return "Low Stock";
  return "Active";
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

function getImageUrl(img: any): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object" && typeof img.url === "string") return img.url;
  return "";
}

function normalizeEditImages(images: any[]): EditImage[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((img, index) => {
      if (typeof img === "string" && img.trim()) {
        return {
          id: `img-${index}`,
          url: img,
        };
      }

      if (img && typeof img === "object" && typeof img.url === "string") {
        return {
          id: img.id || img._id || `img-${index}`,
          url: img.url,
        };
      }

      return null;
    })
    .filter((img): img is EditImage => Boolean(img?.url));
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
  const [editProduct, setEditProduct] = useState<EditableProduct | null>(null);
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [serverTotalItems, setServerTotalItems] = useState(0);

  const localAddedProducts = useAppSelector(
    (state) => state.admin.localAddedProducts
  );

  const resolveThumbnail = (p: any) =>
    p.mainImage ||
    p.imageUrl ||
    p.image ||
    getImageUrl(p.galleryImages?.[0]) ||
    getImageUrl(p.images?.[0]) ||
    "";

  const normalizeProduct = useCallback((p: any): NormalizedAdminProduct => {
    const name = p.productName || p.name || "";

    const prod: NormalizedAdminProduct = {
      _id: p._id || p.id || "",
      productId: p.productId || p.id || "",
      name,
      description: p.description || "",
      price: Number(p.price) || 0,
      originalPrice:
        p.originalPrice !== undefined && p.originalPrice !== null
          ? p.originalPrice
          : p.discountPrice !== undefined && p.discountPrice !== null
          ? p.discountPrice
          : null,
      category: p.category || "",
      stock: Number(p.stock) || 0,
      material: p.material || "",
      isActive: p.isActive !== false,
      trendy: p.trendy ?? false,
      bestSeller: p.bestSeller ?? false,
      hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
      story: p.story || "",
      status: "",
      sku: p.sku || p.productId || "",
      imageUrl: resolveThumbnail(p),
      images: Array.isArray(p.galleryImages)
        ? p.galleryImages
        : Array.isArray(p.images)
        ? p.images
        : [],
      createdAt: p.createdAt || "",
      color: p.color || "",
      size: p.size || "",
    };

    prod.status = deriveStatus(prod);
    return prod;
  }, []);

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
        response = await productService.getAll(params);
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
  }, [currentPage, pageSize, categoryFilter, sort, search, normalizeProduct]);

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

      setCategoryOptions(["All Categories", ...Array.from(new Set(names))]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoryOptions(["All Categories"]);
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

  const mergedProducts = useMemo(() => {
    const isDefaultView =
      currentPage === 1 &&
      !search.trim() &&
      categoryFilter === "All Categories" &&
      statusFilter === "All Status" &&
      sort === "Sort: Newest First";

    if (!isDefaultView) {
      return products;
    }

    const existingIds = new Set(products.map((p) => p._id));

    const normalizedLocal = (localAddedProducts || [])
      .map((p: any) => {
        const localProd: NormalizedAdminProduct = {
          _id: p._id || p.id || "",
          productId: p.productId || p.id || "",
          name: p.productName || p.name || "",
          description: p.description || "",
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice ?? null,
          category: p.category || "",
          stock: Number(p.stock) || 0,
          material: p.material || "",
          isActive: p.status !== "Draft" && p.status !== "Inactive",
          trendy: p.trendy ?? p.isFeatured ?? false,
          bestSeller: p.bestSeller ?? false,
          hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
          story: p.story || "",
          status: "",
          sku: p.sku || p.productId || "",
          imageUrl: resolveThumbnail(p),
          images: Array.isArray(p.galleryImages)
            ? p.galleryImages
            : Array.isArray(p.images)
            ? p.images
            : [],
          createdAt: p.createdAt || "",
          color: p.color || "",
          size: p.size || "",
        };

        localProd.status = deriveStatus(localProd);
        return localProd;
      })
      .filter((p) => p._id && !existingIds.has(p._id));

    return [...normalizedLocal, ...products];
  }, [
    localAddedProducts,
    products,
    currentPage,
    search,
    categoryFilter,
    statusFilter,
    sort,
  ]);

  const statuses = [
    "All Status",
    "Active",
    "Inactive",
    "Low Stock",
    "Out of Stock",
  ];

  const visibleProducts = useMemo(() => {
    let result = [...mergedProducts];

    if (statusFilter !== "All Status") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sort === "Stock: Low to High") {
      result.sort((a, b) => a.stock - b.stock);
    }

    return result;
  }, [mergedProducts, statusFilter, sort]);

  const totalItemsForPagination =
    statusFilter === "All Status" && sort !== "Stock: Low to High"
      ? serverTotalItems
      : visibleProducts.length;

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-gray-100 text-gray-700";
      case "Low Stock":
        return "bg-orange-100 text-orange-700";
      case "Out of Stock":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const categoryColor = (_category: string) => {
    return "bg-pink-50 text-pink-500";
  };

  const handleDelete = async (prod: NormalizedAdminProduct) => {
    const id = prod.productId || prod._id;
    setActionLoading(prod._id);

    try {
      await adminProductService.delete(id);
      await fetchProducts();
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
      await adminProductService.updateStatus(id, { isActive: newActive });
      await fetchProducts();
    } catch (err) {
      console.error("Failed to toggle product status:", err);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleEdit = (prod: NormalizedAdminProduct) => {
    setEditProduct({
      _id: prod._id,
      productId: prod.productId,
      productName: prod.name,
      description: prod.description,
      price: prod.price,
      originalPrice: prod.originalPrice,
      category: prod.category,
      stock: prod.stock,
      material: prod.material,
      color: prod.color || "",
      size: prod.size || "",
      isActive: prod.isActive,
      trendy: prod.trendy,
      bestSeller: prod.bestSeller,
      hashtags: prod.hashtags || [],
      story: prod.story || "",
      images: normalizeEditImages(prod.images || []),
    });
    setOpenMenu(null);
  };

  const handleProductSaved = async () => {
    setEditProduct(null);
    await fetchProducts();
  };

  const editCategories = categoryOptions.filter(
    (c) => c !== "All Categories"
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete product inventory and management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border text-sm font-bold rounded-xl hover:bg-muted transition-all shadow-sm shrink-0"
            title="Refresh products"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={onAddProduct}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0"
          >
            <Package size={18} />
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
              label: "Total Products",
              value: serverTotalItems,
              color: "text-foreground",
            },
            {
              label: "Active Products",
              value: visibleProducts.filter((p) => p.isActive).length,
              color: "text-primary",
            },
            {
              label: "Low Stock Items",
              value: visibleProducts.filter((p) => p.stock > 0 && p.stock < 5)
                .length,
              color: "text-orange-500",
            },
            {
              label: "Out of Stock",
              value: visibleProducts.filter((p) => p.stock === 0).length,
              color: "text-red-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center min-h-22"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {stat.label}
              </span>
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <input
              type="text"
              placeholder="Search products by name, ID, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none min-w-40 pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              {categoryOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none min-w-35 pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none min-w-45 pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground font-bold text-[11px] uppercase tracking-wider hidden md:table-header-group">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <Package size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">
                        No products found matching criteria
                      </p>
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map((prod) => (
                    <tr
                      key={prod._id}
                      className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-0 py-2 md:px-6 md:py-4">
                        <button
                          onClick={() =>
                            setPreviewProductId(prod.productId || prod._id)
                          }
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-md shrink-0 hidden md:flex overflow-hidden bg-muted items-center justify-center">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package
                                  size={18}
                                  className="text-muted-foreground/50"
                                />
                              )}
                            </div>

                            <div className="flex justify-between md:block w-full md:w-auto items-center">
                              <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                Product
                              </span>
                              <div className="text-right md:text-left">
                                <p className="font-bold text-foreground text-sm line-clamp-1 hover:text-primary transition-colors">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  SKU: {prod.sku || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground font-medium text-[13px] flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                          Product ID
                        </span>
                        {prod.productId || "-"}
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-[#E85D8E] flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                          Price
                        </span>
                        ₹{prod.price.toLocaleString()}
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                          Stock
                        </span>
                        <div className="text-right md:text-left">
                          <span
                            className={`font-bold ${
                              prod.stock < 10
                                ? "text-orange-500"
                                : "text-foreground"
                            }`}
                          >
                            {prod.stock}
                          </span>
                          <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">
                            units
                          </p>
                        </div>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                          Category
                        </span>
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${categoryColor(
                            prod.category
                          )}`}
                        >
                          {prod.category}
                        </span>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                          Status
                        </span>
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${statusColor(
                            prod.status
                          )}`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                        {actionLoading === prod._id ? (
                          <div className="flex items-center justify-center p-2">
                            <RefreshCw
                              size={16}
                              className="animate-spin text-muted-foreground"
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
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenu === prod._id && (
                              <div className="absolute right-0 md:right-6 top-12 md:top-10 z-20 bg-background border border-border shadow-xl rounded-xl w-48 text-sm py-2">
                                <button
                                  onClick={() =>
                                    setPreviewProductId(
                                      prod.productId || prod._id
                                    )
                                  }
                                  className="flex items-center gap-2 w-full px-4 py-2 text-foreground hover:bg-muted transition-colors text-left"
                                >
                                  <Eye size={14} /> Preview
                                </button>

                                <button
                                  onClick={() => handleEdit(prod)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-foreground hover:bg-muted transition-colors text-left"
                                >
                                  <Edit size={14} /> Edit
                                </button>

                                <button
                                  onClick={() => handleToggleStatus(prod)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-foreground hover:bg-muted transition-colors text-left"
                                >
                                  {prod.isActive ? (
                                    <ToggleRight size={14} />
                                  ) : (
                                    <ToggleLeft size={14} />
                                  )}
                                  {prod.isActive ? "Deactivate" : "Activate"}
                                </button>

                                {deleteConfirm === prod._id ? (
                                  <div className="px-4 py-2 border-t border-border/50 mt-1">
                                    <p className="text-xs text-red-500 font-medium mb-2">
                                      Confirm delete?
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDelete(prod)}
                                        className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDeleteConfirm(null);
                                          setOpenMenu(null);
                                        }}
                                        className="flex-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(prod._id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 transition-colors text-left mt-1 border-t border-border/50"
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

      {editProduct && (
        <EditProductModal
          product={editProduct}
          categories={editCategories}
          onClose={() => setEditProduct(null)}
          onSaved={handleProductSaved}
        />
      )}

      {previewProductId && (
        <ProductPreviewModal
          productId={previewProductId}
          onClose={() => setPreviewProductId(null)}
          onEdit={(product: any) => {
            setPreviewProductId(null);
            setEditProduct({
              _id: product?._id || "",
              productId: product?.productId || "",
              productName: product?.productName || product?.name || "",
              description: product?.description || "",
              price: Number(product?.price) || 0,
              originalPrice:
                product?.originalPrice ?? product?.discountPrice ?? null,
              category: product?.category || "",
              stock: Number(product?.stock) || 0,
              material: product?.material || "",
              color: product?.color || "",
              size: product?.size || "",
              isActive: product?.isActive !== false,
              trendy: product?.trendy ?? false,
              bestSeller: product?.bestSeller ?? false,
              hashtags: Array.isArray(product?.hashtags)
                ? product.hashtags
                : [],
              story: product?.story || "",
              images: normalizeEditImages(
                product?.galleryImages || product?.images || []
              ),
            });
          }}
        />
      )}
    </div>
  );
}