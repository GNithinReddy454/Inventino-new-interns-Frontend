import { useState, useEffect } from "react";
import { Download, TrendingUp } from "lucide-react";
import { Skeleton } from "./Skeleton";
import CategoryProgress from "./CategoryProgress";
import { exportToCSV } from "./exportUtils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getAnalytics, AnalyticsData } from "@/services/admin.service";

const PERIOD_MAP: Record<string, string> = {
    "Today": "7d",
    "Last 7 Days": "7d",
    "This Month": "30d",
    "This Year": "1y",
};

export default function ReportsAnalyticsView() {
    const [period, setPeriod] = useState("This Month");
    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const data = await getAnalytics(PERIOD_MAP[period] || "30d");
                setAnalyticsData(data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [period]);

    const regions = [
        { name: "North America", sales: 45, value: "$21,450" },
        { name: "Europe", sales: 30, value: "$14,300" },
        { name: "Asia", sales: 15, value: "$7,150" },
        { name: "Other", sales: 10, value: "$2,380" },
    ];

    const salesChartData: Record<string, { label: string; value: number }[]> = {
        "Today": [
            { label: "6am", value: 220 }, { label: "9am", value: 780 }, { label: "12pm", value: 1340 },
            { label: "3pm", value: 850 }, { label: "6pm", value: 1200 }, { label: "9pm", value: 640 },
        ],
        "Last 7 Days": [
            { label: "Mon", value: 3200 }, { label: "Tue", value: 5100 }, { label: "Wed", value: 2700 },
            { label: "Thu", value: 6400 }, { label: "Fri", value: 7100 }, { label: "Sat", value: 8200 }, { label: "Sun", value: 5500 },
        ],
        "This Month": [
            { label: "Wk 1", value: 12400 }, { label: "Wk 2", value: 18900 }, { label: "Wk 3", value: 15200 }, { label: "Wk 4", value: 21300 },
        ],
        "This Year": [
            { label: "Jan", value: 32000 }, { label: "Feb", value: 28000 }, { label: "Mar", value: 41000 },
            { label: "Apr", value: 36000 }, { label: "May", value: 45000 }, { label: "Jun", value: 52000 },
            { label: "Jul", value: 49000 }, { label: "Aug", value: 58000 }, { label: "Sep", value: 54000 },
            { label: "Oct", value: 61000 }, { label: "Nov", value: 67000 }, { label: "Dec", value: 72000 },
        ],
    };
    const activeChartData = salesChartData[period] || salesChartData["This Month"];

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Reports &amp; Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Detailed insights into your store&apos;s performance
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={period}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setPeriod(e.target.value)
                        }
                        className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-all cursor-pointer"
                    >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                        <option>This Year</option>
                    </select>
                    <button
                        onClick={() => exportToCSV(analyticsData ? [analyticsData] : [], "analytics_report.csv", [])}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                Sales Report
                            </h3>
                            <p className="text-3xl font-bold text-primary mt-2 flex items-center gap-3">
                                {analyticsData
                                    ? `₹${analyticsData.revenue.current.toLocaleString()}`
                                    : "—"}
                                {analyticsData && (
                                    <span className={`text-sm flex items-center px-2 py-1 rounded-lg ${analyticsData.revenue.trend >= 0
                                            ? "text-green-500 bg-green-50"
                                            : "text-red-500 bg-red-50"
                                        }`}>
                                        <TrendingUp size={14} className="mr-1" />
                                        {analyticsData.revenue.trend >= 0 ? "+" : ""}{analyticsData.revenue.trend}%
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {["Revenue", "Orders", "Visitors"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${tab === "Revenue"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-end justify-between gap-1 md:gap-2">
                            {[30, 70, 45, 60, 50, 80, 40, 75, 55, 65, 35, 85, 45, 60].map((h, i) => (
                                <Skeleton key={i} className="w-full h-full rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        cursor={{ fill: "#f9fafb", radius: 4 }}
                                        contentStyle={{ borderRadius: 10, border: "1px solid #f3f4f6", fontSize: 12 }}
                                        formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, "Sales"]}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-4 font-bold px-2">
                        <span>01 {period.split(" ")[1]?.substring(0, 3)}</span>
                        <span>07 {period.split(" ")[1]?.substring(0, 3)}</span>
                        <span>14 {period.split(" ")[1]?.substring(0, 3)}</span>
                        <span>21 {period.split(" ")[1]?.substring(0, 3)}</span>
                        <span>28 {period.split(" ")[1]?.substring(0, 3)}</span>
                    </div>
                </div>

                {/* Right side panels */}
                <div className="space-y-6">
                    {/* Top Selling Products */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-foreground">
                                Top Products
                            </h3>
                            <button className="text-xs text-primary font-bold hover:underline">
                                View Details
                            </button>
                        </div>
                        <div className="space-y-5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [
                                    { name: "Rose Gold Bracelet", category: "Jewelry", sales: "245", color: "bg-[#DBA379]" },
                                    { name: "Pearl Necklace", category: "Jewelry", sales: "198", color: "bg-[#BCC1C4]" },
                                    { name: "Boho Beaded Set", category: "Accessories", sales: "156", color: "bg-[#678F7A]" },
                                ].map((prod: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-foreground shrink-0 shadow-sm overflow-hidden ${prod.color}`}
                                        >
                                            {prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0] ? (
                                                <img
                                                    src={prod.imageUrl || prod.image || prod.images?.[0]?.url || prod.images?.[0]}
                                                    alt={prod.name || "Product"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <>#{i + 1}</>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-foreground truncate">
                                                {prod.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {prod.category}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-sm text-foreground">
                                                {prod.sales}
                                            </p>
                                            <p className="text-[10px] text-green-500 flex items-center justify-end">
                                                <TrendingUp size={10} className="mr-0.5" /> +5%
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sales by Region */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-base font-bold text-foreground mb-5">
                            Sales by Region
                        </h3>
                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-8" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-2 flex-1" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                regions.map((region, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                                            <span>{region.name}</span>
                                            <span className="text-muted-foreground">
                                                {region.sales}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-400 rounded-full"
                                                    style={{ width: `${region.sales}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-12 text-right">
                                                {region.value}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Performance */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground mb-6">
                    Category Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full mb-2" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div>
                                <CategoryProgress
                                    label="Jewelry"
                                    percent={65}
                                    color="bg-primary"
                                />
                                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                    <span>320 items sold</span>
                                    <span className="font-bold text-green-500">+12%</span>
                                </div>
                            </div>
                            <div>
                                <CategoryProgress
                                    label="Bags & Purses"
                                    percent={80}
                                    color="bg-orange-500"
                                />
                                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                    <span>450 items sold</span>
                                    <span className="font-bold text-green-500">+24%</span>
                                </div>
                            </div>
                            <div>
                                <CategoryProgress
                                    label="Home Decor"
                                    percent={30}
                                    color="bg-emerald-500"
                                />
                                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                    <span>115 items sold</span>
                                    <span className="font-bold text-red-500">-5%</span>
                                </div>
                            </div>
                            <div>
                                <CategoryProgress
                                    label="Accessories"
                                    percent={45}
                                    color="bg-blue-500"
                                />
                                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                    <span>210 items sold</span>
                                    <span className="font-bold text-green-500">+8%</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
