"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  XCircle,
  MessageSquare,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchOrderByIdAction,
  cancelItemsAction,
  cancelWholeOrderAction,
  resetOrderState
} from "@/redux/orderslice";

// ── Reasons ─────────────────────────────────────────────────────────────
const CANCEL_REASONS = [
  "Found a better price elsewhere",
  "Incorrect items in cart",
  "Changed my mind",
  "Order placement mistake",
  "Delivery date is too far",
  "Address correction needed",
  "Other",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function isObjectId(val?: string): boolean {
  return !!val && /^[a-f\d]{24}$/i.test(val);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  productObjectId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CancelItemsPage({
  params,
}: {
  params: Promise<{ id: string }> | any;
}) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>);
  const orderId = unwrappedParams.id;

  const dispatch = useAppDispatch();
  const { currentOrder, isLoading, error: reduxError } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrderByIdAction(orderId));
    return () => {
      dispatch(resetOrderState());
    };
  }, [orderId, dispatch]);

  // ── Derived State ──────────────────────────────────────────────────────────
  const orderNumber = currentOrder?.orderNumber ?? currentOrder?.orderId ?? orderId;

  const orderItems: OrderItem[] = React.useMemo(() => {
    if (!currentOrder) return [];
    const rawItems: any[] = currentOrder.items ?? [];
    return rawItems.map((item: any) => {
      const objectId =
        (item.productId) ??
        (item.product?._id) ??
        (typeof item.product === 'string' ? item.product : null) ??
        (item.productObjectId) ??
        (item._id) ??
        null;

      return {
        productObjectId: objectId ?? "",
        name: item.productName || item.name || item.product?.name || "Product",
        imageUrl: item.imageUrl || item.product?.images?.[0]?.url || "",
        price: item.price ?? 0,
        quantity: item.quantity ?? item.qty ?? 1,
      };
    });
  }, [currentOrder]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIds.length || !reason) {
      alert("Please select at least one item and a reason.");
      return;
    }

    setSubmitError(null);

    try {
      // Step 5/6/7 in documentation: Cancel specific item(s)
      await dispatch(cancelItemsAction({
        id: orderId,
        data: {
          items: selectedIds.map((pid) => ({
            productId: pid,
            action: 'cancel'
          })),
          reason: reason + (comments ? `: ${comments}` : "")
        }
      })).unwrap();

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err || "Failed to submit request. Please try again.");
    }
  };

  const handleFullCancellation = async () => {
    if (!reason) {
      alert("Please select a reason for cancellation.");
      return;
    }
    
    if (!confirm("Are you sure you want to cancel the entire order?")) return;

    setSubmitError(null);

    try {
      // Step 8 in documentation: Cancel whole order at once
      await dispatch(cancelWholeOrderAction({
        id: orderId,
        reason: reason + (comments ? `: ${comments}` : "")
      })).unwrap();

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err || "Failed to cancel order. Please try again.");
    }
  };

  if (isLoading && !currentOrder) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <Loader2 size={32} color="#D94F7A" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 500 }}>
          <div style={{ width: 80, height: 80, background: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle2 color="#10b981" size={40} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 12 }}>Cancellation Request Received</h1>
          <p style={{ color: "#6b7280", marginBottom: 32 }}>
            Your request to cancel items from Order #{orderNumber} has been received. Our team will process the refund for the selected items within 2-3 business days.
          </p>
          <Link href="/profile/orders" style={{ display: "inline-block", background: "#D94F7A", color: "#fff", padding: "14px 28px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 100, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link href={`/profile/orders/${orderId}`} style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#374151" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 4 }}>Cancel Items</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Order #{orderNumber}</p>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: 32, boxShadow: "0 8px 30px rgba(0,0,0,0.02)" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 12, marginBottom: 32 }}>
            <AlertTriangle size={20} color="#f97316" />
            <p style={{ fontSize: 13, color: "#9a3412", margin: 0, fontWeight: 500 }}>
              Note: You can only cancel items that haven't been shipped yet.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16 }}>1. Select items to cancel</h3>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
              {orderItems.map((item, idx) => (
                <div key={idx} 
                  onClick={() => toggleItem(item.productObjectId)}
                  style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", background: selectedIds.includes(item.productObjectId) ? "#fff5f8" : "#fff", borderBottom: idx < orderItems.length -1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${selectedIds.includes(item.productObjectId) ? "#D94F7A" : "#d1d5db"}`, background: selectedIds.includes(item.productObjectId) ? "#D94F7A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selectedIds.includes(item.productObjectId) && <X size={14} color="#fff" />}
                  </div>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #eee" }} />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 8, background: "#f9fafb", border: "1px solid #eee" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#D94F7A" }}>₹{item.price.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16 }}>2. Why are you cancelling?</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
              {CANCEL_REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  style={{ padding: "10px 18px", borderRadius: 999, border: `1.5px solid ${reason === r ? "#D94F7A" : "#e5e7eb"}`, background: reason === r ? "#D94F7A" : "#fff", color: reason === r ? "#fff" : "#4b5563", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {r}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>3. Additional comments (Optional)</h3>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us a bit more..."
              style={{ width: "100%", padding: 16, borderRadius: 12, border: "1.px solid #d1d5db", minHeight: 100, fontSize: 14, fontFamily: "inherit", resize: "none", marginBottom: 32, outline: "none" }} />

            {submitError && (
              <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{submitError}</p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={!selectedIds.length || !reason || isLoading}
                style={{ flex: 2, background: (selectedIds.length && reason && !isLoading) ? "#111" : "#f3f4f6", color: (selectedIds.length && reason && !isLoading) ? "#fff" : "#9ca3af", padding: "16px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: (selectedIds.length && reason && !isLoading) ? "pointer" : "not-allowed", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Request Item Cancellation"}
              </button>
              
              <button type="button" onClick={handleFullCancellation} disabled={!reason || isLoading}
                style={{ flex: 1, background: "#fff", color: (reason && !isLoading) ? "#ef4444" : "#9ca3af", border: (reason && !isLoading) ? "2px solid #fee2e2" : "2px solid #f3f4f6", padding: "16px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: (reason && !isLoading) ? "pointer" : "not-allowed" }}>
                Cancel Entire Order
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
