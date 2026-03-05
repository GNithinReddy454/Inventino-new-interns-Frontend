import { useState, useEffect } from "react";
import { Download, TrendingUp } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { TOP_PRODUCTS } from "../_data/mockData";
import CategoryProgress from "./CategoryProgress";
import { exportToCSV } from "./exportUtils";

export default function ReportsAnalyticsView() {
    const [period, setPeriod] = useState("This Month");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const regions = [
        { name: "North America", sales: 45, value: "$21,450" },
        { name: "Europe", sales: 30, value: "$14,300" },
        { name: "Asia", sales: 15, value: "$7,150" },
        { name: "Other", sales: 10, value: "$2,380" },
    ];

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
                        onClick={() => exportToCSV(TOP_PRODUCTS, "top_products_report.csv", ["color"])}
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
                                $45,280.00
                                <span className="text-sm text-green-500 flex items-center bg-green-50 px-2 py-1 rounded-lg">
                                    <TrendingUp size={14} className="mr-1" /> +12.5%
                                </span>
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
                            {/* Predefined heights for skeleton bars to avoid Math.random() hydration issues */}
                            {[30, 70, 45, 60, 50, 80, 40, 75, 55, 65, 35, 85, 45, 60].map((h, i) => (
                                <Skeleton key={i} className="w-full h-full rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-end justify-between gap-1 md:gap-2">
                            {[40, 65, 45, 80, 55, 90, 75, 100, 85, 120, 95, 110, 80, 95].map(
                                (h, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-500 transition-colors cursor-pointer group relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded font-bold transition-opacity whitespace-nowrap z-10">
                                            ${(h * 125).toLocaleString()}
                                        </div>
                                    </div>
                                ),
                            )}
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
                                TOP_PRODUCTS.slice(0, 3).map((prod: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-foreground shrink-0 shadow-sm ${prod.color}`}
                                        >
                                            #{i + 1}
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
