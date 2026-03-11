import { useState, useEffect } from "react";
import { TrendingUp, MoreVertical, Check, Star } from "lucide-react";
import { Skeleton, SkeletonCard } from "./Skeleton";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    getDashboard,
    getAnalytics,
    DashboardData,
    AnalyticsData,
} from "@/services/admin.service";

interface StatCardProps {
    title: string;
    value: string;
    trend: number;
}

function StatCard({ title, value, trend }: StatCardProps) {
    const isPositive = trend >= 0;
    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 relative overflow-hidden flex flex-col justify-center h-32">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#E91E63]"></div>
            <p className="text-[13px] text-gray-500 font-medium mb-1 pl-2">{title}</p>
            <h3 className="text-[32px] font-bold text-gray-900 mb-2 pl-2 tracking-tight leading-none">{value}</h3>
            <div className="flex items-center text-[11px] pl-2 font-bold mt-1">
                <span className={`flex items-center ${isPositive ? "text-[#22C55E]" : "text-red-500"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`mr-1 ${!isPositive ? "rotate-180" : ""}`}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    {Math.abs(trend)}%
                </span>
                <span className="text-gray-400 ml-1.5 font-medium">vs last month</span>
            </div>
        </div>
    );
}

function CategoryProgress({ label, percent }: { label: string, percent: number }) {
    return (
        <div>
            <div className="flex justify-between text-[12px] font-bold text-gray-900 mb-2.5">
                <span>{label}</span>
                <span className="text-[#E91E63]">{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#FDF2F5] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#E91E63] rounded-full transition-all duration-1000"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

// Maps UI label → API period param
const PERIOD_MAP: Record<string, string> = {
    "7 Days": "7d",
    "30 Days": "30d",
    "90 Days": "90d",
    "1 Year": "1y",
};

export default function DashboardView({ TOP_PRODUCTS, RECENT_ACTIVITY }: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [chartRange, setChartRange] = useState("30 Days");

    // API state
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [apiError, setApiError] = useState(false);

    // Fetch dashboard KPI data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [dash, analytics] = await Promise.all([
                    getDashboard(),
                    getAnalytics(PERIOD_MAP[chartRange] || "30d"),
                ]);
                setDashboardData(dash);
                setAnalyticsData(analytics);
                setApiError(false);
            } catch (err) {
                console.error("Failed to fetch admin dashboard data:", err);
                setApiError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [chartRange]);

    // Build chart data from analytics — fallback to static demo if API has no chart series
    const buildChartData = () => {
        if (!analyticsData) return [];
        // The analytics endpoint returns aggregated totals, not per-day series.
        // We represent it as a single data point labeled by period.
        return [
            { day: chartRange, revenue: analyticsData.revenue.current },
        ];
    };

    const activeChartData = buildChartData();

    // Format numbers
    const formattedRevenue = dashboardData
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dashboardData.totalRevenue)
        : "—";

    return (
        <div className="space-y-6 max-w-full">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : apiError ? (
                    <div className="col-span-4 p-4 text-center text-red-500 text-sm">
                        Failed to load dashboard data. Please check your connection.
                    </div>
                ) : (
                    <>
                        <StatCard title="Total Revenue" value={formattedRevenue} trend={dashboardData?.revenueTrend ?? 0} />
                        <StatCard title="Total Orders" value={(dashboardData?.totalOrders ?? 0).toLocaleString()} trend={dashboardData?.ordersTrend ?? 0} />
                        <StatCard title="Total Products" value={(dashboardData?.totalProducts ?? 0).toLocaleString()} trend={0} />
                        <StatCard title="Active Users" value={(dashboardData?.activeUsers ?? 0).toLocaleString()} trend={0} />
                    </>
                )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8 flex flex-col min-h-[400px] h-full">
                        <div className="flex justify-between items-center mb-10 w-full relative z-10">
                            <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Revenue Overview</h3>
                            <div className="flex gap-1.5 p-1 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] rounded-full">
                                {["7 Days", "30 Days", "90 Days", "1 Year"].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setChartRange(range)}
                                        className={`px-4 py-1.5 text-[11px] font-bold rounded-full transition-colors tracking-wide ${chartRange === range
                                            ? "bg-[#E91E63] text-white shadow-sm"
                                            : "bg-transparent text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Interactive Recharts AreaChart */}
                        <div className="flex-1 w-full" style={{ minHeight: 280 }}>
                            {isLoading ? (
                                <Skeleton className="w-full h-[280px]" />
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E91E63" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                                            formatter={(v: number | undefined) => [`₹${(v ?? 0).toLocaleString()}`, "Revenue"]}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#E91E63" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 4, fill: "#E91E63", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#E91E63" }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sales by Category */}
                <div>
                    <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8 h-full">
                        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight mb-8">Sales by Category</h3>
                        <div className="space-y-6">
                            <CategoryProgress label="Jewelry" percent={45} />
                            <CategoryProgress label="Accessories" percent={30} />
                            <CategoryProgress label="Home Decor" percent={15} />
                            <CategoryProgress label="Art & Crafts" percent={10} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Summary Row */}
            {!isLoading && analyticsData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Revenue", value: `₹${analyticsData.revenue.current.toLocaleString()}`, trend: analyticsData.revenue.trend },
                        { label: "Orders", value: analyticsData.orders.current.toLocaleString(), trend: analyticsData.orders.trend },
                        { label: "Conversion Rate", value: `${analyticsData.conversionRate.current}%`, trend: analyticsData.conversionRate.trend },
                        { label: "Visitors", value: analyticsData.visitors.current.toLocaleString(), trend: analyticsData.visitors.trend },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-5">
                            <p className="text-[11px] text-gray-500 font-medium mb-1">{item.label}</p>
                            <p className="text-[22px] font-bold text-gray-900 tracking-tight">{item.value}</p>
                            <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${item.trend >= 0 ? "text-[#22C55E]" : "text-red-500"}`}>
                                <TrendingUp size={11} className={item.trend < 0 ? "rotate-180" : ""} />
                                {item.trend >= 0 ? "+" : ""}{item.trend}% vs last period
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8 overflow-visible relative">
                <div className="flex justify-between items-center mb-6 text-sm">
                    <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Recent Orders</h3>
                    <button className="text-[#E91E63] font-bold text-[12px] hover:underline flex items-center gap-1">View All &rarr;</button>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-[12px] whitespace-nowrap">
                        <thead className="text-gray-400 font-black uppercase tracking-widest border-b border-gray-100 hidden md:table-header-group">
                            <tr>
                                <th className="px-1 py-4 font-bold">ORDER ID</th>
                                <th className="px-4 py-4 font-bold">CUSTOMER</th>
                                <th className="px-4 py-4 font-bold">PRODUCT</th>
                                <th className="px-4 py-4 font-bold">AMOUNT</th>
                                <th className="px-4 py-4 font-bold">STATUS</th>
                                <th className="px-4 py-4 font-bold">DATE</th>
                                <th className="px-4 py-4 font-bold md:text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { id: "#ORD-2024-001", initials: "SM", customer: "Sarah Miller", product: "Rose Gold Bracelet", amount: "$89.99", status: "Completed", date: "Feb 6, 2026" },
                                { id: "#ORD-2024-002", initials: "JD", customer: "John Davis", product: "Pearl Necklace Set", amount: "$129.99", status: "Processing", date: "Feb 6, 2026" },
                                { id: "#ORD-2024-003", initials: "EB", customer: "Emily Brown", product: "Boho Beaded Set", amount: "$44.99", status: "Pending", date: "Feb 5, 2026" },
                                { id: "#ORD-2024-004", initials: "MW", customer: "Michael Wilson", product: "Crochet Pouch", amount: "$39.99", status: "Completed", date: "Feb 5, 2026" },
                                { id: "#ORD-2024-005", initials: "OJ", customer: "Olivia Johnson", product: "Classic Earrings", amount: "$54.99", status: "Cancelled", date: "Feb 4, 2026" },
                            ].map((order, i) => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-1 py-4 font-bold text-[13px] text-gray-900">{order.id}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#E91E63] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">{order.initials}</div>
                                            <span className="font-bold text-[13px] text-gray-900">{order.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 font-medium">{order.product}</td>
                                    <td className="px-4 py-4 font-bold text-[13px] text-gray-900">{order.amount}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${order.status === "Completed" ? "bg-[#F0FDF4] text-[#16A34A]" :
                                            order.status === "Processing" ? "bg-[#EFF6FF] text-[#2563EB]" :
                                                order.status === "Pending" ? "bg-[#FFF7ED] text-[#EA580C]" :
                                                    "bg-[#FEF2F2] text-[#DC2626]"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === "Completed" ? "bg-[#22C55E]" :
                                                order.status === "Processing" ? "bg-[#3B82F6]" :
                                                    order.status === "Pending" ? "bg-[#F97316]" :
                                                        "bg-[#EF4444]"
                                                }`}></span>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 font-medium">{order.date}</td>
                                    <td className="px-4 py-4 md:text-right relative">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {openDropdownId === order.id && (
                                            <div className="absolute right-0 top-12 z-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 w-32 text-[12px] font-bold text-left">
                                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Edit Product
                                                </button>
                                                <button className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500 flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bottom Row: Top Products */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Top Products</h3>
                        <button className="text-[#E91E63] font-bold text-[12px] hover:underline flex items-center gap-1">View All &rarr;</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { name: "Rose Gold Bracelet", category: "Jewelry", sales: "245", color: "bg-[#DBA379]" },
                            { name: "Pearl Necklace", category: "Jewelry", sales: "198", color: "bg-[#BCC1C4]" },
                            { name: "Boho Beaded Set", category: "Accessories", sales: "156", color: "bg-[#678F7A]" },
                            { name: "Crochet Pouch", category: "Accessories", sales: "142", color: "bg-[#F0DA79]" },
                        ].map((prod: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-[52px] h-[52px] rounded-xl flex shrink-0 overflow-hidden items-center justify-center ${prod.color}`}>
                                    {prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0] ? (
                                        <img
                                            src={prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0]}
                                            alt={prod.name || "Product"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[13px] text-gray-900 truncate mb-0.5">{prod.name}</p>
                                    <p className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">{prod.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[15px] text-[#E91E63] leading-none mb-1 tracking-tight">{prod.sales}</p>
                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black">SOLD</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Recent Activity</h3>
                    </div>
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3.5 text-sm relative">
                            {[
                                { text: "New order received", time: "2 minutes ago", icon: <span className="text-[14px]">🎉</span> },
                                { text: "Order shipped", time: "15 minutes ago", icon: <Check size={14} className="text-white" strokeWidth={4} />, iconBg: "bg-[#22C55E]" },
                                { text: "New 5-star review", time: "1 hour ago", icon: <Star size={12} className="text-yellow-400 fill-yellow-400" /> },
                                { text: "New product added", time: "3 hours ago", icon: <span className="text-[14px]">📦</span> },
                            ].map((act, i) => (
                                <div key={i} className="flex gap-4 relative justify-start items-center bg-[#FAFAFA] rounded-xl p-4 transition-colors hover:bg-gray-100/50">
                                    <div className="w-9 h-9 bg-white rounded-full flex shrink-0 items-center justify-center shadow-sm text-center">
                                        {act.iconBg ? (
                                            <div className={`${act.iconBg} w-5 h-5 rounded flex items-center justify-center`}>
                                                {act.icon}
                                            </div>
                                        ) : act.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[13.5px] text-gray-900 leading-tight mb-1">{act.text}</p>
                                        <p className="text-[11px] text-gray-400 font-medium">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
