"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download, Save, XCircle, MessageSquare } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import { 
    getAdminOrderById, 
    updateOrderStatus, 
    updateOrderTracking, 
    cancelOrder, 
    addOrderNote,
    AdminOrderDetail 
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

interface OrderDetailsViewProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailView({ orderId, onBack }: OrderDetailsViewProps) {
    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState("");
    const [newTracking, setNewTracking] = useState("");
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState<any[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrderById(orderId);
            if (data) {
                setOrder(data);
                setNewStatus(data.status);
                setNewTracking(data.trackingNumber || "");
                setNotes(data.notes || []);
            }
        } catch (err) {
            console.error("Failed to fetch order:", err);
            showToast("Error", "Could not load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChangeClick = () => {
        if (!newStatus || newStatus === order?.status) return;
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusUpdate = async () => {
        if (!order) return;
        try {
            await updateOrderStatus(order._id, pendingStatus);
            setOrder({ ...order, status: pendingStatus });
            // Add optimistic update to timeline (or refetch)
            const newUpdate = {
                status: pendingStatus,
                timestamp: new Date().toISOString(),
                location: "Admin",
                note: "Status updated by admin",
            };
            setOrder((prev: any) => ({
                ...prev,
                trackingUpdates: [...(prev.trackingUpdates || []), newUpdate],
            }));
            showToast("Success", "Order status updated", "success");
        } catch (err) {
            showToast("Error", "Failed to update status", "error");
        } finally {
            setShowStatusConfirm(false);
            setPendingStatus("");
        }
    };

    const handleTrackingUpdate = async () => {
        if (!order) return;
        try {
            await updateOrderTracking(order._id, newTracking);
            setOrder({ ...order, trackingNumber: newTracking });
            showToast("Success", "Tracking number updated", "success");
        } catch (err) {
            showToast("Error", "Failed to update tracking", "error");
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            await cancelOrder(order._id);
            setOrder({ ...order, status: "Cancelled" });
            const newUpdate = {
                status: "Cancelled",
                timestamp: new Date().toISOString(),
                location: "Admin",
                note: "Order cancelled by admin",
            };
            setOrder((prev: any) => ({
                ...prev,
                status: "Cancelled",
                trackingUpdates: [...(prev.trackingUpdates || []), newUpdate],
            }));
            showToast("Success", "Order cancelled", "success");
        } catch (err) {
            showToast("Error", "Failed to cancel order", "error");
        } finally {
            setShowCancelConfirm(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !order) return;
        try {
            const savedNote = await addOrderNote(order._id, newNote);
            if (savedNote) {
                setNotes([...notes, savedNote]);
                setNewNote("");
                showToast("Success", "Note added", "success");
            }
        } catch (err) {
            showToast("Error", "Failed to add note", "error");
        }
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={4} /></div>;
    if (!order) return <div className="p-6 text-center text-muted-foreground">Order not found.</div>;

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                </div>
                <button
                    onClick={() => window.open(`/api/admin/orders/${orderId}/invoice`, "_blank")}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                    <Download size={16} /> Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <p className="text-xs text-muted-foreground uppercase mb-2">Order Status</p>
                    <div className="flex items-center gap-2">
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="flex-1 p-2 border rounded-lg text-sm"
                        >
                            <option value={order.status}>{order.status}</option>
                            {order.allowedNextStatuses?.map((s: string) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {newStatus !== order.status && (
                            <button
                                onClick={handleStatusChangeClick}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                title="Save Status"
                            >
                                <Save size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <p className="text-xs text-muted-foreground uppercase mb-2">Tracking Number</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newTracking}
                            onChange={(e) => setNewTracking(e.target.value)}
                            placeholder="Enter tracking number"
                            className="flex-1 p-2 border rounded-lg text-sm"
                        />
                        {newTracking !== order.trackingNumber && (
                            <button
                                onClick={handleTrackingUpdate}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                title="Save Tracking"
                            >
                                <Save size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Order Date</p>
                    <p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        {order.customer.billingAddress && (
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Billing Address</p>
                                <p className="text-sm">{order.customer.billingAddress.line1}</p>
                                <p className="text-sm">{order.customer.billingAddress.city}, {order.customer.billingAddress.state} {order.customer.billingAddress.postalCode}</p>
                                <p className="text-sm">{order.customer.billingAddress.country}</p>
                            </div>
                        )}
                        {order.customer.shippingAddress && (
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Shipping Address</p>
                                <p className="text-sm">{order.customer.shippingAddress.line1}</p>
                                <p className="text-sm">{order.customer.shippingAddress.city}, {order.customer.shippingAddress.state} {order.customer.shippingAddress.postalCode}</p>
                                <p className="text-sm">{order.customer.shippingAddress.country}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-3">Payment Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Method</p>
                        <p className="font-medium">{order.payment.method || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                        <p className="font-mono text-xs">{order.payment.transactionId || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Payment Status</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                            order.payment.status === "paid" ? "bg-green-100 text-green-700" :
                            order.payment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                        }`}>
                            {order.payment.status}
                        </span>
                    </div>
                </div>
                <div className="mt-4 border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Subtotal:</span> ₹{order.payment.subtotal?.toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Shipping:</span> ₹{order.payment.shipping?.toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Tax:</span> ₹{order.payment.tax?.toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Discount:</span> ₹{order.payment.discount?.toLocaleString()}</div>
                    <div className="col-span-2 md:col-span-4 text-right font-bold text-lg">Total: ₹{order.payment.total?.toLocaleString()}</div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b">Products</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">SKU</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Price</th>
                                <th className="px-4 py-3 text-left">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3">₹{item.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold">₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
                <div className="space-y-4">
                    {order.trackingUpdates?.map((update, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-primary mt-1"></div>
                                {idx !== order.trackingUpdates.length - 1 && (
                                    <div className="absolute top-5 left-2 w-0.5 h-12 bg-gray-200 -translate-x-1/2"></div>
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <p className="font-semibold">{update.status}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(update.timestamp).toLocaleString()} • {update.location}
                                    {update.note && <span className="italic ml-2">— {update.note}</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                    {notes.map((note, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-2">
                            <p className="text-xs text-muted-foreground">
                                {note.author} • {new Date(note.timestamp).toLocaleString()}
                            </p>
                            <p className="text-sm">{note.text}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a private note..."
                        className="flex-1 p-2 border rounded-lg text-sm"
                        rows={2}
                    />
                    <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                        <MessageSquare size={16} className="inline mr-1" /> Add
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50"
                >
                    <XCircle size={16} className="inline mr-1" /> Cancel Order
                </button>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md">
                        <h3 className="text-lg font-bold mb-4">Cancel Order</h3>
                        <p className="mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                No, Keep
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStatusConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Status Change</h3>
                        <p className="mb-2">Are you sure you want to change the order status from</p>
                        <p className="font-semibold mb-1">{order.status} → {pendingStatus}</p>
                        <p className="text-sm text-muted-foreground mb-4">This action will be recorded in the order timeline.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowStatusConfirm(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                className="px-4 py-2 bg-primary text-white rounded-lg"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}