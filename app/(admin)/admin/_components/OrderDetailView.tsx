"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
    _id: string;
    onBack: () => void;
}

export default function OrderDetailView({ _id, onBack }: OrderDetailViewProps) {
    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [pendingStatus, setPendingStatus] = useState("");
    const [pendingTracking, setPendingTracking] = useState("");
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState<any[]>([]);

    const { showToast } = useToast();

    useEffect(() => {
        fetchOrder();
    }, [_id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrderById(_id);
            if (data) {
                setOrder(data);
                setPendingTracking(data.trackingNumber || "");
                setNotes(data.notes ?? []);
            } else {
                setOrder(null);
            }
        } catch (err) {
            showToast("Error", "Could not load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const currentStatusKey = (order?.status ?? "").toLowerCase();

    const allowedNextStatuses =
        order
            ? order.allowedNextStatuses?.length
                ? order.allowedNextStatuses
                : STATUS_TRANSITIONS[currentStatusKey] ?? []
            : [];

    const handleStatusUpdate = async () => {
        if (!order?._id || !pendingStatus) return;

        try {
            await updateOrderStatus(order._id, pendingStatus);

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
        } catch {
            showToast("Error", "Failed to update status", "error");
        }
    };

    const handleTrackingUpdate = async () => {
        if (!order?._id || !pendingTracking.trim()) return;

        try {
            await updateOrderTracking(order._id, pendingTracking.trim());

            setOrder((prev) =>
                prev ? { ...prev, trackingNumber: pendingTracking.trim() } : prev
            );

            showToast("Success", "Tracking updated", "success");
        } catch {
            showToast("Error", "Failed to update tracking", "error");
        }
    };

    const handleCancelOrder = async () => {
        if (!order?._id) return;

        try {
            await cancelOrder(order._id, "Cancelled by admin");

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
        } catch {
            showToast("Error", "Failed to cancel order", "error");
        }
    };

    const handleAddNote = async () => {
        if (!order?._id || !newNote.trim()) return;

        try {
            const savedNote = await addOrderNote(order._id, newNote.trim());

            const localNote = {
                text: newNote.trim(),
                createdAt: new Date().toISOString(),
            };

            setNotes((prev) => [...prev, (savedNote as any)?.data || savedNote || localNote]);
            setNewNote("");
            showToast("Success", "Note added", "success");
        } catch {
            showToast("Error", "Failed to add note", "error");
        }
    };

    if (loading) return <SkeletonTable rows={6} cols={4} />;

    if (!order) {
        return (
            <div className="p-6">
                <button onClick={onBack} className="flex items-center gap-2 mb-4">
                    <ArrowLeft size={18} /> Back
                </button>
                <p>No order found</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <button onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft size={18} /> Back
            </button>

            <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border rounded-xl p-4">
                <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{order.customer?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.email || "—"}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">{order.paymentMethod || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                        Total: ₹{Number(order.total || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-4 space-y-3">
                <p className="font-semibold">Status</p>
                <p className="capitalize">{order.status}</p>

                {allowedNextStatuses.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <Select value={pendingStatus} onValueChange={setPendingStatus}>
                            <SelectTrigger className="w-full md:w-55">
                                <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedNextStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <button
                            onClick={handleStatusUpdate}
                            disabled={!pendingStatus}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                        >
                            Update Status
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
                        onClick={handleTrackingUpdate}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                    >
                        Save Tracking
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
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    ₹{Number(item.price || 0).toLocaleString()}
                                </p>
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
                        onClick={handleAddNote}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground w-fit"
                    >
                        Add Note
                    </button>
                </div>

                <div className="space-y-2">
                    {notes.length > 0 ? (
                        notes.map((note, i) => (
                            <div key={i} className="border rounded-lg p-3">
                                <p>{note.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {note.createdAt
                                        ? new Date(note.createdAt).toLocaleString()
                                        : note.timestamp
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
                    onClick={handleCancelOrder}
                    className="text-red-500 font-medium"
                >
                    Cancel Order
                </button>
            )}
        </div>
    );
}
