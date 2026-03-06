import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, Users } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import { exportToCSV } from "./exportUtils";
import Pagination from "./Pagination";
import { getAdminCustomers, AdminCustomer } from "@/services/admin.service";

export default function CustomersView() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [sort, setSort] = useState("Newest");
    const [activeTab, setActiveTab] = useState("All Customers");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [CUSTOMERS_DATA, setCustomersData] = useState<AdminCustomer[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminCustomers();
                setCustomersData(data ?? []);
            } catch (err) {
                console.error("Failed to fetch admin customers:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const tabs = ["All Customers", "Returns", "Replacements", "Support"];

    const filtered = CUSTOMERS_DATA.filter((c: any) => {
        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "All Types" || c.customerType === typeFilter;
        return matchSearch && matchType;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const typeBadge = (type: string) => {
        const map: Record<string, string> = {
            VIP: "bg-yellow-100 text-yellow-700",
            Regular: "bg-blue-100 text-blue-700",
            New: "bg-pink-100 text-pink-600",
        };
        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${map[type] || "bg-gray-100 text-gray-600"
                    }`}
            >
                {type}
            </span>
        );
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Customers Management
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        View and manage all customers, returns, and support requests
                    </p>
                </div>
                <button
                    onClick={() => exportToCSV(filtered, "customers.csv", ["initials", "bg"])}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0"
                >
                    Export Customers
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    [
                        { label: "Total Customers", value: CUSTOMERS_DATA.length.toLocaleString(), color: "text-primary" },
                        { label: "New", value: CUSTOMERS_DATA.filter((c: any) => c.customerType === "New").length, color: "text-primary" },
                        { label: "Regular", value: CUSTOMERS_DATA.filter((c: any) => c.customerType === "Regular").length, color: "text-primary" },
                        { label: "VIP", value: CUSTOMERS_DATA.filter((c: any) => c.customerType === "VIP").length, color: "text-primary" },
                    ].map((c) => (
                        <div
                            key={c.label}
                            className="bg-card rounded-2xl border border-border shadow-sm p-5"
                        >
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                {c.label}
                            </p>
                            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Tab bar + Search/Filter */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 py-4 text-sm font-semibold transition-colors ${activeTab === tab
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

                {/* Search / Filter / Sort */}
                <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={15}
                        />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearch(e.target.value)
                            }
                            className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setTypeFilter(e.target.value)
                            }
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {["All Types", "VIP", "Regular", "New"].map((t) => (
                                <option key={t}>{t}</option>
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
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {["Newest", "Oldest", "Most Orders", "Highest Spent"].map((s) => (
                                <option key={s}>Sort: {s}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="p-4">
                        <SkeletonTable rows={10} cols={6} />
                    </div>
                ) : activeTab === "All Customers" ? (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-pink-50/50 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Total Orders</th>
                                    <th className="px-6 py-4">Total Spent</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-12 text-muted-foreground text-sm"
                                        >
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((c: any) => (
                                        <tr
                                            key={c._id}
                                            className="flex flex-col md:table-row border-b md:border-b-0 border-border p-4 md:p-0 hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-0 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full bg-[#E91E63] flex items-center justify-center text-white text-xs font-bold shrink-0 hidden md:flex`}
                                                    >
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex md:block justify-between w-full md:w-auto items-center">
                                                        <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Customer</span>
                                                        <div className="text-right md:text-left">
                                                            <p className="font-bold text-foreground text-sm leading-tight">
                                                                {c.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-muted-foreground text-sm flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Email</span>
                                                {c.email}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 text-foreground font-semibold flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Total Orders</span>
                                                {c.totalOrders}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 font-bold text-foreground flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Total Spent</span>
                                                ₹{c.totalSpent?.toLocaleString() ?? 0}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:table-cell items-center">
                                                <span className="md:hidden text-muted-foreground text-xs uppercase font-bold tracking-wider">Type</span>
                                                {typeBadge(c.customerType)}
                                            </td>
                                            <td className="px-0 py-2 md:px-6 md:py-4 relative flex justify-end md:table-cell mt-2 md:mt-0 border-t md:border-0 border-border pt-3 md:pt-4">
                                                <button
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === c._id ? null : c._id)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground md:p-1.5 px-4 py-2 bg-muted md:bg-transparent rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-xs font-bold"
                                                >
                                                    <span className="md:hidden">Actions</span>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenu === c._id && (
                                                    <div className="absolute right-0 md:right-6 top-12 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-48 text-sm">
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                                                            View Profile
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                                                            Send Email
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                                                            View Orders
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500"
                                                            onClick={() => {
                                                                setCustomersData(prev => prev.filter(cu => cu._id !== c._id));
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            Block Customer
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }}
                            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Users size={36} className="mb-3 opacity-20" />
                        <p className="text-sm">{activeTab} — No records found</p>
                    </div>
                )}
            </div>
        </div >
    );
}
