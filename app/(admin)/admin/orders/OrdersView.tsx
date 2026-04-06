"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, TrendingUp, MoreVertical } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "../_components/Skeleton";
import Pagination from "../_components/Pagination";
import {
    getAdminOrders,
    getAdminOrderStats,
    exportAdminOrders,
    cancelOrder,
    downloadOrderInvoice,
    OrderStats,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface OrdersViewProps {
    onViewOrder?: (orderId: string) => void;
}

const EMPTY_STATS: OrderStats = {
    total: 0,
    created: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
};

export default function OrdersView({ onViewOrder }: OrdersViewProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [sort, setSort] = useState("Newest");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [orders, setOrders] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
    const { showToast } = useToast();

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, debouncedSearch, statusFilter, dateFilter, sort]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            let from: string | undefined;
            let to: string | undefined;
            const now = new Date();

            if (dateFilter === "Today") {
                from = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
                to = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
            } else if (dateFilter === "Last 7 Days") {
                const d = new Date();
                d.setDate(now.getDate() - 7);
                from = d.toISOString();
            } else if (dateFilter === "Last 30 Days") {
                const d = new Date();
                d.setDate(now.getDate() - 30);
                from = d.toISOString();
            }

            const [ordersRes, statsRes] = await Promise.all([
                getAdminOrders({
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    status:
                        statusFilter !== "All Status"
                            ? statusFilter.toLowerCase()
                            : undefined,
                    from,
                    to,
                    sortBy: "createdAt",
                    sortOrder: sort === "Oldest" ? "asc" : "desc",
                }),
                getAdminOrderStats(),
            ]);

            const orderList = Array.isArray(ordersRes?.data) ? ordersRes.data : [];

            setOrders(orderList);
            setTotalItems(Number(ordersRes?.total ?? orderList.length));

            setStats({
                ...EMPTY_STATS,
                ...(statsRes || {}),
            });
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setOrders([]);
            setTotalItems(0);
            setStats(EMPTY_STATS);
            showToast("Error", "Could not load orders", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportAdminOrders({
                search: debouncedSearch || undefined,
                status:
                    statusFilter !== "All Status"
                        ? statusFilter.toLowerCase()
                        : undefined,
            });

            if (!blob) {
                throw new Error("Invalid export response");
            }

            const url = window.URL.createObjectURL(blob as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "orders.csv";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            showToast("Error", "Export failed", "error");
        }
    };

    const handleDownloadInvoice = async (orderId: string) => {
        if (!orderId) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        try {
            const blob = await downloadOrderInvoice(orderId);
            if (!blob) {
                throw new Error("Invoice response invalid");
            }

            const url = window.URL.createObjectURL(blob as Blob);
            window.open(url, "_blank");
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Invoice download failed:", err);
            showToast("Error", "Could not download invoice", "error");
        }
    };

    const handleCancelClick = (orderId: string) => {
        if (!orderId) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        setCancellingOrderId(orderId);
        setShowCancelConfirm(true);
    };

    const confirmCancel = async () => {
        if (!cancellingOrderId) return;

        try {
            await cancelOrder(cancellingOrderId, "Cancelled by admin");

            setOrders((prev) =>
                prev.map((o) => {
                    const currentId = getOrderId(o);
                    return currentId === cancellingOrderId
                        ? { ...o, status: "cancelled" }
                        : o;
                })
            );

            showToast("Success", "Order cancelled", "success");
        } catch (err) {
            console.error("Cancel failed:", err);
            showToast("Error", "Failed to cancel order", "error");
        } finally {
            setShowCancelConfirm(false);
            setCancellingOrderId(null);
        }
    };

    const handleViewOrder = (orderId: string) => {
        console.log("Clicked order id:", orderId);

        if (!orderId || orderId === "undefined" || orderId === "null") {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        onViewOrder?.(orderId);
    };

    const statuses = [
        "All Status",
        "created",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
    ];

    const dateOptions = ["All Dates", "Today", "Last 7 Days", "Last 30 Days"];

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            delivered: "bg-green-100 text-green-700",
            shipped: "bg-blue-100 text-blue-700",
            packed: "bg-orange-100 text-orange-700",
            confirmed: "bg-yellow-100 text-yellow-700",
            created: "bg-purple-100 text-purple-700",
            cancelled: "bg-red-100 text-red-700",
        };

        const key = (status ?? "").toLowerCase();

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    map[key] || "bg-gray-100 text-gray-600"
                }`}
            >
                {status || "unknown"}
            </span>
        );
    };

    const getOrderId = (order: any): string => {
        return order?._id || order?.orderId || order?.orderNumber || "";
    };

    const getCustomerName = (order: any): string => {
        if (typeof order?.customer === "string") return order.customer;
        if (typeof order?.customer?.name === "string") return order.customer.name;
        return "Unknown";
    };

    const getCustomerEmail = (order: any): string => {
        if (typeof order?.email === "string") return order.email;
        if (typeof order?.customer?.email === "string") return order.customer.email;
        return "";
    };

    const getInitials = (name: string): string =>
        name
            ? name
                  .split(" ")
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
            : "NA";

    const BG_COLORS = [
        "bg-purple-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-pink-500",
        "bg-yellow-500",
        "bg-indigo-500",
    ];

    const statsCards = [
        {
            label: "Total Orders",
            value: Number(stats.total ?? 0),
            color: "text-primary",
            sub: "+8.3% vs last month",
            subColor: "text-green-500",
        },
        {
            label: "Pending",
            value: Number((stats.created ?? 0) + (stats.confirmed ?? 0)),
            color: "text-orange-500",
            sub: "Need attention",
            subColor: "text-muted-foreground",
        },
        {
            label: "Processing",
            value: Number(stats.packed ?? 0),
            color: "text-yellow-600",
            sub: "",
            subColor: "",
        },
        {
            label: "Shipped",
            value: Number(stats.shipped ?? 0),
            color: "text-blue-500",
            sub: "",
            subColor: "",
        },
        {
            label: "Delivered",
            value: Number(stats.delivered ?? 0),
            color: "text-foreground",
            sub: "",
            subColor: "",
        },
    ];

    return (
        <div className="space-y-6 w-full">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Orders and Shipping Management
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Here&apos;s what&apos;s happening with your store today.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    : statsCards.map((card) => (
                          <div
                              key={card.label}
                              className="bg-card rounded-2xl border border-border shadow-sm p-5"
                          >
                              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                  {card.label}
                              </p>
                              <p className={`text-3xl font-bold ${card.color}`}>
                                  {card.value.toLocaleString()}
                              </p>
                              {card.sub && (
                                  <p
                                      className={`text-xs font-bold mt-2 flex items-center gap-1 ${card.subColor}`}
                                  >
                                      {card.label === "Total Orders" && <TrendingUp size={11} />}
                                      {card.sub}
                                  </p>
                              )}
                          </div>
                      ))}
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
                            placeholder="Search by order ID, customer name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full md:w-40 rounded-xl border-border bg-background text-sm capitalize">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={dateFilter}
                        onValueChange={(val) => {
                            setDateFilter(val);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full md:w-36 rounded-xl border-border bg-background text-sm">
                            <SelectValue placeholder="All Dates" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateOptions.map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={sort}
                        onValueChange={(val) => {
                            setSort(val);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full md:w-32 rounded-xl border-border bg-background text-sm">
                            <SelectValue placeholder="Sort: Newest" />
                        </SelectTrigger>
                        <SelectContent>
                            {["Newest", "Oldest"].map((s) => (
                                <SelectItem key={s} value={s}>
                                    Sort: {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
                                        <td
                                            colSpan={8}
                                            className="text-center py-16 text-muted-foreground"
                                        >
                                            <ShoppingCart
                                                size={36}
                                                className="mx-auto mb-3 opacity-20"
                                            />
                                            <p className="text-sm">No orders found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order, idx) => {
                                        const safeOrderId = getOrderId(order);
                                        const customerName = getCustomerName(order);
                                        const customerEmail = getCustomerEmail(order);
                                        const initials = getInitials(customerName);
                                        const bgColor = BG_COLORS[idx % BG_COLORS.length];
                                        const amount = order.total ?? 0;

                                        const firstProduct =
                                            order.products?.[0] || order.items?.[0] || null;

                                        const productName =
                                            firstProduct?.name ||
                                            firstProduct?.productName ||
                                            firstProduct?.title ||
                                            "—";

                                        const totalProducts =
                                            order.products?.length ??
                                            order.items?.length ??
                                            0;

                                        const extraProducts =
                                            totalProducts > 1
                                                ? ` +${totalProducts - 1}`
                                                : "";

                                        const uniqueKey =
                                            safeOrderId ||
                                            order.orderNumber ||
                                            `order-${idx}`;

                                        return (
                                            <tr
                                                key={uniqueKey}
                                                className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground font-mono text-xs flex justify-between md:table-cell">
                                                    <span className="md:hidden text-muted-foreground uppercase tracking-wider">
                                                        Order ID
                                                    </span>
                                                    {order.orderNumber || safeOrderId || "—"}
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4">
                                                    <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                            Product
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleViewOrder(safeOrderId)
                                                            }
                                                            className="text-primary hover:underline font-medium text-sm text-left"
                                                            disabled={!safeOrderId}
                                                            type="button"
                                                        >
                                                            {productName}
                                                            {extraProducts}
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-9 h-9 rounded-full ${bgColor} text-white text-xs font-bold shrink-0 hidden md:flex md:items-center md:justify-center`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                            <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                                Customer
                                                            </span>
                                                            <div className="text-right md:text-left">
                                                                <p className="font-semibold text-foreground text-sm leading-tight">
                                                                    {customerName}
                                                                </p>
                                                                {customerEmail && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {customerEmail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground text-sm flex justify-between md:table-cell items-center">
                                                    <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                        Date
                                                    </span>
                                                    {order.date
                                                        ? new Date(
                                                              order.date
                                                          ).toLocaleDateString()
                                                        : order.createdAt
                                                        ? new Date(
                                                              order.createdAt
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center">
                                                    <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                        Amount
                                                    </span>
                                                    ₹{Number(amount).toLocaleString()}
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                    <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                        Status
                                                    </span>
                                                    {statusBadge(order.status)}
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                    <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                                        Tracking
                                                    </span>
                                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono">
                                                        {order.trackingNumber || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleViewOrder(safeOrderId)
                                                                }
                                                                className="cursor-pointer"
                                                                disabled={!safeOrderId}
                                                            >
                                                                View Details
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDownloadInvoice(
                                                                        safeOrderId
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                                disabled={!safeOrderId}
                                                            >
                                                                Download Invoice
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleCancelClick(safeOrderId)
                                                                }
                                                                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                                                                disabled={
                                                                    !safeOrderId ||
                                                                    order.status === "cancelled" ||
                                                                    order.status === "delivered"
                                                                }
                                                            >
                                                                Cancel Order
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/20">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={(p) => setCurrentPage(p)}
                            onPageSizeChange={(s) => {
                                setPageSize(s);
                                setCurrentPage(1);
                            }}
                        />

                        <button
                            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0"
                            onClick={handleExport}
                            type="button"
                        >
                            Export CSV →
                        </button>
                    </div>
                </div>
            )}

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Cancel Order</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to cancel this order? This action
                            cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelConfirm(false)}
                            >
                                No, Keep
                            </Button>
                            <Button variant="destructive" onClick={confirmCancel}>
                                Yes, Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}