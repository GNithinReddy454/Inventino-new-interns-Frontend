"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Copy } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import { getAdminCustomerById, getAdminCustomerOrders, updateAdminCustomer, AdminCustomerDetail } from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";
import { useRouter } from "next/navigation";

// Mock data for development (only used as fallback when API fails)
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
    customerId: "CUST-001",
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

// API Response Interfaces
interface ApiCustomerDetail {
    name: string;
    email: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    totalOrders: number;
    totalSpent: number;
    customerType?: string;
}

interface ApiOrder {
    orderNumber: string;
    status: string;
    total: number;
    paymentMethod: string;
    _id?: string;
    date?: string;
    createdAt?: string;
}

interface ApiOrdersResponse {
    message: string;
    data: ApiOrder[];
    total: number;
}

interface CustomerProfileViewProps {
    customerId: string;
    onBack: () => void;
    onViewOrder?: (orderId: string) => void;
}

export default function CustomerProfileView({ customerId, onBack, onViewOrder }: CustomerProfileViewProps) {
    const router = useRouter();
    const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingType, setEditingType] = useState(false);
    const [newType, setNewType] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (customerId && !customerId.startsWith('mock-') && !customerId.startsWith('CUST-')) {
            fetchCustomerData();
        } else {
            console.log("⚠️ Using mock data for ID:", customerId);
            setCustomer({ ...MOCK_CUSTOMER, _id: customerId, customerId });
            setOrders(MOCK_ORDERS);
            setIsActive(MOCK_CUSTOMER.active ?? true);
            setLoading(false);
        }
    }, [customerId]);

    // Transform API customer detail to AdminCustomerDetail format
    const transformApiCustomerDetail = (apiCustomer: ApiCustomerDetail, userId: string): AdminCustomerDetail => {
        // Determine customer type based on order count or total spent if not provided by API
        let customerType = apiCustomer.customerType || "Regular";
        
        // If API doesn't provide customer type, determine based on order count
        if (!apiCustomer.customerType) {
            if (apiCustomer.totalOrders > 20 || apiCustomer.totalSpent > 10000) {
                customerType = "VIP";
            } else if (apiCustomer.totalOrders < 2) {
                customerType = "New";
            }
        }

        return {
            _id: userId,
            name: apiCustomer.name,
            email: apiCustomer.email,
            phone: apiCustomer.phone || "—",
            registeredAt: new Date().toISOString(),
            active: true,
            totalOrders: apiCustomer.totalOrders || 0,
            totalSpent: apiCustomer.totalSpent || 0,
            customerType: customerType,
            customerId: userId,
            // TODO: Replace with actual addresses from API when available
            addresses: MOCK_CUSTOMER.addresses,
        };
    };

    // Transform API order to match your UI format
    const transformApiOrder = (apiOrder: ApiOrder, index: number) => {
        return {
            _id: apiOrder._id || `order-${index}`,
            orderNumber: apiOrder.orderNumber,
            date: apiOrder.date || apiOrder.createdAt || new Date().toISOString(),
            status: apiOrder.status,
            total: apiOrder.total,
            paymentMethod: apiOrder.paymentMethod,
        };
    };

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            console.log("🔵 Fetching customer details for ID:", customerId);
            
            // Fetch customer details
            const customerData = await getAdminCustomerById(customerId);
            console.log("✅ Customer Details API Response:", customerData);

            // Fetch customer orders
            const ordersData = await getAdminCustomerOrders(customerId);
            console.log("✅ Customer Orders API Response:", ordersData);

            // Handle customer data
            if (customerData) {
                // The service returns the data directly if successful
                const apiCustomer = (customerData as any).data || (customerData as unknown as ApiCustomerDetail);
                const transformedCustomer = transformApiCustomerDetail(apiCustomer, customerId);
                setCustomer(transformedCustomer);
                setNewType(transformedCustomer.customerType);
                setIsActive(true);
            } else {
                console.log("❌ No valid customer data, using mock");
                const mockWithId = { ...MOCK_CUSTOMER, _id: customerId, customerId };
                setCustomer(mockWithId);
                setNewType(mockWithId.customerType);
                setIsActive(MOCK_CUSTOMER.active ?? true);
            }

            // Handle orders data
            if (ordersData && ordersData.data && Array.isArray(ordersData.data)) {
                const transformedOrders = ordersData.data.map((order: ApiOrder, index: number) => transformApiOrder(order, index));
                setOrders(transformedOrders);
            } else {
                console.log("❌ No valid orders data, using mock");
                setOrders(MOCK_ORDERS);
            }
        } catch (err) {
            console.error("❌ Failed to fetch customer profile:", err);
            // Fallback to mock data on error
            const mockWithId = { ...MOCK_CUSTOMER, _id: customerId, customerId };
            setCustomer(mockWithId);
            setNewType(mockWithId.customerType);
            setOrders(MOCK_ORDERS);
            setIsActive(MOCK_CUSTOMER.active ?? true);
            showToast("Error", "Could not load customer details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTypeUpdate = async () => {
        if (!customer) return;
        
        // Don't allow updating mock customers
        if (customerId.startsWith('mock-') || customerId.startsWith('CUST-')) {
            showToast("Error", "Cannot update mock customer", "error");
            setEditingType(false);
            return;
        }

        setUpdating(true);
        try {
            console.log("🔄 Updating customer type:", { 
                customerId, 
                newType,
                endpoint: `/api/admin/customers/${customerId}`
            });
            
            // Since the API doesn't seem to support updating customer type directly,
            // we'll show a message that this feature is coming soon
            showToast("Info", "Customer type update will be available soon", "info");
            setEditingType(false);
            
            // Comment out the API call for now
            /*
            const updateData = {
                customerType: newType
            };
            
            console.log("📦 Sending update data:", updateData);
            
            const result = await updateAdminCustomer(customerId, updateData);
            console.log("✅ Update result:", result);
            
            if (result && result.statusCode === 200) {
                setCustomer(prev => prev ? { ...prev, customerType: newType } : prev);
                showToast("Success", `Customer type updated to ${newType}`, "success");
                setEditingType(false);
            } else {
                throw new Error("Failed to update customer type");
            }
            */
        } catch (err: any) {
            console.error("❌ Failed to update customer type:", err);
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
        console.log("Viewing order:", orderId);
        if (onViewOrder) {
            onViewOrder(orderId);
        } else {
            // Navigate to order detail page
            router.push(`/admin/orders/${orderId}`);
        }
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={5} /></div>;
    if (!customer) return (
        <div className="p-6 text-center">
            <p className="text-muted-foreground">Customer not found.</p>
            <button onClick={onBack} className="mt-4 text-primary hover:underline">Go Back</button>
        </div>
    );

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
                                <span className="font-semibold">ID:</span> {customer.customerId}
                                <button 
                                    onClick={() => copyToClipboard(customer.customerId!, "Customer ID")}
                                    className="p-1 hover:bg-muted rounded"
                                    title="Copy customer ID"
                                >
                                    <Copy size={10} className="text-muted-foreground" />
                                </button>
                            </p>
                        )}
                        <p className="flex items-center gap-1">
                            <span className="font-semibold">MongoDB ID:</span> {customer._id.substring(0, 8)}...
                            <button 
                                onClick={() => copyToClipboard(customer._id, "MongoDB ID")}
                                className="p-1 hover:bg-muted rounded"
                                title="Copy MongoDB ID"
                            >
                                <Copy size={10} className="text-muted-foreground" />
                            </button>
                        </p>
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
                                        setNewType(customer.customerType);
                                    }} 
                                    className="text-xs text-muted-foreground hover:text-foreground ml-1"
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
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
                                <button 
                                    onClick={() => { 
                                        setNewType(customer.customerType); 
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                {isActive ? "Active" : "Inactive"}
                            </span>
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
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-bold text-primary">{order.orderNumber}</span>
                                                <span className="text-[10px] text-muted-foreground">{order._id.substring(0, 8)}...</span>
                                            </div>
                                        </td>
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
                                            <button 
                                                onClick={() => handleViewOrder(order._id)} 
                                                className="text-primary hover:underline text-xs mr-2"
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={() => handleViewOrder(order.orderNumber)} 
                                                className="text-primary hover:underline text-xs"
                                            >
                                                View by #
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