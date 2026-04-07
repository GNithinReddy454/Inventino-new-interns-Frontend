"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, MoreVertical, Search, Users } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "../_components/Skeleton";
import Pagination from "../_components/Pagination";
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
                }));

            setCustomers(normalizedCustomers);

            setTotalItems(
                Number(statsResponse?.total ?? 0) || normalizedCustomers.length
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
        <div className="space-y-6 w-full text-[#1F1728]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#2A1F2F]">
                        Customers Management
                    </h2>
                    <p className="mt-1 text-[13px] text-[#9D95A3]">
                        View and manage all customers
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="h-[38px] px-4 bg-[#EB5C8A] text-white text-[12px] font-semibold rounded-[10px] hover:bg-[#E35182] transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
                            color: "text-[#EB5C8A]",
                            key: "total",
                        },
                        {
                            label: "Active Customers",
                            value: stats.active.toLocaleString(),
                            color: "text-[#EB5C8A]",
                            key: "active",
                        },
                        {
                            label: "Inactive Customers",
                            value: stats.inactive.toLocaleString(),
                            color: "text-[#EB5C8A]",
                            key: "inactive",
                        },
                        {
                            label: "Showing",
                            value: customers.length.toLocaleString(),
                            color: "text-[#EB5C8A]",
                            key: "showing",
                        },
                    ].map((card) => (
                        <div
                            key={card.key}
                            className="rounded-[18px] border border-[#F1E6EA] bg-white p-5 shadow-[0_4px_18px_rgba(31,23,40,0.04)]"
                        >
                            <p className="mb-2 text-[10px] font-medium text-[#B7AEB6]">
                                {card.label}
                            </p>
                            <p className={`text-[40px] leading-none font-bold ${card.color}`}>
                                {card.value}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-white rounded-[24px] border border-[#F1E6EA] shadow-[0_6px_24px_rgba(31,23,40,0.05)] overflow-hidden">
                <div className="flex border-b border-[#F3E9ED] px-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 py-4 text-[13px] font-semibold transition-colors whitespace-nowrap ${
                                activeTab === tab
                                    ? "text-[#EB5C8A]"
                                    : "text-[#A59CA7] hover:text-[#3B3340]"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#EB5C8A] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-b border-[#F3E9ED]">
                    <div className="flex flex-col md:flex-row gap-3 rounded-[18px] bg-[#FFF8FA] p-3">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B6ADB7]"
                                size={14}
                            />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full h-[40px] pl-9 pr-4 bg-white border border-[#EEE3E8] rounded-[12px] text-[13px] text-[#2A1F2F] placeholder:text-[#B6ADB7] focus:outline-none focus:border-[#EB5C8A] transition-all"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none min-w-[170px] h-[40px] pl-4 pr-9 bg-white border border-[#EEE3E8] rounded-[12px] text-[13px] text-[#2A1F2F] focus:outline-none focus:border-[#EB5C8A] cursor-pointer"
                            >
                                <option value="Newest">Sort: Newest</option>
                                <option value="Oldest">Sort: Oldest</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6ADB7] pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-4">
                        <SkeletonTable rows={10} cols={5} />
                    </div>
                ) : activeTab === "All Customers" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FDF1F4] text-[#8E8794] text-[10px] uppercase tracking-[0.08em]">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Customer</th>
                                    <th className="px-6 py-4 text-left font-semibold">Customer ID</th>
                                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                                    <th className="px-6 py-4 text-left font-semibold">Phone</th>
                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#F5EDF0]">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-[#9D95A3]">
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => {
                                        const menuKey = customer.userId || customer._id;

                                        return (
                                            <tr
                                                key={menuKey}
                                                className="hover:bg-[#FFFDFE] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#E95D8A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {(customer.name || "U").slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <button
                                                            onClick={() => handleViewProfile(customer)}
                                                            className="font-semibold text-[#2A1F2F] hover:text-[#EB5C8A] text-left transition-colors"
                                                        >
                                                            {customer.name}
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-[#8A8190] font-mono text-[12px]">
                                                    {customer.userId || "—"}
                                                </td>

                                                <td className="px-6 py-4 text-[#7B7382] text-[13px]">
                                                    {customer.email}
                                                </td>

                                                <td className="px-6 py-4 text-[#7B7382] text-[13px]">
                                                    {customer.phone || "—"}
                                                </td>

                                                <td className="px-6 py-4 relative">
                                                    <button
                                                        onClick={() =>
                                                            setOpenMenu(openMenu === menuKey ? null : menuKey)
                                                        }
                                                        className="p-2 rounded-lg hover:bg-[#F8F3F6] transition-colors"
                                                    >
                                                        <MoreVertical
                                                            size={16}
                                                            className="text-[#9A93A3]"
                                                        />
                                                    </button>

                                                    {openMenu === menuKey && (
                                                        <div className="absolute right-6 mt-2 w-44 bg-white rounded-[14px] shadow-[0_14px_30px_rgba(31,23,40,0.1)] border border-[#F0E4E8] py-2 z-50">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewProfile(customer);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-[13px] text-[#2A1F2F] hover:bg-[#FAF6F8] transition-colors"
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

                        <div className="border-t border-[#F3E9ED] px-4 py-3">
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
                    <div className="flex flex-col items-center justify-center py-16 text-[#9D95A3]">
                        <Users size={36} className="mb-3 opacity-20" />
                        <p className="text-sm">{activeTab} — No records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}