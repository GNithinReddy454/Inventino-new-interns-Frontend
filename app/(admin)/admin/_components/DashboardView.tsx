import { useState, useEffect } from "react";
import { TrendingUp, MoreVertical, Package, Check, Star, Settings } from "lucide-react";
import { Skeleton, SkeletonCard } from "./Skeleton";

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
}

function StatCard({ title, value, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 relative overflow-hidden flex flex-col justify-center h-32">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#E91E63]"></div>
            <p className="text-[13px] text-gray-500 font-medium mb-1 pl-2">{title}</p>
            <h3 className="text-[32px] font-bold text-gray-900 mb-2 pl-2 tracking-tight leading-none">{value}</h3>
            <div className="flex items-center text-[11px] pl-2 font-bold mt-1">
                <span className="flex items-center text-[#22C55E]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    {trend}
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

export default function DashboardView({ TOP_PRODUCTS, RECENT_ORDERS, RECENT_ACTIVITY }: any) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    return (
        <div className="space-y-6 max-w-full">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatCard title="Total Revenue" value="$45,280" trend="+12.5%" />
                        <StatCard title="Total Orders" value="1,245" trend="+8.3%" />
                        <StatCard title="Total Products" value="856" trend="+15.2%" />
                        <StatCard title="Customers" value="8,426" trend="+6.7%" />
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
                                        className={`px-4 py-1.5 text-[11px] font-bold rounded-full transition-colors tracking-wide ${range === "30 Days"
                                            ? "bg-[#E91E63] text-white shadow-sm"
                                            : "bg-transparent text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full relative -mt-4">
                            <div className="absolute inset-0 flex">
                                {/* Vertical Axis */}
                                <div className="flex flex-col justify-between text-[11px] text-gray-400 font-medium h-[85%] pr-6">
                                    <span>$15k</span>
                                    <span>$10k</span>
                                    <span>$5k</span>
                                    <span>$0k</span>
                                </div>
                                <div className="flex-1 h-[85%] relative border-l border-b border-gray-100">
                                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#E91E63" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#E91E63" stopOpacity="0.05" />
                                            </linearGradient>
                                        </defs>

                                        {/* Chart Shape */}
                                        <path d="M0 90 Q 20 85 30 70 T 50 60 T 70 30 T 90 10 L 100 10 L 100 100 L 0 100 Z" fill="url(#pinkGradient)" />
                                        <path d="M0 90 Q 20 85 30 70 T 50 60 T 70 30 T 90 10 L 100 10" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                        {/* Data Point */}
                                        <circle cx="90" cy="10" r="1.5" fill="white" stroke="#E91E63" strokeWidth="1" />
                                        {/* Diamond shaped top */}
                                        <path d="M 90 2 L 95 6 L 90 10 L 85 6 Z" fill="#E91E63" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1.5 opacity-50 bg-white/50 px-2 py-1 rounded backdrop-blur-sm">
                                            📊 Revenue Chart Area (Can be integrated with Chart.js or similar)
                                        </span>
                                    </div>
                                </div>
                            </div>
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

            {/* Recent Orders Table (Full Width) */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Recent Orders</h3>
                    <button className="text-[#E91E63] text-[12px] font-bold tracking-wide hover:underline flex items-center transition-opacity hover:opacity-80">
                        View All <span className="ml-1 leading-none text-base">→</span>
                    </button>
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap border-separate" style={{ borderSpacing: '0 10px' }}>
                            <thead>
                                <tr className="text-[#9CA3AF] text-[10px] uppercase font-black tracking-[0.05em]">
                                    <th className="font-bold pb-2 pl-4 w-40">ORDER ID</th>
                                    <th className="font-bold pb-2">CUSTOMER</th>
                                    <th className="font-bold pb-2">PRODUCT</th>
                                    <th className="font-bold pb-2">AMOUNT</th>
                                    <th className="font-bold pb-2 pl-1 w-32">STATUS</th>
                                    <th className="font-bold pb-2">DATE</th>
                                    <th className="font-bold pb-2 text-center w-24">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="text-[12px]">
                                {[
                                    { id: "#ORD-2024-001", init: "SM", name: "Sarah Miller", prod: "Rose Gold Bracelet", amt: "$89.99", status: "Completed", date: "Feb 6, 2026", color: "bg-[#E91E63]" },
                                    { id: "#ORD-2024-002", init: "JD", name: "John Davis", prod: "Pearl Necklace Set", amt: "$129.99", status: "Processing", date: "Feb 6, 2026", color: "bg-[#E91E63]" },
                                    { id: "#ORD-2024-003", init: "EB", name: "Emily Brown", prod: "Boho Beaded Set", amt: "$44.99", status: "Pending", date: "Feb 5, 2026", color: "bg-[#E91E63]" },
                                    { id: "#ORD-2024-004", init: "MW", name: "Michael Wilson", prod: "Crochet Pouch", amt: "$39.99", status: "Completed", date: "Feb 5, 2026", color: "bg-[#D81B60]" },
                                    { id: "#ORD-2024-005", init: "OJ", name: "Olivia Johnson", prod: "Classic Earrings", amt: "$54.99", status: "Cancelled", date: "Feb 4, 2026", color: "bg-[#E91E63]" },
                                ].map((order, i) => (
                                    <tr key={i} className="bg-[#FAFAFA] hover:bg-gray-100 transition-colors group relative shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <td className="py-3.5 pl-4 font-bold text-gray-900 rounded-l-[12px]">{order.id}</td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-[26px] h-[26px] rounded-full ${order.color} text-white flex items-center justify-center font-bold text-[10px]`}>
                                                    {order.init}
                                                </div>
                                                <span className="font-bold text-gray-900">{order.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-gray-500 font-medium">{order.prod}</td>
                                        <td className="py-3.5 font-bold text-gray-900">{order.amt}</td>
                                        <td className="py-3.5 pl-1">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex items-center w-[90px]
                                                        ${order.status === "Completed" ? "bg-[#DCFCE7] text-[#16A34A]" : ""}
                                                        ${order.status === "Processing" ? "bg-[#DBEAFE] text-[#2563EB]" : ""}
                                                        ${order.status === "Pending" ? "bg-[#FEF3C7] text-[#D97706]" : ""}
                                                        ${order.status === "Cancelled" ? "bg-[#FEE2E2] text-[#DC2626]" : ""}
                                                    `}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0
                                                            ${order.status === "Completed" ? "bg-[#16A34A]" : ""}
                                                            ${order.status === "Processing" ? "bg-[#2563EB]" : ""}
                                                            ${order.status === "Pending" ? "bg-[#D97706]" : ""}
                                                            ${order.status === "Cancelled" ? "bg-[#DC2626]" : ""}
                                                        `}></span>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-gray-500 font-medium">{order.date}</td>
                                        <td className="py-3.5 text-center relative rounded-r-[12px] pr-2">
                                            <button
                                                onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                                                className={`p-1.5 rounded-lg transition-colors mx-auto flex items-center justify-center ${openDropdownId === order.id ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200'}`}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openDropdownId === order.id && (
                                                <div className="absolute right-12 top-10 bg-white rounded-xl p-1 z-50 w-[110px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] flex flex-col items-start text-left ml-auto border border-gray-100">
                                                    <div className="text-[10px] text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-pointer w-full font-bold px-2.5 py-2 transition-colors">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        Edit Product
                                                    </div>
                                                    <div className="text-[10px] text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-pointer w-full font-bold px-2.5 py-2 transition-colors">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        Delete
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bottom Row: Top Products & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Top Products</h3>
                        <button className="text-[#E91E63] text-[12px] font-bold tracking-wide hover:underline flex items-center transition-opacity hover:opacity-80">
                            View All <span className="ml-1 leading-none text-base">→</span>
                        </button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { name: "Rose Gold Bracelet", category: "Jewelry", sales: "245", color: "bg-[#DBA379]" },
                            { name: "Pearl Necklace", category: "Jewelry", sales: "198", color: "bg-[#BCC1C4]" },
                            { name: "Boho Beaded Set", category: "Accessories", sales: "156", color: "bg-[#678F7A]" },
                            { name: "Crochet Pouch", category: "Accessories", sales: "142", color: "bg-[#F0DA79]" },
                        ].map((prod, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-[52px] h-[52px] rounded-xl flex shrink-0 ${prod.color}`}></div>
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
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 sm:p-8">
                    <h3 className="text-[18px] font-bold text-gray-900 tracking-tight mb-7">Recent Activity</h3>
                    <div className="space-y-3.5 text-sm relative">
                        {[
                            { text: "New order received", time: "2 minutes ago", icon: <span className="text-[14px]">🎉</span> },
                            { text: "Order #1234 shipped", time: "15 minutes ago", icon: <Check size={14} className="text-white" strokeWidth={4} />, iconBg: "bg-[#22C55E]" },
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
                </div>
            </div>
        </div>
    );
}
