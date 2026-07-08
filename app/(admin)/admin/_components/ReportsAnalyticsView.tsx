import { useState, useEffect } from "react";
import { Download, TrendingUp } from "lucide-react";
import { Skeleton } from "./Skeleton";
import CategoryProgress from "./CategoryProgress";
import { exportToCSV } from "./exportUtils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getDashboard, getSalesOverview, getTopProductsAnalytics, getOrderStatusDist, exportAdminOrders, DashboardData } from "@/services/admin.service";

const PERIOD_MAP: Record<string, string> = {
    "Today": "7d",
    "Last 7 Days": "7d",
    "This Month": "30d",
    "This Year": "1y",
};

export default function ReportsAnalyticsView() {
    const [period, setPeriod] = useState("This Month");
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [salesOverview, setSalesOverview] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [orderStatus, setOrderStatus] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const [dash, sales, products, status] = await Promise.all([
                    getDashboard(),
                    getSalesOverview(),
                    getTopProductsAnalytics(),
                    getOrderStatusDist()
                ]);
                setDashboardData(dash);
                setSalesOverview(sales);
                setTopProducts(products);
                setOrderStatus(status);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [period]);

    const activeChartData = salesOverview.map(s => ({
        label: s.month || s.day || s.label,
        value: s.sales || s.revenue || 0
    }));

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await exportAdminOrders({});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "analytics_report.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export:", error);
        } finally {
            setIsExporting(false);
        }
    };

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
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm shrink-0 disabled:opacity-50"
                    >
                        <Download size={16} />
                        {isExporting ? "Exporting..." : "Export Report"}
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
                                {dashboardData
                                    ? `₹${dashboardData.totalRevenue.toLocaleString()}`
                                    : "—"}
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
                                         formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
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
                                topProducts.map((prod: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-foreground bg-muted shrink-0 shadow-sm overflow-hidden`}>
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-foreground truncate">
                                                {prod.productName}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                ID: {prod.productId}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-sm text-foreground">
                                                {prod.quantitySold}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground flex items-center justify-end">
                                                SOLD
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-base font-bold text-foreground mb-5">
                            Orders by Status
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
                                orderStatus.map((status: any, i: number) => {
                                    const totalOrders = orderStatus.reduce((acc, curr) => acc + (curr.count || 0), 0);
                                    const percent = totalOrders ? Math.round((status.count / totalOrders) * 100) : 0;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs font-bold text-foreground mb-1.5 capitalize">
                                                <span>{status._id || "Unknown"}</span>
                                                <span className="text-muted-foreground">
                                                    {percent}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-400 rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold w-12 text-right">
                                                    {status.count}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
