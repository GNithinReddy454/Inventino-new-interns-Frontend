import { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, Users } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "./Skeleton";
import { exportToCSV } from "./exportUtils";
import Pagination from "./Pagination";
import { 
    getAdminCustomers, 
    getAdminCustomerStats, 
    exportAdminCustomers,
    updateAdminCustomer,
    AdminCustomer 
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

// Mock data for development (keep as fallback)
const MOCK_CUSTOMERS: AdminCustomer[] = [
    {
        _id: "mock-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        totalOrders: 10,
        totalSpent: 2450,
        customerType: "VIP",
        registeredAt: "2025-01-15T10:00:00.000Z",
        active: true,
        customerId: "CUST-001",
    },
    {
        _id: "mock-2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+91 99887 66554",
        totalOrders: 3,
        totalSpent: 350,
        customerType: "Regular",
        registeredAt: "2025-02-20T09:30:00.000Z",
        active: true,
        customerId: "CUST-002",
    },
    {
        _id: "mock-3",
        name: "Alice Johnson",
        email: "alice.j@example.com",
        phone: "+91 77665 44332",
        totalOrders: 7,
        totalSpent: 1890,
        customerType: "VIP",
        registeredAt: "2024-11-05T14:15:00.000Z",
        active: true,
        customerId: "CUST-003",
    },
    {
        _id: "mock-4",
        name: "Bob Williams",
        email: "bob.w@example.com",
        phone: "+91 88997 55443",
        totalOrders: 1,
        totalSpent: 89,
        customerType: "New",
        registeredAt: "2026-03-01T11:20:00.000Z",
        active: false,
        customerId: "CUST-004",
    },
];

const MOCK_STATS = {
    total_customers: 4,
    new_customers: 1,
    regular_customers: 1,
    vip_customers: 2,
};

// Interface for API response based on your actual API
interface ApiCustomer {
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    userId: string;
}

interface ApiCustomersResponse {
    statusCode: number;
    message: string;
    data: ApiCustomer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    error: null;
}

interface ApiStatsResponse {
    statusCode: number;
    message: string;
    data: {
        total: number;
        active: number;
        inactive: number;
    };
    error: null;
}

export default function CustomersView({ onViewProfile }: { onViewProfile?: (customerId: string) => void }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [sort, setSort] = useState("Newest");
    const [activeTab, setActiveTab] = useState("All Customers");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState(MOCK_STATS);
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, search, typeFilter, sort]);

    // Transform API customer to AdminCustomer format
    const transformApiCustomer = (apiCustomer: ApiCustomer): AdminCustomer => {
        console.log("🔄 Transforming API customer:", apiCustomer);
        
        const customerId = apiCustomer.userId;
        
        if (!customerId) {
            console.warn("⚠️ Customer has no userId:", apiCustomer);
        }
        
        // Determine customer type based on registration date
        let customerType = "Regular";
        
        try {
            const registrationDate = new Date(apiCustomer.createdAt);
            const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceRegistration < 30) {
                customerType = "New";
            } else if (daysSinceRegistration > 180) {
                customerType = "VIP";
            }
        } catch (e) {
            console.warn("Error calculating customer type:", e);
        }

        return {
            _id: customerId || `temp-${Date.now()}`,
            name: apiCustomer.name || "Unknown",
            email: apiCustomer.email || "",
            phone: apiCustomer.phone || "—",
            totalOrders: 0,
            totalSpent: 0,
            customerType: customerType,
            registeredAt: apiCustomer.createdAt || new Date().toISOString(),
            active: apiCustomer.isActive === true,
            customerId: customerId,
        };
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log("🔵 Fetching customers with params:", {
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
                sortBy: sort === "Newest" ? "createdAt" : 
                       sort === "Oldest" ? "createdAt" : 
                       sort === "Most Orders" ? "totalOrders" : "totalSpent",
                sortOrder: sort === "Oldest" ? "asc" : "desc",
            });

            // Fetch customers list
            const customersResponse = await getAdminCustomers({
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
                sortBy: sort === "Newest" ? "createdAt" : 
                       sort === "Oldest" ? "createdAt" : 
                       sort === "Most Orders" ? "totalOrders" : "totalSpent",
                sortOrder: sort === "Oldest" ? "asc" : "desc",
            });

            console.log("✅ Customers API Full Response:", customersResponse);

            // Fetch customer stats
            const statsResponse = await getAdminCustomerStats();
            console.log("✅ Stats API Response:", statsResponse);

            // Handle customers data with pagination
            if (customersResponse?.data && Array.isArray(customersResponse.data)) {
                // API returns paginated response with total count
                console.log("✅ Received paginated response with data array");
                console.log(`📊 Page ${customersResponse.page} of ${customersResponse.totalPages}, Total: ${customersResponse.total}`);
                
                const transformedCustomers = (customersResponse.data as any[]).map(transformApiCustomer);
                setCustomers(transformedCustomers);
                
                // IMPORTANT: Set totalItems from API response for correct pagination
                setTotalItems(customersResponse.total || transformedCustomers.length);
            } 
            // Handle direct array response (if API returns without pagination)
            else if (Array.isArray(customersResponse)) {
                console.log("✅ Received direct array of customers");
                const transformedCustomers = (customersResponse as any[]).map(transformApiCustomer);
                setCustomers(transformedCustomers);
                setTotalItems(transformedCustomers.length);
            }
            else {
                console.log("❌ No valid customers data, using mock data");
                setCustomers(MOCK_CUSTOMERS);
                setTotalItems(MOCK_CUSTOMERS.length);
            }

            // Handle stats data
            if (statsResponse) {
                const apiStats = (statsResponse as any).data || statsResponse;
                console.log("✅ Stats data:", apiStats);
                
                setStats({
                    total_customers: apiStats.total || 0,
                    new_customers: Math.floor(apiStats.total * 0.2), // Estimate 20% new customers
                    regular_customers: apiStats.active || 0,
                    vip_customers: Math.floor(apiStats.total * 0.1), // Estimate 10% VIP customers
                });
            } else {
                console.log("❌ No valid stats data, using mock stats");
                setStats(MOCK_STATS);
            }
        } catch (err) {
            console.error("❌ Failed to fetch customers:", err);
            setCustomers(MOCK_CUSTOMERS);
            setTotalItems(MOCK_CUSTOMERS.length);
            setStats(MOCK_STATS);
            showToast("Error", "Could not load customers", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportAdminCustomers({
                format: "csv",
                search: search || undefined,
                type: typeFilter !== "All Types" ? typeFilter : undefined,
            });
            
            if (blob) {
                if (blob instanceof Blob) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    showToast("Success", "Customers exported successfully", "success");
                } else if (typeof blob === 'string') {
                    const csvContent = blob;
                    const blobObj = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blobObj);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    showToast("Success", "Customers exported successfully", "success");
                }
            }
        } catch (err) {
            console.error("Export failed:", err);
            showToast("Error", "Export failed", "error");
        }
    };

    const handleToggleActive = async (customerId: string, currentActive: boolean) => {
        if (customerId.startsWith('mock-') || customerId.startsWith('CUST-')) {
            showToast("Error", "Cannot modify mock customer", "error");
            setOpenMenu(null);
            return;
        }

        try {
            const result = await updateAdminCustomer(customerId, { active: !currentActive });
            if (result) {
                setCustomers(prev =>
                    prev.map(c => c._id === customerId ? { ...c, active: !currentActive } : c)
                );
                showToast("Success", !currentActive ? "Customer activated" : "Customer deactivated", "success");
            }
            setOpenMenu(null);
        } catch (err) {
            console.error("Failed to update status:", err);
            showToast("Error", "Failed to update status", "error");
        }
    };

    const handleViewProfile = (customerId: string) => {
        console.log("👤 handleViewProfile called with ID:", customerId);
        
        // Check if it's a mock ID
        if (customerId?.startsWith('mock-') || customerId?.startsWith('CUST-')) {
            console.warn('Attempted to view mock profile:', customerId);
            showToast("Error", "Cannot view mock customer profile", "error");
            return;
        }
        
        // Check if it's a valid ID format (should be like USR-xxx or a MongoDB ID)
        if (!customerId || customerId.length < 5) {
            console.error("❌ Invalid customer ID:", customerId);
            showToast("Error", "Invalid customer ID", "error");
            return;
        }
        
        if (onViewProfile) {
            console.log("✅ Calling onViewProfile with ID:", customerId);
            onViewProfile(customerId);
        } else {
            console.error("❌ onViewProfile prop is not provided");
            showToast("Error", "View profile function not available", "error");
        }
    };

    const handleViewOrders = (customerId: string) => {
        console.log("📦 View Orders clicked for ID:", customerId);
        
        // Check if it's a mock ID
        if (customerId?.startsWith('mock-') || customerId?.startsWith('CUST-')) {
            showToast("Error", "Cannot view mock customer orders", "error");
            return;
        }
        
        // Navigate to orders page filtered by this customer
        showToast("Info", "View orders feature coming soon", "info");
    };

    const tabs = ["All Customers", "Returns", "Replacements", "Support"];

    const typeBadge = (type: string) => {
        const map: Record<string, string> = {
            VIP: "bg-yellow-100 text-yellow-700",
            Regular: "bg-blue-100 text-blue-700",
            New: "bg-pink-100 text-pink-600",
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[type] || "bg-gray-100 text-gray-600"}`}>{type}</span>;
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Customers Management</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">View and manage all customers, returns, and support requests</p>
                </div>
                <button onClick={handleExport} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0">Export Customers</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
                    [
                        { label: "Total Customers", value: stats.total_customers.toLocaleString(), color: "text-primary", key: "total" },
                        { label: "New", value: stats.new_customers.toLocaleString(), color: "text-primary", key: "new" },
                        { label: "Regular", value: stats.regular_customers.toLocaleString(), color: "text-primary", key: "regular" },
                        { label: "VIP", value: stats.vip_customers.toLocaleString(), color: "text-primary", key: "vip" },
                    ].map((c) => (
                        <div key={c.key} className="bg-card rounded-2xl border border-border shadow-sm p-5">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">{c.label}</p>
                            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex border-b border-border px-6">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-4 py-4 text-sm font-semibold transition-colors ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or customer ID..."
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
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
                        >
                            {["All Types", "VIP", "Regular", "New"].map((t) => <option key={t}>{t}</option>)}
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
                            {["Newest", "Oldest", "Most Orders", "Highest Spent"].map((s) => <option key={s}>Sort: {s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-4"><SkeletonTable rows={10} cols={9} /></div>
                ) : activeTab === "All Customers" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-pink-50/50 text-muted-foreground text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Phone</th>
                                    <th className="px-4 py-3 text-left">Orders</th>
                                    <th className="px-4 py-3 text-left">Spent</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Registered</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((c) => {
                                        // Check if this is a real customer (not mock)
                                        const isRealCustomer = c.customerId && 
                                            !c.customerId.startsWith('mock-') && 
                                            !c.customerId.startsWith('CUST-') &&
                                            c.customerId.length > 5;
                                        
                                        const idToUse = c.customerId || c._id;
                                        
                                        return (
                                            <tr key={c._id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#E91E63] text-white text-xs font-bold flex items-center justify-center">
                                                            {c.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("👆 Customer name clicked:", { 
                                                                        name: c.name, 
                                                                        id: idToUse,
                                                                        customerId: c.customerId,
                                                                        isRealCustomer 
                                                                    });
                                                                    
                                                                    if (isRealCustomer) {
                                                                        handleViewProfile(idToUse);
                                                                    } else {
                                                                        showToast("Error", "Cannot view mock customer profile", "error");
                                                                    }
                                                                }}
                                                                className={`font-medium hover:underline ${!isRealCustomer ? 'text-gray-400 cursor-not-allowed' : 'text-foreground'}`}
                                                            >
                                                                {c.name}
                                                            </button>
                                                            {c.customerId && (
                                                                <p className="text-[10px] text-muted-foreground">{c.customerId}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                                                <td className="px-4 py-3 font-medium">{c.totalOrders}</td>
                                                <td className="px-4 py-3 font-medium">₹{c.totalSpent?.toLocaleString() ?? 0}</td>
                                                <td className="px-4 py-3">{typeBadge(c.customerType)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString() : "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                        {c.active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 relative">
                                                    <button
                                                        onClick={() => setOpenMenu(openMenu === c._id ? null : c._id)}
                                                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={16} className="text-muted-foreground" />
                                                    </button>
                                                    
                                                    {openMenu === c._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border py-1 z-50">
                                                            {isRealCustomer ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleViewProfile(idToUse);
                                                                            setOpenMenu(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                                    >
                                                                        View Profile
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleViewOrders(idToUse);
                                                                            setOpenMenu(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                                    >
                                                                        View Orders
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                                                    No actions available
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination Component */}
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