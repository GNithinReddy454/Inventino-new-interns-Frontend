"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { SkeletonTable } from "./Skeleton";

// --- Mock data for development ---
const MOCK_CUSTOMER = {
    _id: "mock-customer-1",
    name: "John Doe",
    email: "john.doe@example.com",
    totalOrders: 8,
    totalSpent: 3450,
    customerType: "VIP",
};

const MOCK_ORDERS = [
    { _id: "order-1", products: [{ name: "Gold Necklace", quantity: 1, price: 1250 }], createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "Delivered", trackingNumber: "TRK123456789", totalAmount: 1250 },
    { _id: "order-2", products: [{ name: "Silver Earrings", quantity: 2, price: 350 }], createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), status: "Shipped", trackingNumber: "TRK987654321", totalAmount: 700 },
    { _id: "order-3", products: [{ name: "Diamond Ring", quantity: 1, price: 1500 }, { name: "Pearl Bracelet", quantity: 1, price: 450 }], createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: "Processing", trackingNumber: "", totalAmount: 1950 },
];

interface CustomerProfileViewProps {
    customerId: string;
    onBack: () => void;
    onViewOrder?: (orderId: string) => void;
}

export default function CustomerProfileView({ customerId, onBack, onViewOrder }: CustomerProfileViewProps) {
    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call; when real API is ready, replace with fetch
        const timer = setTimeout(() => {
            setCustomer({ ...MOCK_CUSTOMER, _id: customerId });
            setOrders(MOCK_ORDERS);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [customerId]);

    const handleDownloadInvoice = (orderId: string) => {
        alert(`Invoice download for order ${orderId} – backend not ready`);
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={5} /></div>;
    if (!customer) return <div className="p-6 text-center text-muted-foreground">Customer not found.</div>;

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-muted rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold">Customer Profile</h1>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p><p className="text-lg font-semibold mt-1">{customer.name}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p><p className="text-lg font-semibold mt-1">{customer.email}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p><p className="text-lg font-semibold mt-1">{customer.totalOrders}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p><p className="text-lg font-semibold mt-1">₹{customer.totalSpent?.toLocaleString() ?? 0}</p></div>
                </div>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b">Order History</h2>
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No orders found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                                <tr><th className="px-4 py-3 text-left">Order ID</th><th className="px-4 py-3 text-left">Products</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Tracking</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs">{order._id?.slice(-8).toUpperCase()}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => onViewOrder?.(order._id)} className="text-primary hover:underline font-medium text-left">
                                                {order.products?.[0]?.name || "View Order"}{order.products && order.products.length > 1 && ` +${order.products.length - 1} more`}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === "Delivered" ? "bg-green-100 text-green-700" : order.status === "Shipped" ? "bg-blue-100 text-blue-700" : order.status === "Processing" ? "bg-orange-100 text-orange-700" : order.status === "Pending" ? "bg-purple-100 text-purple-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                                                {order.status || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.trackingNumber || "—"}</td>
                                        <td className="px-4 py-3 font-semibold">₹{order.totalAmount?.toLocaleString() ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleDownloadInvoice(order._id)} className="text-primary hover:underline inline-flex items-center gap-1 text-xs font-medium"><Download size={14} /> Invoice</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}