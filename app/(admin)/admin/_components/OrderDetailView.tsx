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

const STATUS_TRANSITIONS: Record<string, string[]> = {
    created: ["confirmed", "cancelled"],
    confirmed: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

export default function OrderDetailView({ orderId, onBack }: any) {
    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [editingStatus, setEditingStatus] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);

    const [editingTracking, setEditingTracking] = useState(false);
    const [pendingTracking, setPendingTracking] = useState("");

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
                setNotes(data.notes ?? []);
            }
        } catch {
            showToast("Error", "Could not load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const currentStatusKey = (order?.status ?? "").toLowerCase();

    const allowedNextStatuses =
        order
            ? STATUS_TRANSITIONS[currentStatusKey] ??
              order.allowedNextStatuses ??
              []
            : [];

    const canEditStatus = allowedNextStatuses.length > 0;

    // ── STATUS ──
    const confirmStatusUpdate = async () => {
        if (!order) return;

        try {
            await updateOrderStatus(order._id, pendingStatus);

            setOrder((prev: AdminOrderDetail | null) =>
                prev
                    ? {
                          ...prev,
                          status: pendingStatus,
                          trackingUpdates: [
                              ...(prev.trackingUpdates ?? []),
                              {
                                  status: pendingStatus,
                                  timestamp: new Date().toISOString(),
                                  location: "Admin",
                              },
                          ],
                      }
                    : prev
            );

            showToast("Success", "Order status updated", "success");
        } catch {
            showToast("Error", "Failed to update status", "error");
        } finally {
            setShowStatusConfirm(false);
            setEditingStatus(false);
        }
    };

    // ── TRACKING ──
    const saveTrackingEdit = async () => {
        if (!order || !pendingTracking.trim()) return;

        try {
            await updateOrderTracking(order._id, pendingTracking);

            setOrder((prev: AdminOrderDetail | null) =>
                prev ? { ...prev, trackingNumber: pendingTracking } : prev
            );

            showToast("Success", "Tracking updated", "success");
        } catch {
            showToast("Error", "Failed to update tracking", "error");
        } finally {
            setEditingTracking(false);
        }
    };

    // ── CANCEL ──
    const handleCancelOrder = async () => {
        if (!order) return;

        try {
            await cancelOrder(order._id, "Cancelled by admin");

            setOrder((prev: AdminOrderDetail | null) =>
                prev
                    ? {
                          ...prev,
                          status: "cancelled",
                          trackingUpdates: [
                              ...(prev.trackingUpdates ?? []),
                              {
                                  status: "cancelled",
                                  timestamp: new Date().toISOString(),
                                  location: "Admin",
                              },
                          ],
                      }
                    : prev
            );

            showToast("Success", "Order cancelled", "success");
        } catch {
            showToast("Error", "Failed to cancel", "error");
        } finally {
            setShowCancelConfirm(false);
        }
    };

    // ── NOTES ──
    const handleAddNote = async () => {
        if (!newNote.trim() || !order) return;

        try {
            const savedNote = await addOrderNote(order._id, newNote);

            if (savedNote) {
                setNotes((prev) => [...prev, savedNote]);
                setNewNote("");
                showToast("Success", "Note added", "success");
            }
        } catch {
            showToast("Error", "Failed to add note", "error");
        }
    };

    if (loading) return <SkeletonTable rows={6} cols={4} />;

    if (!order) return <p>No order found</p>;

    return (
        <div className="p-6 space-y-6">

            <button onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft size={18} /> Back
            </button>

            <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>

            {/* STATUS */}
            <div>
                <p>Status: {order.status}</p>

                {canEditStatus && (
                    <Select value={pendingStatus} onValueChange={setPendingStatus}>
                        <SelectTrigger>
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
                )}
            </div>

            {/* TRACKING */}
            <div>
                <p>Tracking: {order.trackingNumber || "N/A"}</p>

                <input
                    value={pendingTracking}
                    onChange={(e) => setPendingTracking(e.target.value)}
                    placeholder="Enter tracking"
                />

                <button onClick={saveTrackingEdit}>Save</button>
            </div>

            {/* NOTES */}
            <div>
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <button onClick={handleAddNote}>Add Note</button>

                {notes.map((n, i) => (
                    <p key={i}>{n.text}</p>
                ))}
            </div>

            <button onClick={handleCancelOrder} className="text-red-500">
                Cancel Order
            </button>
        </div>
    );
}