"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { SkeletonTable } from "./Skeleton";

// --- Mock orders by ID ---
const MOCK_ORDERS_BY_ID: Record<string, any> = {
    "order-1": {
        _id: "order-1",
        customer: "John Doe",
        email: "john.doe@example.com",
        products: [
            { name: "Gold Necklace", quantity: 1, price: 1250 },
            { name: "Silver Earrings", quantity: 2, price: 350 },
        ],
        totalAmount: 1950,
        status: "Delivered",
        trackingNumber: "TRK123456789",
        trackingUpdates: [
            { date: "2026-03-10T10:00:00Z", status: "Order Placed", location: "Online" },
            { date: "2026-03-11T14:30:00Z", status: "Shipped", location: "Mumbai Hub" },
            { date: "2026-03-13T09:15:00Z", status: "Out for Delivery", location: "Local Facility" },
            { date: "2026-03-13T16:45:00Z", status: "Delivered", location: "Customer Address" },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    "order-2": {
        _id: "order-2",
        customer: "Sarah Miller",
        email: "sarah.m@example.com",
        products: [
            { name: "Silver Earrings", quantity: 2, price: 350 },
        ],
        totalAmount: 700,
        status: "Shipped",
        trackingNumber: "TRK987654321",
        trackingUpdates: [
            { date: "2026-03-12T09:30:00Z", status: "Order Placed", location: "Online" },
            { date: "2026-03-13T11:20:00Z", status: "Shipped", location: "Delhi Hub" },
            { date: "2026-03-14T08:45:00Z", status: "Out for Delivery", location: "Local Facility" },
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    "order-3": {
        _id: "order-3",
        customer: "Emily Brown",
        email: "emily.b@example.com",
        products: [
            { name: "Diamond Ring", quantity: 1, price: 1500 },
            { name: "Pearl Bracelet", quantity: 1, price: 450 },
        ],
        totalAmount: 1950,
        status: "Processing",
        trackingNumber: "",
        trackingUpdates: [
            { date: "2026-03-14T15:10:00Z", status: "Order Placed", location: "Online" },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
};

interface OrderDetailsViewProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsView({ orderId, onBack }: OrderDetailsViewProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call; replace with real fetch when backend is ready
        const timer = setTimeout(() => {
            const foundOrder = MOCK_ORDERS_BY_ID[orderId] || {
                ...MOCK_ORDERS_BY_ID["order-1"],
                _id: orderId,
                customer: "Unknown Customer",
                email: "unknown@example.com",
            };
            setOrder(foundOrder);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [orderId]);

    const handleDownloadInvoice = () => {
        window.open(`/api/invoice/${orderId}`, "_blank");
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={4} /></div>;
    if (!order) return <div className="p-6 text-center text-muted-foreground">Order not found.</div>;

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-muted rounded-full"><ArrowLeft size={20} /></button>
                    <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
                </div>
                <button onClick={handleDownloadInvoice} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2"><Download size={16} /> Invoice</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-xs text-muted-foreground uppercase mb-1">Status</p><p className="text-lg font-semibold">{order.status}</p></div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-xs text-muted-foreground uppercase mb-1">Tracking Number</p><p className="text-lg font-mono">{order.trackingNumber || "—"}</p></div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><p className="text-xs text-muted-foreground uppercase mb-1">Order Date</p><p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p></div>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5"><h2 className="text-lg font-semibold mb-3">Customer</h2><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b">Products</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Quantity</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-left">Total</th></tr></thead>
                        <tbody className="divide-y divide-border">
                            {order.products.map((product: any, idx: number) => (
                                <tr key={idx}><td className="px-4 py-3 font-medium">{product.name}</td><td className="px-4 py-3">{product.quantity}</td><td className="px-4 py-3">₹{product.price.toLocaleString()}</td><td className="px-4 py-3 font-semibold">₹{(product.quantity * product.price).toLocaleString()}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t text-right font-bold text-lg">Total: ₹{order.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Tracking Updates</h2>
                <div className="space-y-4">
                    {order.trackingUpdates.map((update: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                            <div className="relative"><div className="w-4 h-4 rounded-full bg-primary mt-1"></div>{idx !== order.trackingUpdates.length - 1 && <div className="absolute top-5 left-2 w-0.5 h-12 bg-gray-200 -translate-x-1/2"></div>}</div>
                            <div className="flex-1 pb-4"><p className="font-semibold">{update.status}</p><p className="text-sm text-muted-foreground">{new Date(update.date).toLocaleString()} • {update.location}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}