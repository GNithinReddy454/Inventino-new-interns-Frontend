import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import { exportToCSV } from "./exportUtils";
import Pagination from "./Pagination";
import { 
    getAdminOrders, 
    getAdminOrderStats, 
    exportAdminOrders, 
    cancelOrder 
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

// Mock data for development (will be used until backend returns real data)
const MOCK_ORDERS: any[] = [
    {
        _id: "order-1",
        orderNumber: "ORD-001",
        customer: "John Doe",
        email: "john@example.com",
        initials: "JD",
        bg: "bg-purple-500",
        products: [{ name: "Gold Necklace", quantity: 1, price: 1250 }],
        totalAmount: 1250,
        status: "Delivered",
        date: "2026-03-10T10:00:00.000Z",
        trackingNumber: "FDX-8945632",
    },
    {
        _id: "order-2",
        orderNumber: "ORD-002",
        customer: "Sarah Miller",
        email: "sarah@example.com",
        initials: "SM",
        bg: "bg-blue-500",
        products: [{ name: "Silver Earrings", quantity: 2, price: 350 }],
        totalAmount: 700,
        status: "Shipped",
        date: "2026-03-09T14:30:00.000Z",
        trackingNumber: "UPS-7532641",
    },
    {
        _id: "order-3",
        orderNumber: "ORD-003",
        customer: "Emily Brown",
        email: "emily@example.com",
        initials: "EB",
        bg: "bg-green-500",
        products: [{ name: "Diamond Ring", quantity: 1, price: 1500 }, { name: "Pearl Bracelet", quantity: 1, price: 450 }],
        totalAmount: 1950,
        status: "Processing",
        date: "2026-03-08T09:15:00.000Z",
        trackingNumber: "",
    },
];

// Mock stats for development
const MOCK_STATS = {
    total_orders: 1245,
    pending_orders: 23,
    processing_orders: 45,
    shipped_orders: 89,
    delivered_orders: 1125,
    returned_orders: 8,
};

interface OrdersViewProps {
    onViewOrder?: (orderId: string) => void;
}

export default function OrdersView({ onViewOrder }: OrdersViewProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [sort, setSort] = useState("Newest");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [orders, setOrders] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState(MOCK_STATS);
    const { showToast } = useToast();

    // Cancel confirmation state
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, search, statusFilter, dateFilter, sort]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Convert date filter to from/to
            let from: string | undefined;
            let to: string | undefined;
            const now = new Date();
            if (dateFilter === "Today") {
                from = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                to = new Date(now.setHours(23, 59, 59, 999)).toISOString();
            } else if (dateFilter === "Last 7 Days") {
                from = new Date(now.setDate(now.getDate() - 7)).toISOString();
            } else if (dateFilter === "Last 30 Days") {
                from = new Date(now.setDate(now.getDate() - 30)).toISOString();
            }

            const sortByMap: Record<string, string> = {
                Newest: "createdAt",
                Oldest: "createdAt",
            };
            const sortOrder = sort === "Oldest" ? "asc" : "desc";
            const sortBy = sortByMap[sort] || "createdAt";

            const [ordersRes, statsRes] = await Promise.all([
                getAdminOrders({
                    page: currentPage,
                    limit: pageSize,
                    search: search || undefined,
                    status: statusFilter !== "All Status" ? statusFilter : undefined,
                    from,
                    to,
                    sortBy,
                    sortOrder,
                }),
                getAdminOrderStats({ from, to }),
            ]);

            // Safely set orders – fallback to mock if no data
            if (ordersRes && ordersRes.data && Array.isArray(ordersRes.data)) {
                setOrders(ordersRes.data);
                setTotalItems(ordersRes.total);
            } else {
                // Use mock data for development
                setOrders(MOCK_ORDERS);
                setTotalItems(MOCK_ORDERS.length);
            }

            // Safely set stats – fallback to mock
            if (statsRes) {
                setStats(statsRes);
            } else {
                setStats(MOCK_STATS);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setOrders(MOCK_ORDERS);
            setTotalItems(MOCK_ORDERS.length);
            setStats(MOCK_STATS);
            showToast("Error", "Could not load orders", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportAdminOrders({
                search: search || undefined,
                status: statusFilter !== "All Status" ? statusFilter : undefined,
            });
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "orders.csv";
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            showToast("Error", "Export failed", "error");
        }
    };

    const handleDownloadInvoice = (orderId: string) => {
        window.open(`/api/admin/orders/${orderId}/invoice`, "_blank");
    };

    const handleCancelClick = (orderId: string) => {
        setCancellingOrderId(orderId);
        setShowCancelConfirm(true);
    };

    const confirmCancel = async () => {
        if (!cancellingOrderId) return;
        try {
            await cancelOrder(cancellingOrderId);
            // Update local state optimistically
            setOrders(prev =>
                prev.map(o =>
                    o._id === cancellingOrderId ? { ...o, status: "Cancelled" } : o
                )
            );
            showToast("Success", "Order cancelled", "success");
        } catch (err) {
            showToast("Error", "Failed to cancel order", "error");
        } finally {
            setShowCancelConfirm(false);
            setCancellingOrderId(null);
            setOpenMenu(null);
        }
    };

    const statuses = ["All Status", "Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    const dateOptions = ["All Dates", "Today", "Last 7 Days", "Last 30 Days"];

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Delivered: "bg-green-100 text-green-700",
            Shipped: "bg-blue-100 text-blue-700",
            "Out for Delivery": "bg-indigo-100 text-indigo-700",
            Processing: "bg-orange-100 text-orange-700",
            Pending: "bg-purple-100 text-purple-700",
            Cancelled: "bg-red-100 text-red-700",
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 w-full">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Orders and Shipping Management</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Total Orders</p>
                            <p className="text-3xl font-bold text-primary">{stats.total_orders.toLocaleString()}</p>
                            <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1"><TrendingUp size={11} /> +8.3% vs last month</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Pending</p>
                            <p className="text-3xl font-bold text-orange-500">{stats.pending_orders}</p>
                            <p className="text-xs text-muted-foreground mt-2">Need attention</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Processing</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.processing_orders}</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Shipped</p>
                            <p className="text-3xl font-bold text-blue-500">{stats.shipped_orders}</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Delivered</p>
                            <p className="text-3xl font-bold text-foreground">{stats.delivered_orders}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {statuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {dateOptions.map((d) => <option key={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {["Newest", "Oldest"].map((s) => <option key={s}>Sort: {s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {isLoading ? (
                <SkeletonTable rows={10} cols={8} />
            ) : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tracking</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-muted-foreground">
                                            <ShoppingCart size={36} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No orders found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/30 transition-colors">
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground font-mono text-xs flex justify-between md:table-cell">
                                                <span className="md:hidden text-muted-foreground uppercase tracking-wider">Order ID</span>
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                    <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Product</span>
                                                    <button
                                                        onClick={() => onViewOrder?.(order._id)}
                                                        className="text-primary hover:underline font-medium text-sm text-left"
                                                    >
                                                        {order.products?.[0]?.name || "View Details"}
                                                        {order.products?.length > 1 && ` +${order.products.length - 1}`}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full ${order.bg} text-white text-xs font-bold shrink-0 hidden md:flex md:items-center md:justify-center`}>
                                                        {order.initials}
                                                    </div>
                                                    <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Customer</span>
                                                        <div className="text-right md:text-left">
                                                            <p className="font-semibold text-foreground text-sm leading-tight">{order.customer}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{order.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground text-sm flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Date</span>
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Amount</span>
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Status</span>
                                                {statusBadge(order.status)}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Tracking</span>
                                                <span className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono">
                                                    {order.trackingNumber || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                                                <button
                                                    onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)}
                                                    className="text-muted-foreground hover:text-foreground md:p-1.5 px-4 py-2 bg-muted md:bg-transparent rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-xs font-bold"
                                                >
                                                    <span className="md:hidden">Actions</span>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenu === order._id && (
                                                    <div className="absolute right-0 md:right-6 top-12 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-48 text-sm">
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => onViewOrder?.(order._id)}>
                                                            View Details
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => handleDownloadInvoice(order._id)}>
                                                            Download Invoice
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500" onClick={() => handleCancelClick(order._id)}>
                                                            Cancel Order
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

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/20">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }}
                            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                        />
                        <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0" onClick={handleExport}>
                            Export CSV →
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md">
                        <h3 className="text-lg font-bold mb-4">Cancel Order</h3>
                        <p className="mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                No, Keep
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}