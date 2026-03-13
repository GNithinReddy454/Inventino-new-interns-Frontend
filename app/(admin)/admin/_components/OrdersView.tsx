import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import { exportToCSV } from "./exportUtils";
import Pagination from "./Pagination";
import { getAdminOrders } from "@/services/admin.service";

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
        date: "Feb 18, 2026",
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
        date: "Feb 17, 2026",
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
        date: "Feb 16, 2026",
        trackingNumber: "",
    },
];

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

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminOrders();
                if (data && data.length > 0) {
                    setOrders(data);
                } else {
                    setOrders(MOCK_ORDERS);
                }
            } catch (err) {
                console.error("Failed to fetch admin orders:", err);
                setOrders(MOCK_ORDERS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const statuses = ["All Status", "Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    const dateOptions = ["All Dates", "Today", "Last 7 Days", "Last 30 Days"];

    const handleDownloadInvoice = (orderId: string) => {
        window.open(`/api/invoice/${orderId}`, "_blank");
    };

    const handleCancelOrder = (orderId: string) => {
        console.log("Cancel order", orderId);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
        setOpenMenu(null);
    };

    const filtered = orders.filter((o) => {
        const matchSearch = (o._id || "").toLowerCase().includes(search.toLowerCase()) ||
                            (o.trackingNumber || "").toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All Status" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <div><h2 className="text-2xl font-bold text-foreground">Orders and Shipping Management</h2><p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your store today.</p></div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />) : (
                    <>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Total Orders</p><p className="text-3xl font-bold text-primary">1,245</p><p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1"><TrendingUp size={11} /> +8.3% vs last month</p></div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Pending</p><p className="text-3xl font-bold text-orange-500">23</p><p className="text-xs text-muted-foreground mt-2">Need attention</p></div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Shipped</p><p className="text-3xl font-bold text-blue-500">89</p><p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1"><TrendingUp size={11} /> +12% this week</p></div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Delivered</p><p className="text-3xl font-bold text-foreground">1,125</p><p className="text-xs text-muted-foreground mt-2">All time</p></div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Returns</p><p className="text-3xl font-bold text-red-500">8</p><p className="text-xs text-red-400 font-bold mt-2 flex items-center gap-1"><TrendingUp size={11} className="rotate-180" /> -2.1% vs last month</p></div>
                    </>
                )}
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><input type="text" placeholder="Search by order ID, customer name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all" /></div>
                    <div className="relative"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer">{statuses.map((s) => <option key={s}>{s}</option>)}</select><ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" /></div>
                    <div className="relative"><select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer">{dateOptions.map((d) => <option key={d}>{d}</option>)}</select><ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" /></div>
                    <div className="relative"><select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer">{["Newest", "Oldest"].map((s) => <option key={s}>Sort: {s}</option>)}</select><ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" /></div>
                </div>
            </div>
            {isLoading ? <SkeletonTable rows={10} cols={8} /> : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Tracking</th><th className="px-6 py-4">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-16 text-muted-foreground"><ShoppingCart size={36} className="mx-auto mb-3 opacity-20" /><p className="text-sm">No orders found</p></td></tr>
                                ) : (
                                    paginated.map((order, index) => (
                                        <tr key={order._id ? `${order._id}-${index}` : `order-${index}`} className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/30 transition-colors">
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground font-mono text-xs flex justify-between md:table-cell"><span className="md:hidden text-muted-foreground uppercase tracking-wider">Order ID</span>{(order._id || "").slice(-8).toUpperCase()}</td>
                                            <td className="px-0 py-2 md:px-6 md:py-4"><div className="flex md:block justify-between w-full md:w-auto items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Product</span><button onClick={() => onViewOrder?.(order._id)} className="text-primary hover:underline font-medium text-sm text-left">{order.products?.[0]?.name || "View Details"}{order.products?.length > 1 && ` +${order.products.length - 1}`}</button></div></td>
                                            <td className="px-0 py-2 md:px-6 md:py-4"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full ${order.bg} flex items-center justify-center text-white text-xs font-bold shrink-0 hidden md:flex`}>{order.initials}</div><div className="flex md:block justify-between w-full md:w-auto items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Customer</span><div className="text-right md:text-left"><p className="font-semibold text-foreground text-sm leading-tight">{order.customer}</p><p className="text-xs text-muted-foreground mt-0.5">{order.email}</p></div></div></div></td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground text-sm flex justify-between md:table-cell items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Date</span>{order.date}</td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Amount</span>₹{order.totalAmount?.toLocaleString() ?? "—"}</td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Status</span>{statusBadge(order.status)}</td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center"><span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Tracking</span><span className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono">{order.trackingNumber || "N/A"}</span></td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                                                <button onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)} className="text-muted-foreground hover:text-foreground md:p-1.5 px-4 py-2 bg-muted md:bg-transparent rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-xs font-bold"><span className="md:hidden">Actions</span><MoreVertical size={16} /></button>
                                                {openMenu === order._id && (
                                                    <div className="absolute right-0 md:right-6 top-12 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-48 text-sm">
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => onViewOrder?.(order._id)}>View Details</button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => handleDownloadInvoice(order._id)}>Download Invoice</button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500" onClick={() => handleCancelOrder(order._id)}>Cancel Order</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/20">
                        <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
                        <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0" onClick={() => exportToCSV(filtered, "orders.csv", ["initials", "bg"])}>Export CSV →</button>
                    </div>
                </div>
            )}
        </div>
    );
}
