"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import { getAdminCustomerById, getAdminCustomerOrders, updateAdminCustomer, AdminCustomerDetail } from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

// Mock data for development
const MOCK_CUSTOMER: AdminCustomerDetail = {
    _id: "mock-customer-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    registeredAt: "2025-01-15T10:00:00.000Z",
    active: true,
    totalOrders: 8,
    totalSpent: 3450,
    customerType: "VIP",
    addresses: {
        billing: {
            line1: "123 Main St",
            city: "Mumbai",
            state: "Maharashtra",
            postalCode: "400001",
            country: "India"
        },
        shipping: {
            line1: "123 Main St",
            city: "Mumbai",
            state: "Maharashtra",
            postalCode: "400001",
            country: "India"
        }
    }
};

const MOCK_ORDERS = [
    { _id: "order-1", orderNumber: "ORD-001", date: "2026-03-10T10:00:00.000Z", status: "Delivered", total: 1250, paymentMethod: "Credit Card" },
    { _id: "order-2", orderNumber: "ORD-002", date: "2026-03-05T14:30:00.000Z", status: "Shipped", total: 700, paymentMethod: "UPI" },
    { _id: "order-3", orderNumber: "ORD-003", date: "2026-02-28T09:15:00.000Z", status: "Processing", total: 1950, paymentMethod: "COD" },
];

interface CustomerProfileViewProps {
    customerId: string;
    onBack: () => void;
    onViewOrder?: (orderId: string) => void;
}

export default function CustomerProfileView({ customerId, onBack, onViewOrder }: CustomerProfileViewProps) {
    const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingType, setEditingType] = useState(false);
    const [newType, setNewType] = useState("");
    const [isActive, setIsActive] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const [customerData, ordersData] = await Promise.all([
                getAdminCustomerById(customerId),
                getAdminCustomerOrders(customerId),
            ]);

            if (customerData) {
                setCustomer(customerData);
                // Ensure active status is boolean (fallback to true if undefined)
                setIsActive(customerData.active ?? true);
            } else {
                // Fallback to mock data
                setCustomer({ ...MOCK_CUSTOMER, _id: customerId });
                setIsActive(MOCK_CUSTOMER.active); // MOCK_CUSTOMER.active is true (boolean)
            }

            if (ordersData && Array.isArray(ordersData.data) && ordersData.data.length > 0) {
                setOrders(ordersData.data);
            } else {
                setOrders(MOCK_ORDERS);
            }
        } catch (err) {
            console.error("Failed to fetch customer profile:", err);
            // Fallback to mock data on error
            setCustomer({ ...MOCK_CUSTOMER, _id: customerId });
            setOrders(MOCK_ORDERS);
            setIsActive(MOCK_CUSTOMER.active); // boolean
            showToast("Error", "Could not load customer details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTypeUpdate = async () => {
        if (!customer) return;
        try {
            const result = await updateAdminCustomer(customerId, { customerType: newType });
            if (result) {
                setCustomer(prev => prev ? { ...prev, customerType: newType } : prev);
                showToast("Success", "Customer type updated", "success");
            }
            setEditingType(false);
        } catch (err) {
            showToast("Error", "Failed to update customer type", "error");
        }
    };

    const handleToggleActive = async () => {
        if (!customer) return;
        try {
            const newActive = !isActive;
            const result = await updateAdminCustomer(customerId, { active: newActive });
            if (result) {
                setIsActive(newActive);
                showToast("Success", newActive ? "Customer activated" : "Customer deactivated", "success");
            }
        } catch (err) {
            showToast("Error", "Failed to update account status", "error");
        }
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={5} /></div>;
    if (!customer) return <div className="p-6 text-center text-muted-foreground">Customer not found.</div>;

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft size={20} />
                </button>
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
                        <p className="text-lg font-semibold mt-1">{customer.registeredAt ? new Date(customer.registeredAt).toLocaleDateString() : "—"}</p>
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
                                >
                                    <option value="VIP">VIP</option>
                                    <option value="Regular">Regular</option>
                                    <option value="New">New</option>
                                </select>
                                <button onClick={handleTypeUpdate} className="text-primary"><Save size={16} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    customer.customerType === "VIP" ? "bg-yellow-100 text-yellow-700" :
                                    customer.customerType === "Regular" ? "bg-blue-100 text-blue-700" :
                                    "bg-pink-100 text-pink-600"
                                }`}>
                                    {customer.customerType}
                                </span>
                                <button onClick={() => { setNewType(customer.customerType); setEditingType(true); }} className="text-xs text-primary underline">Edit</button>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                {isActive ? "Active" : "Inactive"}
                            </span>
                            <button onClick={handleToggleActive} className="text-xs text-primary underline">
                                {isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>

                {customer.addresses && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Billing Address</p>
                            <p className="text-sm">{customer.addresses.billing.line1}</p>
                            <p className="text-sm">{customer.addresses.billing.city}, {customer.addresses.billing.state} {customer.addresses.billing.postalCode}</p>
                            <p className="text-sm">{customer.addresses.billing.country}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Shipping Address</p>
                            <p className="text-sm">{customer.addresses.shipping.line1}</p>
                            <p className="text-sm">{customer.addresses.shipping.city}, {customer.addresses.shipping.state} {customer.addresses.shipping.postalCode}</p>
                            <p className="text-sm">{customer.addresses.shipping.country}</p>
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
                                        <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                                        <td className="px-4 py-3">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                                order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                                                order.status === "Processing" ? "bg-orange-100 text-orange-700" :
                                                order.status === "Pending" ? "bg-purple-100 text-purple-700" :
                                                order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">₹{order.total.toLocaleString()}</td>
                                        <td className="px-4 py-3">{order.paymentMethod}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => onViewOrder?.(order._id)} className="text-primary hover:underline text-xs">View</button>
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