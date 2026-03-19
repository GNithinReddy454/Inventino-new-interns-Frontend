"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, MoreVertical, Search, Users } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import Pagination from "./Pagination";
import {
    getAdminCustomers,
    getAdminCustomerStats,
    exportAdminCustomers,
    AdminCustomer,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

interface CustomersViewProps {
    onViewProfile?: (customerId: string) => void;
}

interface CustomerStatsState {
    total: number;
    active: number;
    inactive: number;
}

const INITIAL_STATS: CustomerStatsState = {
    total: 0,
    active: 0,
    inactive: 0,
};

function getBlobFromResponse(response: any): Blob | null {
    if (!response) return null;
    if (response instanceof Blob) return response;
    if (response?.data instanceof Blob) return response.data;
    return null;
}

export default function CustomersView({ onViewProfile }: CustomersViewProps) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("Newest");
    const [activeTab, setActiveTab] = useState("All Customers");
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<CustomerStatsState>(INITIAL_STATS);

    const { showToast } = useToast();

    const sortParams = useMemo(() => {
        switch (sort) {
            case "Oldest":
                return { sortBy: "createdAt", sortOrder: "asc" as const };
            case "Newest":
            default:
                return { sortBy: "createdAt", sortOrder: "desc" as const };
        }
    }, [sort]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const [customersResponse, statsResponse] = await Promise.all([
                getAdminCustomers({
                    page: currentPage,
                    limit: pageSize,
                    search: search.trim() || undefined,
                    ...sortParams,
                }),
                getAdminCustomerStats(),
            ]);

            const customerList = Array.isArray(customersResponse?.data)
                ? customersResponse.data
                : Array.isArray(customersResponse)
                ? customersResponse
                : [];

            const normalizedCustomers: AdminCustomer[] = customerList
                .filter((customer: any) => customer?.userId || customer?._id)
                .map((customer: any) => ({
                    _id: customer?._id || "",
                    name: customer?.name || "Unknown",
                    email: customer?.email || "—",
                    phone: customer?.phone || "—",
                    userId: customer?.userId || "",
                    totalOrders: customer?.totalOrders,
                    totalSpent: customer?.totalSpent,
                    customerType: customer?.customerType || "Regular",
                }));

            setCustomers(normalizedCustomers);
            setTotalItems(
                typeof customersResponse?.total === "number"
                    ? customersResponse.total
                    : normalizedCustomers.length
            );

            setStats({
                total: Number(statsResponse?.total ?? 0),
                active: Number(statsResponse?.active ?? 0),
                inactive: Number(statsResponse?.inactive ?? 0),
            });
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            setCustomers([]);
            setTotalItems(0);
            setStats(INITIAL_STATS);
            showToast("Error", "Could not load customers", "error");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, search, sortParams, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            const response = await exportAdminCustomers({
                format: "csv",
                search: search.trim() || undefined,
            });

            const blob = getBlobFromResponse(response);

            if (!blob) {
                throw new Error("Invalid export response");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            showToast("Success", "Customers exported successfully", "success");
        } catch (error) {
            console.error("Export failed:", error);
            showToast("Error", "Export failed", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const handleViewProfile = (customer: AdminCustomer) => {
        const customerIdentifier = customer.userId || customer._id;

        if (!customerIdentifier) {
            showToast("Error", "Customer ID not available", "error");
            return;
        }

        if (!onViewProfile) {
            showToast("Error", "View profile action is unavailable", "error");
            return;
        }

        onViewProfile(customerIdentifier);
    };

    const tabs = ["All Customers", "Returns", "Replacements", "Support"];

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Customers Management</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        View and manage all customers
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isExporting ? "Exporting..." : "Export Customers"}
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    [
                        {
                            label: "Total Customers",
                            value: stats.total.toLocaleString(),
                            color: "text-primary",
                            key: "total",
                        },
                        {
                            label: "Active Customers",
                            value: stats.active.toLocaleString(),
                            color: "text-green-600",
                            key: "active",
                        },
                        {
                            label: "Inactive Customers",
                            value: stats.inactive.toLocaleString(),
                            color: "text-red-500",
                            key: "inactive",
                        },
                        {
                            label: "Showing",
                            value: customers.length.toLocaleString(),
                            color: "text-foreground",
                            key: "showing",
                        },
                    ].map((card) => (
                        <div
                            key={card.key}
                            className="bg-card rounded-2xl border border-border shadow-sm p-5"
                        >
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                {card.label}
                            </p>
                            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex border-b border-border px-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                                activeTab === tab
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={15}
                        />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or customer ID..."
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
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-4">
                        <SkeletonTable rows={10} cols={5} />
                    </div>
                ) : activeTab === "All Customers" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-pink-50/50 text-muted-foreground text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Customer ID</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Phone</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => {
                                        const menuKey = customer.userId || customer._id;

                                        return (
                                            <tr key={menuKey} className="hover:bg-muted/20">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#E91E63] text-white text-xs font-bold flex items-center justify-center">
                                                            {(customer.name || "U").slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <button
                                                            onClick={() => handleViewProfile(customer)}
                                                            className="font-medium hover:underline text-foreground text-left"
                                                        >
                                                            {customer.name}
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                    {customer.userId || "—"}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {customer.email}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {customer.phone || "—"}
                                                </td>

                                                <td className="px-4 py-3 relative">
                                                    <button
                                                        onClick={() =>
                                                            setOpenMenu(openMenu === menuKey ? null : menuKey)
                                                        }
                                                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                    </button>

                                                    {openMenu === menuKey && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border py-1 z-50">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewProfile(customer);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        <div className="border-t border-border px-4 py-3">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    setOpenMenu(null);
                                }}
                                onPageSizeChange={(size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                    setOpenMenu(null);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Users size={36} className="mb-3 opacity-20" />
                        <p className="text-sm">{activeTab} — No records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
