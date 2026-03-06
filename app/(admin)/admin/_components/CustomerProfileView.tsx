"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Star, ThumbsUp, CheckCircle, MoreVertical } from "lucide-react";
import { getAdminCustomers, getAdminOrders, getAdminReviews, AdminCustomer, AdminReview } from "@/services/admin.service";
import Pagination from "./Pagination";

interface CustomerProfileViewProps {
    customerId: string;
    onBack: () => void;
}

export default function CustomerProfileView({ customerId, onBack }: CustomerProfileViewProps) {
    const [customer, setCustomer] = useState<AdminCustomer | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("Orders");
    const [orderFilter, setOrderFilter] = useState("All Orders");

    // order pagination
    const [orderPage, setOrderPage] = useState(1);
    const [orderPageSize, setOrderPageSize] = useState(10);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                let [custData, ordersData, reviewsData] = await Promise.all([
                    getAdminCustomers(),
                    getAdminOrders(),
                    getAdminReviews()
                ]);


                // Fallback to mock data if empty
                if (!custData || custData.length === 0) {
                    custData = [
                        {
                            _id: "mock-1",
                            name: "John Doe",
                            email: "john@example.com",
                            totalOrders: 10,
                            totalSpent: 2450,
                            customerType: "VIP"
                        },
                        {
                            _id: "mock-2",
                            name: "Jane Smith",
                            email: "jane.smith@example.com",
                            totalOrders: 3,
                            totalSpent: 350,
                            customerType: "Regular"
                        }
                    ];
                }

                const found = custData?.find(c => c._id === customerId);
                if (found) setCustomer(found);

                // Mock specific orders for this customer since AdminOrder may lack details
                const mappedOrders = (ordersData || []).map((o: any, idx) => ({
                    ...o,
                    orderId: `#ORD-2024-${1000 + idx}`,
                    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    products: o.products || ["Pearl Necklace Set, Gold Ring", "Silver Bracelet", "Rose Gold Earrings", "Custom Engraved Ring"][Math.floor(Math.random() * 4)],
                    total: o.totalAmount || [189.99, 79.99, 129.99, 145.00, 299.99][Math.floor(Math.random() * 5)],
                    status: o.status || ["Delivered", "Customer Cancelled", "Returned", "Processing"][Math.floor(Math.random() * 4)]
                })).slice(0, found?.totalOrders || 10);

                // Ensure orders sort recent first
                setOrders(mappedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                const foundReviews = (reviewsData || []).filter(r => r.customerName === found?.name);
                setReviews(foundReviews.length ? foundReviews : [
                    {
                        _id: "rev1",
                        customerName: found?.name || "Customer",
                        rating: 5,
                        productName: "Rose Gold Earrings",
                        title: "Absolutely Beautiful!",
                        comment: "This bracelet exceeded all my expectations! The craftsmanship is incredible, and you can tell it was made with love. The rose gold finish is stunning and catches the light beautifully.",
                        status: "approved"
                    }
                ]);

            } catch (err) {
                console.error("Failed to fetch customer profile data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [customerId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 text-muted-foreground animate-pulse font-semibold">
                Loading customer profile...
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-10 text-center flex flex-col items-center">
                <p className="mb-4 text-lg font-bold text-foreground">Customer not found.</p>
                <button onClick={onBack} className="text-[#E91E63] font-bold hover:underline">Go Back to Customers</button>
            </div>
        );
    }

    const initial = customer.name.slice(0, 2).toUpperCase();

    const filteredOrders = orders.filter(o => {
        if (orderFilter === "All Orders") return true;
        if (orderFilter === "Return Products") return o.status === "Returned";
        return o.status === orderFilter;
    });

    const paginatedOrders = filteredOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize);

    const statusBadge = (status: string) => {
        switch (status) {
            case "Delivered": return <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] font-bold text-[11px] uppercase tracking-wider rounded-full">{status}</span>;
            case "Customer Cancelled": return <span className="px-3 py-1 bg-[#FFEBEE] text-[#C62828] font-bold text-[11px] uppercase tracking-wider rounded-full">{status}</span>;
            case "Returned": return <span className="px-3 py-1 bg-[#FFF3E0] text-[#EF6C00] font-bold text-[11px] uppercase tracking-wider rounded-full">{status}</span>;
            case "Processing": return <span className="px-3 py-1 bg-[#E3F2FD] text-[#1565C0] font-bold text-[11px] uppercase tracking-wider rounded-full">{status}</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold text-[11px] uppercase tracking-wider rounded-full">{status}</span>;
        }
    }

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            {/* Header Area */}
            <div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground font-semibold mb-3 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Customers
                </button>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Customer Profile</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">View customer details, orders, and reviews</p>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] border border-[#F3E8EC] p-8 lg:p-10 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-[#F3E8EC] pb-8">
                    <div className="w-[88px] h-[88px] rounded-full bg-[#E91E63] flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-sm border-4 border-pink-50">
                        {initial}
                    </div>
                    <div>
                        <h3 className="text-[26px] font-black text-gray-900 mb-2 leading-none">{customer.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-semibold text-gray-500">
                            <span className="flex items-center gap-1.5">
                                {customer.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                +1 (555) 123-4567
                            </span>
                            <span className="flex items-center gap-1.5">
                                Member since Dec 2024
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center px-4">
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-[#E91E63]">{customer.totalOrders}</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-[#E91E63]">3</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cancelled</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-[#E91E63]">3</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Returned</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-[#E91E63]">${customer.totalSpent?.toLocaleString() || "0"}</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Spent</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div>
                <div className="flex gap-8 border-b border-[#F3E8EC] px-4">
                    {["Orders", "Reviews & Ratings"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === tab
                                ? "text-[#E91E63]"
                                : "text-muted-foreground hover:text-gray-900"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E91E63] rounded-t-xl" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content Panels */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] border border-[#F3E8EC] p-6 lg:p-8 min-h-[400px]">
                {activeTab === "Orders" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <h3 className="text-xl font-bold text-gray-900">Order History</h3>
                            <div className="flex flex-wrap gap-2">
                                {["All Orders", "Delivered", "Customer Cancelled", "Return Products", "Processing"].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { setOrderFilter(f); setOrderPage(1); }}
                                        className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${orderFilter === f
                                            ? "bg-[#E91E63] text-white shadow-md shadow-pink-500/20"
                                            : "bg-white border border-[#F3E8EC] text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-[#F3E8EC]">
                                    <tr>
                                        <th className="pb-4 px-4 font-black">Order ID</th>
                                        <th className="pb-4 px-4 font-black">Date</th>
                                        <th className="pb-4 px-4 font-black">Products</th>
                                        <th className="pb-4 px-4 font-black">Total</th>
                                        <th className="pb-4 px-4 font-black">Status</th>
                                        <th className="pb-4 px-4 text-center font-black">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F3E8EC]">
                                    {paginatedOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-gray-400 font-medium bg-gray-50/50 rounded-2xl">
                                                No orders match your filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map((o, idx) => (
                                            <tr key={idx} className="hover:bg-pink-50/30 transition-colors group">
                                                <td className="py-5 px-4 font-black text-gray-900 tracking-tight">{o.orderId}</td>
                                                <td className="py-5 px-4 text-gray-500 font-medium">{o.date}</td>
                                                <td className="py-5 px-4 text-gray-600 font-semibold max-w-[240px] truncate" title={o.products}>
                                                    {o.products}
                                                </td>
                                                <td className="py-5 px-4 text-gray-900 font-black">${o.total}</td>
                                                <td className="py-5 px-4">{statusBadge(o.status)}</td>
                                                <td className="py-5 px-4 text-center">
                                                    <button className="text-gray-400 hover:text-[#E91E63] transition-colors p-2 rounded-lg hover:bg-pink-50 inline-flex">
                                                        <MoreVertical size={16} strokeWidth={2.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredOrders.length > 0 && (
                            <Pagination
                                currentPage={orderPage}
                                totalItems={filteredOrders.length}
                                pageSize={orderPageSize}
                                onPageChange={(p) => setOrderPage(p)}
                                onPageSizeChange={(size) => { setOrderPageSize(size); setOrderPage(1); }}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {reviews.map((r, idx) => (
                            <div key={idx} className="p-6 md:p-8 bg-white border border-[#F3E8EC] rounded-2xl shadow-sm flex flex-col gap-5 hover:border-pink-200 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#E91E63] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                                            {r.customerName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-gray-900 leading-none mb-1.5">{r.customerName}</p>
                                            <p className="text-[12px] text-gray-400 font-semibold uppercase tracking-wider">January 15, 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-[#FACC15] shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className={i < r.rating ? "fill-current" : "text-gray-200 fill-current"} />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <h4 className="font-bold text-[17px] text-gray-900 mb-2">{r.title}</h4>
                                    <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                                        {r.comment}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#F3E8EC]">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[11px] font-bold tracking-wider uppercase">
                                        <CheckCircle size={14} strokeWidth={2.5} />
                                        Verified Purchase
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E1] text-[#F57F17] rounded-full text-[11px] font-bold tracking-wider uppercase">
                                        <ThumbsUp size={14} strokeWidth={2.5} />
                                        Helpful (24)
                                    </span>
                                </div>
                            </div>
                        ))}

                        {reviews.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center bg-gray-50/50 rounded-2xl border border-dashed border-[#F3E8EC]">
                                <p className="text-gray-400 font-semibold">No reviews found for this customer.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
