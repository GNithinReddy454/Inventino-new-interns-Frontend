"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SkeletonTable } from "../_components/Skeleton";
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
    AdminOrderDetail,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

const STATUS_TRANSITIONS: Record<string, string[]> = {
    created: ["confirmed", "cancelled"],
    confirmed: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

interface OrderDetailViewProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailView({
    orderId,
    onBack,
}: OrderDetailViewProps) {
    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [pendingStatus, setPendingStatus] = useState("");
    const [pendingTracking, setPendingTracking] = useState("");
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState<any[]>([]);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);

    const { showToast } = useToast();

    const resolvedOrderId = order?._id || orderId || "";

    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            setLoading(false);
            showToast("Error", "Order ID not found", "error");
            return;
        }

        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);

        try {
            console.log("Fetching order details for id:", orderId);

            const data = await getAdminOrderById(orderId);

            if (data) {
                setOrder(data);
                setPendingTracking(data.trackingNumber || "");
                setNotes(Array.isArray(data.notes) ? data.notes : []);
            } else {
                setOrder(null);
                showToast("Error", "No order found", "error");
            }
        } catch (err) {
            console.error("Order detail fetch failed:", err);
            setOrder(null);
            showToast("Error", "Could not load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const currentStatusKey = (order?.status ?? "").toLowerCase();

    const allowedNextStatuses = order
        ? order.allowedNextStatuses?.length
            ? order.allowedNextStatuses
            : STATUS_TRANSITIONS[currentStatusKey] ?? []
        : [];

    const handleStatusUpdate = async () => {
        if (!resolvedOrderId || !pendingStatus || isUpdatingStatus) {
            showToast("Error", "Missing order ID or status", "error");
            return;
        }

        try {
            setIsUpdatingStatus(true);
            const updated = await updateOrderStatus(resolvedOrderId, pendingStatus);

            if (!updated || typeof updated !== "object") {
                throw new Error("Status update response invalid");
            }

            setOrder((prev) =>
                prev
                    ? {
                          ...prev,
                          status: pendingStatus,
                          trackingUpdates: [
                              ...(prev.trackingUpdates ?? []),
                              {
                                  status: pendingStatus,
                                  timestamp: new Date().toISOString(),
                              },
                          ],
                      }
                    : prev
            );

            showToast("Success", "Order status updated", "success");
            setPendingStatus("");
        } catch (err) {
            console.error("Status update failed:", err);
            showToast("Error", "Failed to update status", "error");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleTrackingUpdate = async () => {
        if (!resolvedOrderId || isUpdatingTracking) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        const tracking = pendingTracking.trim();

        if (!tracking) {
            showToast("Error", "Please enter tracking number", "error");
            return;
        }

        if (tracking.length < 4 || tracking.length > 64) {
            showToast("Error", "Tracking number must be 4-64 characters", "error");
            return;
        }

        try {
            setIsUpdatingTracking(true);
            const updated = await updateOrderTracking(resolvedOrderId, tracking);

            if (!updated || typeof updated !== "object") {
                throw new Error("Tracking update response invalid");
            }

            setOrder((prev) =>
                prev
                    ? {
                          ...prev,
                          trackingNumber: tracking,
                      }
                    : prev
            );

            showToast("Success", "Tracking updated", "success");
        } catch (err) {
            console.error("Tracking update failed:", err);
            showToast("Error", "Failed to update tracking", "error");
        } finally {
            setIsUpdatingTracking(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!resolvedOrderId || isCancelling) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        try {
            setIsCancelling(true);
            const cancelled = await cancelOrder(resolvedOrderId, "Cancelled by admin");

            if (!cancelled || typeof cancelled !== "object") {
                throw new Error("Cancel response invalid");
            }

            setOrder((prev) =>
                prev
                    ? {
                          ...prev,
                          status: "cancelled",
                          trackingUpdates: [
                              ...(prev.trackingUpdates ?? []),
                              {
                                  status: "cancelled",
                                  timestamp: new Date().toISOString(),
                              },
                          ],
                      }
                    : prev
            );

            showToast("Success", "Order cancelled", "success");
        } catch (err) {
            console.error("Cancel order failed:", err);
            showToast("Error", "Failed to cancel order", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleAddNote = async () => {
        if (!resolvedOrderId || isAddingNote) {
            showToast("Error", "Order ID not found", "error");
            return;
        }

        const noteText = newNote.trim();

        if (!noteText) {
            showToast("Error", "Note cannot be empty", "error");
            return;
        }

        if (noteText.length > 500) {
            showToast("Error", "Note cannot exceed 500 characters", "error");
            return;
        }

        try {
            setIsAddingNote(true);
            const savedNote = await addOrderNote(resolvedOrderId, noteText);

            if (!savedNote) {
                throw new Error("Notes endpoint unavailable");
            }

            const returnedNote =
                (savedNote as any)?.data || savedNote || null;

            const localNote = {
                text: noteText,
                createdAt: new Date().toISOString(),
            };

            const finalNote =
                returnedNote &&
                typeof returnedNote === "object" &&
                "text" in returnedNote
                    ? returnedNote
                    : localNote;

            setNotes((prev) => [...prev, finalNote]);
            setNewNote("");
            showToast("Success", "Note added", "success");
        } catch (err) {
            console.error("Add note failed:", err);
            showToast(
                "Error",
                "Could not save note. Backend notes API is not available yet.",
                "error"
            );
        } finally {
            setIsAddingNote(false);
        }
    };

    if (loading) {
        return <SkeletonTable rows={6} cols={4} />;
    }

    if (!order) {
        return (
            <div className="p-6">
                <button
                    onClick={onBack}
                    type="button"
                    className="flex items-center gap-2 mb-4"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <p>No order found</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <button
                onClick={onBack}
                type="button"
                className="flex items-center gap-2"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <h1 className="text-xl font-bold">
                Order #{order.orderNumber || resolvedOrderId}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border rounded-xl p-4">
                <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{order.customer?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                        {order.customer?.email || "—"}
                    </p>
                    {order.customer?.phone && (
                        <p className="text-sm text-muted-foreground">
                            {order.customer.phone}
                        </p>
                    )}
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">{order.paymentMethod || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                        Total: ₹{Number(order.total || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{order.status || "—"}</span>
                    </p>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-4 space-y-3">
                <p className="font-semibold">Status</p>
                <p className="capitalize">{order.status || "—"}</p>

                {allowedNextStatuses.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <Select value={pendingStatus} onValueChange={setPendingStatus}>
                            <SelectTrigger className="w-full md:w-55">
                                <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedNextStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        <span className="capitalize">{s}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <button
                            type="button"
                            onClick={handleStatusUpdate}
                            disabled={!pendingStatus || isUpdatingStatus}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                        >
                            {isUpdatingStatus ? "Updating..." : "Update Status"}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-card border rounded-xl p-4 space-y-3">
                <p className="font-semibold">Tracking</p>
                <p>{order.trackingNumber || "N/A"}</p>

                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <input
                        value={pendingTracking}
                        onChange={(e) => setPendingTracking(e.target.value)}
                        placeholder="Enter tracking number"
                        className="border rounded-lg px-3 py-2 w-full md:w-70"
                    />
                    <button
                        type="button"
                        onClick={handleTrackingUpdate}
                        disabled={isUpdatingTracking}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                    >
                        {isUpdatingTracking ? "Saving..." : "Save Tracking"}
                    </button>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
                <p className="font-semibold mb-3">Items</p>
                <div className="space-y-3">
                    {order.items?.length ? (
                        order.items.map((item, index) => (
                            <div key={index} className="flex justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">{item.name || "Unnamed item"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty: {item.quantity}
                                    </p>
                                    {item.sku && (
                                        <p className="text-xs text-muted-foreground">
                                            SKU: {item.sku}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        ₹{Number(item.price || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total: ₹
                                        {Number(
                                            item.total ??
                                                Number(item.price || 0) *
                                                    Number(item.quantity || 0)
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No items found.</p>
                    )}
                </div>
            </div>

            <div className="bg-card border rounded-xl p-4 space-y-3">
                <p className="font-semibold">Notes</p>

                <div className="flex flex-col gap-3">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add note"
                        className="border rounded-lg px-3 py-2 min-h-25"
                    />
                    <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={isAddingNote}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground w-fit"
                    >
                        {isAddingNote ? "Adding..." : "Add Note"}
                    </button>
                </div>

                <div className="space-y-2">
                    {notes.length > 0 ? (
                        notes.map((note, i) => (
                            <div key={i} className="border rounded-lg p-3">
                                <p>{note?.text || "No note text"}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {note?.createdAt
                                        ? new Date(note.createdAt).toLocaleString()
                                        : note?.timestamp
                                        ? new Date(note.timestamp).toLocaleString()
                                        : ""}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No notes yet.</p>
                    )}
                </div>
            </div>

            {order.status !== "cancelled" && order.status !== "delivered" && (
                <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="text-red-500 font-medium"
                >
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                </button>
            )}
        </div>
    );
}