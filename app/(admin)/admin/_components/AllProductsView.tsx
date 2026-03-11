import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, Package, Edit, Trash2 } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import Pagination from "./Pagination";
import { getAdminProducts, AdminProduct } from "@/services/admin.service";
import { useAppSelector } from "@/redux/store";

export default function AllProductsView({ onAddProduct }: { onAddProduct: () => void }) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [sort, setSort] = useState("Newest");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [ADMIN_PRODUCTS, setAdminProducts] = useState<AdminProduct[]>([]);
    const localAddedProducts = useAppSelector((state) => state.admin.localAddedProducts);

    const resolveThumbnail = (p: any) =>
        p.imageUrl || p.image || p.images?.[0]?.url || p.images?.[0] || "";

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminProducts();
                setAdminProducts(data ?? []);
            } catch (err) {
                console.error("Failed to fetch admin products:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const mergedProducts = (() => {
        const existingIds = new Set(ADMIN_PRODUCTS.map((p: any) => p._id));
        const normalizedLocal = (localAddedProducts || [])
            .map((p: any) => ({
                _id: p._id || p.id,
                productId: p.productId || p.id,
                name: p.name || "",
                price: Number(p.price) || 0,
                category: p.category || "",
                stock: Number(p.stock) || 0,
                totalSales: Number(p.totalSales) || 0,
                totalRevenue: Number(p.totalRevenue) || 0,
                status: p.status || "Active",
                sku: p.sku || "",
                imageUrl: resolveThumbnail(p),
            }))
            .filter((p: any) => p._id && !existingIds.has(p._id));

        const normalizedApi = (ADMIN_PRODUCTS || []).map((p: any) => ({
            ...p,
            imageUrl: resolveThumbnail(p),
        }));

        return [...normalizedLocal, ...normalizedApi];
    })();

    const categories = ["All Categories", "Jewelry", "Bags", "Home Decor", "Textiles", "Accessories"];
    const statuses = ["All Status", "Active", "Draft", "Low Stock", "Out of Stock"];

    const filtered = mergedProducts.filter((p: any) => {
        const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === "All Categories" || p.category === categoryFilter;
        return matchSearch && matchCat;
    }).sort((a: any, b: any) => {
        if (sort === "Price: High to Low") return b.price - a.price;
        if (sort === "Price: Low to High") return a.price - b.price;
        if (sort === "Stock: Low to High") return a.stock - b.stock;
        return 0;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const statusColor = (status: string) => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-700";
            case "Draft": return "bg-gray-100 text-gray-700";
            case "Low Stock": return "bg-orange-100 text-orange-700";
            case "Out of Stock": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Products Inventory</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your store&apos;s product catalog</p>
                </div>
                <button
                    onClick={onAddProduct}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0"
                >
                    <Package size={18} />
                    Add New Product
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    [
                        { label: "Total Products", value: mergedProducts.length, color: "text-foreground" },
                        { label: "Low Stock", value: mergedProducts.filter((p: any) => p.stock < 5).length, color: "text-orange-500" },
                        { label: "Out of Stock", value: mergedProducts.filter((p: any) => p.stock === 0).length, color: "text-red-500" },
                        { label: "Total Revenue", value: `₹${mergedProducts.reduce((s, p: any) => s + (p.totalRevenue || 0), 0).toLocaleString()}`, color: "text-primary" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</span>
                            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                        >
                            {categories.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                        >
                            {statuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                        >
                            {["Newest", "Price: High to Low", "Price: Low to High", "Stock: Low to High"].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table grid view */}
            {isLoading ? (
                <SkeletonTable rows={10} cols={6} />
            ) : (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                                            <Package size={36} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No products found matching criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((prod: any) => (
                                        <tr key={prod._id} className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/30 transition-colors group">
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg flex-shrink-0 hidden md:flex overflow-hidden bg-[#f3f4f6] items-center justify-center">
                                                        {prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0] ? (
                                                            <img
                                                                src={prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0]}
                                                                alt={prod.name || "Product"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package size={20} className="text-muted-foreground/50" />
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between md:block w-full md:w-auto items-center">
                                                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Product</span>
                                                        <div className="text-right md:text-left">
                                                            <p className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{prod.name}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{prod.sku}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground font-medium text-[13px] flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Category</span>
                                                {prod.category}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Price</span>
                                                ₹{prod.price.toLocaleString()}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Stock</span>
                                                <span className={`font-bold ${prod.stock < 10 ? 'text-orange-500' : 'text-foreground'}`}>
                                                    {prod.stock}
                                                </span>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Status</span>
                                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${statusColor(prod.status)}`}>
                                                    {prod.status}
                                                </span>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                                                <button
                                                    onClick={() => setOpenMenu(openMenu === prod._id ? null : prod._id)}
                                                    className="md:p-1.5 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted bg-muted md:bg-transparent rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                                                >
                                                    <span className="md:hidden">Actions</span>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenu === prod._id && (
                                                    <div className="absolute right-0 md:right-6 top-12 md:top-8 z-20 bg-background border border-border shadow-xl rounded-xl w-48 text-sm py-2">
                                                        <button
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-foreground hover:bg-muted transition-colors text-left"
                                                        >
                                                            <Edit size={14} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAdminProducts(prev => prev.filter(p => p._id !== prod._id));
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 transition-colors text-left mt-1 border-t border-border/50"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
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
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }}
                        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                    />
                </div>
            )}
        </div>
    );
}
