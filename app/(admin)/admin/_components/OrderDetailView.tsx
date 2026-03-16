"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download, XCircle, MessageSquare, Pencil, X, Check } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getAdminOrderById,
    updateOrderStatus,
    updateOrderTracking,
    cancelOrder,
    addOrderNote,
    downloadOrderInvoice,
    AdminOrderDetail,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

// ── Allowed status transitions (mirrors backend rules) ────────────────────────
// created → confirmed, cancelled
// confirmed → packed, cancelled
// packed → shipped, cancelled
// shipped → delivered, cancelled
// delivered → none  |  cancelled → none
const STATUS_TRANSITIONS: Record<string, string[]> = {
    created:   ["confirmed", "cancelled"],
    confirmed: ["packed",    "cancelled"],
    packed:    ["shipped",   "cancelled"],
    shipped:   ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

const STATUS_COLORS: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    shipped:   "bg-blue-100 text-blue-700",
    packed:    "bg-orange-100 text-orange-700",
    confirmed: "bg-yellow-100 text-yellow-700",
    created:   "bg-purple-100 text-purple-700",
    cancelled: "bg-red-100 text-red-700",
};

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_ORDER: AdminOrderDetail = {
    _id: "order-1",
    orderNumber: "ORD-001",
    customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        billingAddress:  { line1: "123 Main St", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "India" },
        shippingAddress: { line1: "123 Main St", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "India" },
    },
    payment: { method: "Credit Card", transactionId: "txn_123456", status: "paid", subtotal: 1600, shipping: 50, tax: 128, discount: 0, total: 1778 },
    items: [
        { name: "Gold Necklace", sku: "GN-001", quantity: 1, price: 1250, total: 1250 },
        { name: "Silver Earrings", sku: "SE-002", quantity: 2, price: 350,  total: 700  },
    ],
    status: "delivered",
    allowedNextStatuses: [],
    trackingNumber: "TRK123456789",
    trackingUpdates: [
        { status: "created",   timestamp: "2026-03-10T10:00:00.000Z", location: "Online",           note: "" },
        { status: "shipped",   timestamp: "2026-03-11T14:30:00.000Z", location: "Mumbai Hub",        note: "" },
        { status: "delivered", timestamp: "2026-03-13T16:45:00.000Z", location: "Customer Address",  note: "" },
    ],
    notes: [{ author: "Admin", text: "Customer requested gift wrapping.", timestamp: "2026-03-09T11:22:00.000Z" }],
    createdAt: "2026-03-10T10:00:00.000Z",
};

interface OrderDetailsViewProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailView({ orderId, onBack }: OrderDetailsViewProps) {
    const [order, setOrder]   = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Status edit
    const [editingStatus, setEditingStatus]     = useState(false);
    const [pendingStatus, setPendingStatus]     = useState("");
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);

    // Tracking edit
    const [editingTracking, setEditingTracking]   = useState(false);
    const [pendingTracking, setPendingTracking]   = useState("");

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [newNote, setNewNote]   = useState("");
    const [notes, setNotes]       = useState<any[]>([]);
    const { showToast } = useToast();

    useEffect(() => { fetchOrder(); }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrderById(orderId);
            if (data) {
                setOrder(data);
                setNotes(data.notes ?? []);
            } else {
                setOrder(MOCK_ORDER);
                setNotes(MOCK_ORDER.notes);
            }
        } catch {
            setOrder(MOCK_ORDER);
            setNotes(MOCK_ORDER.notes);
            showToast("Error", "Could not load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    // ── Status helpers ────────────────────────────────────────
    const allowedNextStatuses = order
        ? (STATUS_TRANSITIONS[order.status.toLowerCase()] ?? order.allowedNextStatuses ?? [])
        : [];
    const canEditStatus = allowedNextStatuses.length > 0;

    const openStatusEdit  = () => { if (!order || !canEditStatus) return; setPendingStatus(allowedNextStatuses[0]); setEditingStatus(true); };
    const cancelStatusEdit = () => { setEditingStatus(false); setPendingStatus(""); };
    const saveStatusEdit   = () => {
        if (!pendingStatus || pendingStatus === order?.status) { setEditingStatus(false); return; }
        setShowStatusConfirm(true);
    };

    const confirmStatusUpdate = async () => {
        if (!order) return;
        try {
            await updateOrderStatus(order._id, pendingStatus);
            const newUpdate = { status: pendingStatus, timestamp: new Date().toISOString(), location: "Admin", note: "Status updated by admin" };
            setOrder((prev: any) => ({
                ...prev,
                status: pendingStatus,
                trackingUpdates: [...(prev.trackingUpdates ?? []), newUpdate],
            }));
            showToast("Success", "Order status updated", "success");
        } catch {
            showToast("Error", "Failed to update status", "error");
        } finally {
            setShowStatusConfirm(false);
            setEditingStatus(false);
            setPendingStatus("");
        }
    };

    // ── Tracking helpers ──────────────────────────────────────
    const openTrackingEdit   = () => { if (!order) return; setPendingTracking(order.trackingNumber ?? ""); setEditingTracking(true); };
    const cancelTrackingEdit = () => { setEditingTracking(false); setPendingTracking(""); };
    const saveTrackingEdit   = async () => {
        if (!order) return;
        try {
            await updateOrderTracking(order._id, pendingTracking);
            setOrder({ ...order, trackingNumber: pendingTracking });
            showToast("Success", "Tracking number updated", "success");
        } catch {
            showToast("Error", "Failed to update tracking", "error");
        } finally {
            setEditingTracking(false);
            setPendingTracking("");
        }
    };

    // ── Cancel ────────────────────────────────────────────────
    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            await cancelOrder(order._id, "Cancelled by admin");
            const newUpdate = { status: "cancelled", timestamp: new Date().toISOString(), location: "Admin", note: "Order cancelled by admin" };
            setOrder((prev: any) => ({ ...prev, status: "cancelled", trackingUpdates: [...(prev.trackingUpdates ?? []), newUpdate] }));
            showToast("Success", "Order cancelled", "success");
        } catch {
            showToast("Error", "Failed to cancel order", "error");
        } finally {
            setShowCancelConfirm(false);
        }
    };

    // ── Invoice ───────────────────────────────────────────────
    const handleInvoice = async () => {
        try {
            const blob = await downloadOrderInvoice(orderId);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
                window.URL.revokeObjectURL(url);
            }
        } catch {
            showToast("Error", "Could not download invoice", "error");
        }
    };

    // ── Notes ─────────────────────────────────────────────────
    const handleAddNote = async () => {
        if (!newNote.trim() || !order) return;
        try {
            const savedNote = await addOrderNote(order._id, newNote);
            if (savedNote) { setNotes([...notes, savedNote]); setNewNote(""); showToast("Success", "Note added", "success"); }
        } catch {
            showToast("Error", "Failed to add note", "error");
        }
    };

    if (loading) return <div className="p-6"><SkeletonTable rows={8} cols={4} /></div>;
    if (!order)  return <div className="p-6 text-center text-muted-foreground">Order not found.</div>;

    const currentStatusKey = (order.status ?? "").toLowerCase();

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                </div>
                <button
                    onClick={handleInvoice}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Download size={16} /> Invoice
                </button>
            </div>

            {/* Status / Tracking / Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Order Status */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Order Status</p>
                        {!editingStatus ? (
                            <button
                                onClick={openStatusEdit}
                                disabled={!canEditStatus}
                                title={canEditStatus ? "Edit status" : "No further transitions allowed"}
                                className={`p-1.5 rounded-lg transition-colors ${canEditStatus ? "hover:bg-muted text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
                            >
                                <Pencil size={14} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button onClick={saveStatusEdit} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Save">
                                    <Check size={14} />
                                </button>
                                <button onClick={cancelStatusEdit} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Cancel">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {!editingStatus ? (
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold capitalize ${STATUS_COLORS[currentStatusKey] || "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                        </span>
                    ) : (
                        <Select value={pendingStatus} onValueChange={setPendingStatus}>
                            <SelectTrigger className="w-full rounded-lg border-border bg-background text-sm capitalize">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedNextStatuses.map((s) => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Tracking Number */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tracking Number</p>
                        {!editingTracking ? (
                            <button onClick={openTrackingEdit} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Edit tracking">
                                <Pencil size={14} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button onClick={saveTrackingEdit} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Save">
                                    <Check size={14} />
                                </button>
                                <button onClick={cancelTrackingEdit} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Cancel">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    {!editingTracking ? (
                        <span className="font-mono text-sm font-semibold text-foreground">
                            {order.trackingNumber || <span className="text-muted-foreground italic text-xs">No tracking number</span>}
                        </span>
                    ) : (
                        <input
                            type="text"
                            value={pendingTracking}
                            onChange={(e) => setPendingTracking(e.target.value)}
                            autoFocus
                            placeholder="Enter tracking number"
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    )}
                </div>

                {/* Order Date */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Order Date</p>
                    <p className="text-lg font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Customer Information */}
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

            {/* Payment Details */}
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

            {/* Products */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b">Products</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">SKU</th>
                                <th className="px-4 py-3 text-left">Qty</th>
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
                                    <td className="px-4 py-3 font-mono text-xs">{item.sku || "—"}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3">₹{item.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold">₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Timeline */}
            {order.trackingUpdates?.length > 0 && (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
                    <div className="space-y-4">
                        {order.trackingUpdates.map((update, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="relative">
                                    <div className="w-4 h-4 rounded-full bg-primary mt-1" />
                                    {idx !== order.trackingUpdates.length - 1 && (
                                        <div className="absolute top-5 left-2 w-0.5 h-12 bg-gray-200 -translate-x-1/2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-semibold capitalize">{update.status}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(update.timestamp).toLocaleString()} • {update.location}
                                        {update.note && <span className="italic ml-2">— {update.note}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Internal Notes */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                    {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                    {notes.map((note, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-2">
                            <p className="text-xs text-muted-foreground">{note.author} • {new Date(note.timestamp).toLocaleString()}</p>
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

            {/* Cancel Order — hidden if already cancelled/delivered */}
            {!["cancelled", "delivered"].includes(currentStatusKey) && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                        <XCircle size={16} /> Cancel Order
                    </button>
                </div>
            )}

            {/* Cancel Confirm Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Cancel Order</h3>
                        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">No, Keep</button>
                            <button onClick={handleCancelOrder} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">Yes, Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Confirm Modal */}
            {showStatusConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Confirm Status Change</h3>
                        <p className="text-sm text-muted-foreground mb-2">Change order status from</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[currentStatusKey] || "bg-gray-100 text-gray-600"}`}>
                                {order.status}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[pendingStatus.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                                {pendingStatus}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-6">This will be recorded in the order timeline.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowStatusConfirm(false); setEditingStatus(false); }} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                            <button onClick={confirmStatusUpdate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}