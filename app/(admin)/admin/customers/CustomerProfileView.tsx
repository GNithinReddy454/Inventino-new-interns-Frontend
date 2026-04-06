"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Save, Copy } from "lucide-react";
import { SkeletonTable } from "../_components/Skeleton";
import {
    getAdminCustomerById,
    getAdminCustomerOrders,
    updateAdminCustomer,
    AdminCustomerDetail,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";
import { useRouter } from "next/navigation";

interface ApiCustomerDetail {
    _id?: string;
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isEmailVerified?: boolean;
    totalOrders?: number;
    totalSpent?: number;
    customerType?: string;
    registeredAt?: string;
    active?: boolean;
    customerId?: string;
    addresses?: any;
}

interface ApiOrder {
    _id?: string;
    orderNumber?: string;
    status?: string;
    total?: number;
    paymentMethod?: string;
    date?: string;
    createdAt?: string;
    pricing?: {
        total?: number;
    };
    payment?: {
        method?: string;
    };
}

interface CustomerProfileViewProps {
    customerId: string; // this is userId
    onBack: () => void;
    onViewOrder?: (orderId: string) => void;
}

export default function CustomerProfileView({
    customerId,
    onBack,
    onViewOrder,
}: CustomerProfileViewProps) {
    const router = useRouter();
    const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingType, setEditingType] = useState(false);
    const [newType, setNewType] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { showToast } = useToast();

    const transformApiCustomerDetail = useCallback(
        (apiCustomer: ApiCustomerDetail, userId: string): AdminCustomerDetail => {
            let customerType = apiCustomer.customerType || "Regular";

            if (!apiCustomer.customerType) {
                if ((apiCustomer.totalOrders ?? 0) > 20 || (apiCustomer.totalSpent ?? 0) > 10000) {
                    customerType = "VIP";
                } else if ((apiCustomer.totalOrders ?? 0) < 2) {
                    customerType = "New";
                }
            }

            return {
                _id: apiCustomer._id || "",
                name: apiCustomer.name || "Unknown",
                email: apiCustomer.email || "—",
                phone: apiCustomer.phone || "—",
                totalOrders: Number(apiCustomer.totalOrders || 0),
                totalSpent: Number(apiCustomer.totalSpent || 0),
                customerType,
                customerId: apiCustomer.userId || apiCustomer.customerId || userId,
                registeredAt: apiCustomer.registeredAt || "",
                active: apiCustomer.active ?? true,
                addresses: apiCustomer.addresses,
            } as AdminCustomerDetail;
        },
        []
    );

    const transformApiOrder = useCallback((apiOrder: ApiOrder, index: number) => {
        return {
            _id: apiOrder._id || `order-${index}`,
            orderNumber: apiOrder.orderNumber || `ORD-${index + 1}`,
            date: apiOrder.date || apiOrder.createdAt || new Date().toISOString(),
            status: apiOrder.status || "created",
            total: Number(apiOrder.total ?? apiOrder.pricing?.total ?? 0),
            paymentMethod: apiOrder.paymentMethod || apiOrder.payment?.method || "—",
        };
    }, []);

    const fetchCustomerData = useCallback(async () => {
        if (!customerId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            console.log("Fetching customer details with userId:", customerId);

            const [customerData, ordersData] = await Promise.all([
                getAdminCustomerById(customerId),
                getAdminCustomerOrders(customerId),
            ]);

            console.log("Customer details response:", customerData);
            console.log("Customer orders response:", ordersData);

            if (!customerData) {
                throw new Error("Customer details not found");
            }

            const apiCustomer = (customerData as any)?.data ?? customerData;
            const transformedCustomer = transformApiCustomerDetail(apiCustomer, customerId);

            setCustomer(transformedCustomer);
            setNewType(transformedCustomer.customerType || "Regular");
            setIsActive(transformedCustomer.active ?? true);

            const rawOrders = Array.isArray((ordersData as any)?.data)
                ? (ordersData as any).data
                : Array.isArray(ordersData)
                ? ordersData
                : [];

            const transformedOrders = rawOrders.map((order: ApiOrder, index: number) =>
                transformApiOrder(order, index)
            );

            setOrders(transformedOrders);
        } catch (err) {
            console.error("Failed to fetch customer profile:", err);
            setCustomer(null);
            setOrders([]);
            showToast("Error", "Could not load customer details", "error");
        } finally {
            setLoading(false);
        }
    }, [customerId, showToast, transformApiCustomerDetail, transformApiOrder]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    const handleTypeUpdate = async () => {
        if (!customer) return;

        setUpdating(true);
        try {
            showToast("Info", "Customer type update will be available soon", "info");
            setEditingType(false);
        } catch (err: any) {
            console.error("Failed to update customer type:", err);
            showToast("Error", err.message || "Failed to update customer type", "error");
        } finally {
            setUpdating(false);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copied", `${type} copied to clipboard`, "success");
    };

    const handleViewOrder = (orderId: string) => {
        if (!orderId) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        if (onViewOrder) {
            onViewOrder(orderId);
        } else {
            router.push(`/admin/orders/${orderId}`);
        }
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={5} /></div>;

    if (!customer) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Customer not found.</p>
                <button onClick={onBack} className="mt-4 text-primary hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {customer.name}
                        <button
                            onClick={() => copyToClipboard(customer.name, "Customer Name")}
                            className="p-1 hover:bg-muted rounded"
                            title="Copy name"
                        >
                            <Copy size={14} className="text-muted-foreground" />
                        </button>
                    </h1>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {customer.customerId && (
                            <p className="flex items-center gap-1">
                                <span className="font-semibold">User ID:</span> {customer.customerId}
                                <button
                                    onClick={() => copyToClipboard(customer.customerId!, "User ID")}
                                    className="p-1 hover:bg-muted rounded"
                                    title="Copy user ID"
                                >
                                    <Copy size={10} className="text-muted-foreground" />
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                        <p className="text-lg font-semibold mt-1">{customer.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="text-lg font-semibold mt-1">{customer.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                        <p className="text-lg font-semibold mt-1">{customer.phone || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Registered</p>
                        <p className="text-lg font-semibold mt-1">
                            {customer.registeredAt ? new Date(customer.registeredAt).toLocaleDateString() : "—"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p>
                        <p className="text-lg font-semibold mt-1">{customer.totalOrders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
                        <p className="text-lg font-semibold mt-1">₹{customer.totalSpent?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer Type</p>
                        {editingType ? (
                            <div className="flex items-center gap-2 mt-1">
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="p-1 border rounded text-sm"
                                    disabled={updating}
                                >
                                    <option value="VIP">VIP</option>
                                    <option value="Regular">Regular</option>
                                    <option value="New">New</option>
                                </select>
                                <button
                                    onClick={handleTypeUpdate}
                                    className="text-primary hover:text-primary-dark transition-colors"
                                    disabled={updating}
                                >
                                    {updating ? "..." : <Save size={16} />}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingType(false);
                                        setNewType(customer.customerType || "Regular");
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground ml-1"
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        customer.customerType === "VIP"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : customer.customerType === "Regular"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-pink-100 text-pink-600"
                                    }`}
                                >
                                    {customer.customerType}
                                </span>
                                <button
                                    onClick={() => {
                                        setNewType(customer.customerType || "Regular");
                                        setEditingType(true);
                                    }}
                                    className="text-xs text-primary underline hover:no-underline"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {customer.addresses && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Billing Address</p>
                            <p className="text-sm">{customer.addresses?.billing?.line1 || "—"}</p>
                            <p className="text-sm">
                                {customer.addresses?.billing?.city || "—"},{" "}
                                {customer.addresses?.billing?.state || "—"}{" "}
                                {customer.addresses?.billing?.postalCode || ""}
                            </p>
                            <p className="text-sm">{customer.addresses?.billing?.country || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Shipping Address</p>
                            <p className="text-sm">{customer.addresses?.shipping?.line1 || "—"}</p>
                            <p className="text-sm">
                                {customer.addresses?.shipping?.city || "—"},{" "}
                                {customer.addresses?.shipping?.state || "—"}{" "}
                                {customer.addresses?.shipping?.postalCode || ""}
                            </p>
                            <p className="text-sm">{customer.addresses?.shipping?.country || "—"}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b">Order History</h2>
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No orders found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Order ID</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Total</th>
                                    <th className="px-4 py-3 text-left">Payment Method</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-bold text-primary">
                                                    {order.orderNumber}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {order._id ? `${order._id.substring(0, 8)}...` : "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.date ? new Date(order.date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    order.status?.toLowerCase() === "delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status?.toLowerCase() === "shipped"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : order.status?.toLowerCase() === "processing" ||
                                                          order.status?.toLowerCase() === "packed"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : order.status?.toLowerCase() === "pending" ||
                                                          order.status?.toLowerCase() === "created"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : order.status?.toLowerCase() === "cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            ₹{Number(order.total || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">{order.paymentMethod}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewOrder(order._id)}
                                                className="text-primary hover:underline text-xs"
                                            >
                                                View
                                            </button>
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