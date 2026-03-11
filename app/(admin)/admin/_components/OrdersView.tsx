import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import { exportToCSV } from "./exportUtils";
import Pagination from "./Pagination";
import { getAdminOrders, AdminOrder } from "@/services/admin.service";

export default function OrdersView() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [sort, setSort] = useState("Newest");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [ORDERS_DATA, setOrdersData] = useState<AdminOrder[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminOrders();
                setOrdersData(data ?? []);
            } catch (err) {
                console.error("Failed to fetch admin orders:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const statuses = [
        "All Status",
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ];
    const dateOptions = ["All Dates", "Today", "Last 7 Days", "Last 30 Days"];

    const handlePrintInvoice = (order: any) => {
        setOpenMenu(null);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${order.id}</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                    .invoice-title { font-size: 24px; font-weight: bold; color: #111; }
                    .store-info { text-align: right; color: #666; font-size: 14px; }
                    .order-info { margin-bottom: 40px; display: flex; justify-content: space-between; }
                    .info-block { flex: 1; }
                    .info-label { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
                    .info-value { font-size: 16px; font-weight: 500; }
                    .table-container { margin-bottom: 40px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
                    th { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; }
                    .total-box { margin-left: auto; width: 300px; border-top: 2px solid #333; padding-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                    .final-total { font-weight: bold; font-size: 18px; color: #111; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="invoice-title">INVOICE</div>
                        <div style="margin-top: 10px; color: #666;">#${order.id}</div>
                    </div>
                    <div class="store-info">
                        <strong>Handmade Store</strong><br/>
                        123 Craft Street<br/>
                        Artisan City, AC 12345<br/>
                        store@handmade.com
                    </div>
                </div>
                
                <div class="order-info">
                    <div class="info-block">
                        <div class="info-label">Bill To</div>
                        <div class="info-value">
                            ${order.customer}<br/>
                            <span style="font-size: 14px; color: #666;">${order.email}</span>
                        </div>
                    </div>
                    <div class="info-block" style="text-align: right;">
                        <div class="info-label">Date</div>
                        <div class="info-value">${order.date}</div>
                        <div class="info-label" style="margin-top: 15px;">Tracking</div>
                        <div class="info-value">${order.tracking}</div>
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Order items for ${order.id}</td>
                                <td style="text-align: right;">${order.amount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-box">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>${order.amount}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping</span>
                        <span>$0.00</span>
                    </div>
                    <div class="total-row final-total">
                        <span>Total</span>
                        <span>${order.amount}</span>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const filtered = ORDERS_DATA.filter((o: any) => {
        const matchSearch =
            (o._id || "").toLowerCase().includes(search.toLowerCase()) ||
            (o.trackingNumber || "").toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "All Status" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Delivered: "bg-green-100 text-green-700",
            Shipped: "bg-blue-100 text-blue-700",
            Processing: "bg-orange-100 text-orange-700",
            Pending: "bg-purple-100 text-purple-700",
            Cancelled: "bg-red-100 text-red-700",
        };
        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] || "bg-gray-100 text-gray-600"
                    }`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Orders and Shipping Management
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Here&apos;s what&apos;s happening with your store today.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                Total Orders
                            </p>
                            <p className="text-3xl font-bold text-primary">1,245</p>
                            <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
                                <TrendingUp size={11} /> +8.3% vs last month
                            </p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                Pending
                            </p>
                            <p className="text-3xl font-bold text-orange-500">23</p>
                            <p className="text-xs text-muted-foreground mt-2">Need attention</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                Shipped
                            </p>
                            <p className="text-3xl font-bold text-blue-500">89</p>
                            <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
                                <TrendingUp size={11} /> +12% this week
                            </p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                Delivered
                            </p>
                            <p className="text-3xl font-bold text-foreground">1,125</p>
                            <p className="text-xs text-muted-foreground mt-2">All time</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                Returns
                            </p>
                            <p className="text-3xl font-bold text-red-500">8</p>
                            <p className="text-xs text-red-400 font-bold mt-2 flex items-center gap-1">
                                <TrendingUp size={11} className="rotate-180" /> -2.1% vs last month
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Search / Filter / Sort */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={15}
                        />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name..."
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearch(e.target.value)
                            }
                            className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setStatusFilter(e.target.value)
                            }
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
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
                            value={dateFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setDateFilter(e.target.value)
                            }
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                        >
                            {dateOptions.map((d) => (
                                <option key={d}>{d}</option>
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
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setSort(e.target.value)
                            }
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                        >
                            {["Newest", "Oldest"].map((s) => (
                                <option key={s}>Sort: {s}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table & Cards (Responsive) */}
            {isLoading ? (
                <SkeletonTable rows={10} cols={7} />
            ) : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tracking</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-16 text-muted-foreground"
                                        >
                                            <ShoppingCart size={36} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No orders found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((order: any, index: number) => (
                                        <tr
                                            key={order._id ? `${order._id}-${index}` : `order-${index}`}
                                            className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground font-mono text-xs flex justify-between md:table-cell">
                                                <span className="md:hidden text-muted-foreground uppercase tracking-wider">Order ID</span>
                                                {(order._id || "").slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-9 h-9 rounded-full ${order.bg} flex items-center justify-center text-white text-xs font-bold shrink-0 hidden md:flex`}
                                                    >
                                                        {order.initials}
                                                    </div>
                                                    <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Customer</span>
                                                        <div className="text-right md:text-left">
                                                            <p className="font-semibold text-foreground text-sm leading-tight">
                                                                {order.customer}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {order.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground text-sm flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Date</span>
                                                {order.date}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Amount</span>
                                                ₹{order.totalAmount?.toLocaleString() ?? "—"}
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
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === order.id ? null : order.id)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground md:p-1.5 px-4 py-2 bg-muted md:bg-transparent rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-xs font-bold"
                                                >
                                                    <span className="md:hidden">Actions</span>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenu === order.id && (
                                                    <div className="absolute right-0 md:right-6 top-12 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-48 text-sm">
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                                                            View Details
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                                                            onClick={() => {
                                                                const newStatus = order.status === "pending" ? "processing" :
                                                                    order.status === "processing" ? "shipped" :
                                                                        "completed";
                                                                setOrdersData(prev => prev.map(o => o._id === order._id ? { ...o, status: newStatus } : o));
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            Update Status
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                                                            onClick={() => handlePrintInvoice(order)}
                                                        >
                                                            Print Invoice
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500"
                                                            onClick={() => {
                                                                setOrdersData(prev => prev.filter(o => o._id !== order._id));
                                                                setOpenMenu(null);
                                                            }}
                                                        >
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

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/20">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }}
                            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                        />
                        <button
                            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0"
                            onClick={() => exportToCSV(filtered, "orders.csv", ["initials", "bg"])}
                        >
                            Export CSV →
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
