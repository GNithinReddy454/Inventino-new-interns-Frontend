"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCcw,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react";
import { orderService } from "@/services/order.service";

// ── Reason lists ──────────────────────────────────────────────────────────────
const RETURN_REASONS = [
  "Wrong item received",
  "Item defective or damaged",
  "Didn't like the product",
  "Arrived too late",
  "Size/Fit issue",
  "Other",
];

// Must exactly match backend enum
const EXCHANGE_REASONS = ["Wrong Size", "Wrong Color", "Defective (Want Replacement)"];

const SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Gold", "Silver", "Rose Gold", "Black", "White"];

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
export default function ReturnExchangePage({
  params,
}: {
  params: Promise<{ id: string }> | any;
}) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>);
  const orderId = unwrappedParams.id;

  // ── Fetch order ──────────────────────────────────────────────────────────
  const [orderItems, setOrderItems]     = useState<OrderItem[]>([]);
  const [orderNumber, setOrderNumber]   = useState<string>("");
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError]     = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoadingOrder(true);
        const res  = await orderService.getOrderDetails(orderId);
        const data = res?.data ?? res;

        setOrderNumber(data?.orderNumber ?? data?.orderId ?? orderId);

        const rawItems: any[] = data?.items ?? [];
        const mapped: OrderItem[] = rawItems.map((item: any) => {
          const objectId =
            (isObjectId(item.product?._id)   ? item.product._id   : null) ??
            (isObjectId(item._id)             ? item._id            : null) ??
            (isObjectId(item.productObjectId) ? item.productObjectId : null) ??
            null;

          if (!objectId) {
            console.warn("[ReturnExchange] Could not find a valid ObjectId for item:", item);
          }

          return {
            productObjectId: objectId ?? "",
            name:     item.name ?? item.product?.name ?? "Product",
            imageUrl: item.imageUrl ?? item.product?.images?.[0]?.url ?? "",
            price:    item.price ?? 0,
            quantity: item.quantity ?? item.qty ?? 1, // ✅ correctly mapped from API
          };
        });

        setOrderItems(mapped);
      } catch (err: any) {
        console.error("[ReturnExchange] Failed to load order:", err);
        setOrderError(err?.response?.data?.message ?? "Failed to load order details.");
      } finally {
        setLoadingOrder(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Pre-select all items once loaded
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    if (orderItems.length > 0) {
      setSelectedIds(orderItems.map((i) => i.productObjectId).filter(Boolean));
    }
  }, [orderItems]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [requestType, setRequestType] = useState<"return" | "exchange">("return");
  const [reason,   setReason]   = useState("");
  const [comments, setComments] = useState("");
  const [newSize,  setNewSize]  = useState<string | null>(null);
  const [newColor, setNewColor] = useState<string | null>(null);

  const [isSubmitted,  setIsSubmitted]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  const [images,       setImages]       = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > 3) { alert("Max 3 photos."); return; }
    setImages((prev) => [...prev, ...newFiles]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIds.length || !reason) { alert("Please select an item and a reason."); return; }

    if (requestType === "exchange" && !newSize && !newColor) {
      alert("Please specify a new size or color."); return;
    }

    const productId = selectedIds[0];

    if (!isObjectId(productId)) {
      setSubmitError(
        `Cannot submit: the product ID "${productId || "(empty)"}" is not a valid MongoDB ObjectId. ` +
        `Please contact support.`
      );
      return;
    }

    // ✅ FIX: Look up the real quantity from orderItems instead of hardcoding 1
    const selectedItem = orderItems.find((i) => i.productObjectId === productId);
    const selectedQuantity = selectedItem?.quantity ?? 1;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (requestType === "return") {
        await orderService.requestReturn(orderId, {
          reason,
          // ✅ FIX: Use actual quantity per item instead of hardcoded 1
          items: selectedIds.map((pid) => {
            const item = orderItems.find((i) => i.productObjectId === pid);
            return { productId: pid, quantity: item?.quantity ?? 1 };
          }),
          resolution: "refund",
        });
      } else {
        await orderService.requestExchange(orderId, {
          productId,
          quantity: selectedQuantity, // ✅ FIX: was hardcoded 1, now uses real quantity (e.g. 2)
          reasonForExchange: reason,
          condition: "Unworn/Original Packaging",
          exchangeDetails: {
            newSize:  newSize  ?? null,
            newColor: newColor ?? null,
          },
          comments: comments || undefined,
        });
      }

      sessionStorage.removeItem("returnExchangeOrder");
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Submit error:", err);
      setSubmitError(
        err?.response?.data?.message ?? err?.message ?? "Failed to submit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedIds.length > 0 &&
    !!reason &&
    (requestType === "return" || newSize || newColor);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingOrder) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} color="#D94F7A" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12, fontSize: 14, color: "#9ca3af" }}>Loading order…</p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (orderError) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: 12 }}>{orderError}</p>
          <Link href="/profile/orders" style={{ color: "#D94F7A", textDecoration: "underline" }}>← Back to Orders</Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 80, fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 16px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, background: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle2 color="#10b981" size={40} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 12 }}>Request Submitted!</h1>
          <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>
            Your {requestType} request for Order #{orderNumber} has been submitted. We'll get back to you within 24–48 hours.
          </p>
          <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb", marginBottom: 32, textAlign: "left" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 16 }}>Request Summary</h3>
            {[
              { label: "Type",  value: requestType.charAt(0).toUpperCase() + requestType.slice(1) },
              { label: "Items", value: `${selectedIds.length} item(s)` },
              ...(requestType === "exchange" && newSize  ? [{ label: "New Size",  value: newSize  }] : []),
              ...(requestType === "exchange" && newColor ? [{ label: "New Color", value: newColor }] : []),
              { label: "Status", value: "Under Review", valueColor: "#f59e0b" },
            ].map(({ label, value, valueColor }: any) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 700, color: valueColor ?? "#111" }}>{value}</span>
              </div>
            ))}
          </div>
          <Link href="/profile/orders" style={{ display: "inline-block", background: "#D94F7A", color: "#fff", padding: "16px 32px", borderRadius: 999, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(217,79,122,0.3)" }}>
            Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 100, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link href="/profile/orders" style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#374151" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", marginBottom: 4 }}>Return & Exchange</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Order #{orderNumber}</p>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", boxShadow: "0 8px 30px rgba(0,0,0,0.03)", padding: "32px" }}>
          <form onSubmit={handleSubmit}>

            {/* Step 1: Type */}
            <StepHeader number={1} title="What would you like to do?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
              {(["return", "exchange"] as const).map((type) => (
                <button key={type} type="button"
                  onClick={() => { setRequestType(type); setReason(""); }}
                  style={{ padding: 24, borderRadius: 16, border: `2px solid ${requestType === type ? "#D94F7A" : "#e5e7eb"}`, background: requestType === type ? "#fff5f8" : "#f9fafb", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                    {type === "return"
                      ? <RotateCcw size={32} color={requestType === type ? "#D94F7A" : "#9ca3af"} />
                      : <RefreshCcw size={32} color={requestType === type ? "#D94F7A" : "#9ca3af"} />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: requestType === type ? "#D94F7A" : "#111", marginBottom: 4 }}>
                    {type === "return" ? "Return Item" : "Exchange Item"}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {type === "return" ? "Get a refund to your original method" : "Swap for a different size or color"}
                  </div>
                </button>
              ))}
            </div>

            <Divider />

            {/* Step 2: Items */}
            <StepHeader number={2} title="Select Items" />
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 36 }}>
              {orderItems.length > 0 ? orderItems.map((item, index) => (
                <div key={item.productObjectId || index}
                  onClick={() => item.productObjectId && toggleItem(item.productObjectId)}
                  style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: item.productObjectId ? "pointer" : "not-allowed", background: selectedIds.includes(item.productObjectId) ? "#fffafa" : "#f9fafb", borderTop: index > 0 ? "1px solid #f3f4f6" : "none", transition: "background 0.2s" }}>
                  <RadioDot selected={selectedIds.includes(item.productObjectId)} />
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", border: "1px solid #fce7f3", flexShrink: 0 }} />
                    : <div style={{ width: 72, height: 72, borderRadius: 12, background: "#fdf2f7", border: "1px solid #fce7f3", flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>Qty: {item.quantity}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8456A" }}>₹{Number(item.price).toFixed(2)}</div>
                    {!item.productObjectId && (
                      <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>⚠ Product ID unavailable</div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No items found in this order.</div>
              )}
            </div>

            <Divider />

            {/* Step 3: Reason */}
            <StepHeader number={3} title={`Reason for ${requestType}`} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
              {(requestType === "exchange" ? EXCHANGE_REASONS : RETURN_REASONS).map((r) => (
                <button key={r} type="button" onClick={() => setReason(r)} style={{ padding: "12px 20px", borderRadius: 999, border: `1.5px solid ${reason === r ? "#D94F7A" : "#e5e7eb"}`, background: reason === r ? "#D94F7A" : "#f9fafb", color: reason === r ? "#fff" : "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                  {r}
                </button>
              ))}
            </div>

            {/* Step 4: Exchange details */}
            {requestType === "exchange" && (
              <>
                <Divider />
                <StepHeader number={4} title="Exchange Details" />
                <div style={{ marginBottom: 36 }}>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Specify at least one preference below.</p>

                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>New Size</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    {SIZES.map((sz) => (
                      <button key={sz} type="button" onClick={() => setNewSize(newSize === sz ? null : sz)} style={{ width: 48, height: 48, borderRadius: 10, border: `2px solid ${newSize === sz ? "#D94F7A" : "#e5e7eb"}`, background: newSize === sz ? "#D94F7A" : "#f9fafb", color: newSize === sz ? "#fff" : "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                        {sz}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>New Color</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    {COLORS.map((cl) => (
                      <button key={cl} type="button" onClick={() => setNewColor(newColor === cl ? null : cl)} style={{ padding: "8px 18px", borderRadius: 999, border: `2px solid ${newColor === cl ? "#D94F7A" : "#e5e7eb"}`, background: newColor === cl ? "#D94F7A" : "#f9fafb", color: newColor === cl ? "#fff" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                        {cl}
                      </button>
                    ))}
                  </div>
              </div>
            </>
          )}

            <Divider />

            {/* Additional Details */}
            <div style={{ marginBottom: 8, background: "#f9fafb", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={18} color="#D94F7A" /> Additional Details
              </h2>

              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Comments (Optional)</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)}
                placeholder="Any extra details to help us process your request faster…"
                style={{ width: "100%", padding: 16, borderRadius: 12, border: "1.5px solid #d1d5db", background: "#fff", fontSize: 14, fontFamily: "inherit", minHeight: 120, resize: "vertical", marginBottom: 20, boxSizing: "border-box" }} />

              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Upload Photos (Optional)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png" multiple style={{ display: "none" }} />
              <div onClick={() => images.length < 3 && fileInputRef.current?.click()}
                style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: 32, textAlign: "center", background: "#fff", cursor: images.length >= 3 ? "not-allowed" : "pointer", opacity: images.length >= 3 ? 0.6 : 1 }}>
                <UploadCloud size={32} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: "#4b5563", marginBottom: 4 }}>
                  {images.length >= 3 ? "Maximum files reached" : "Click to upload files"}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Max 3 photos, 5MB each (JPG, PNG)</div>
              </div>
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  {images.map((file, idx) => (
                    <div key={idx} style={{ position: "relative", width: 80, height: 80, borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImages((p) => p.filter((_, i) => i !== idx)); }}
                        style={{ position: "absolute", top: 4, right: 4, zIndex: 10, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} />
                      </button>
                      <img src={URL.createObjectURL(file)} alt={`upload-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {submitError && (
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", fontSize: 13, color: "#be123c", fontWeight: 500 }}>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <div style={{ marginTop: 32 }}>
              <button type="submit" disabled={!isFormValid || isSubmitting} style={{
                width: "100%", background: isFormValid && !isSubmitting ? "#D94F7A" : "#f3f4f6",
                color: isFormValid && !isSubmitting ? "#fff" : "#9ca3af",
                border: "none", padding: "18px 24px", borderRadius: 16, fontWeight: 700, fontSize: 16,
                cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: isFormValid && !isSubmitting ? "0 4px 14px rgba(217,79,122,0.3)" : "none",
              }}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Submitting…
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                  </>
                ) : (
                  `Submit ${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request`
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#D94F7A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
        {number}
      </span>
      {title}
    </h2>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${selected ? "#D94F7A" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", background: selected ? "#D94F7A" : "#fff", flexShrink: 0 }}>
      {selected && <CheckCircle2 size={16} color="#fff" />}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 0, borderTop: "1px dashed #e5e7eb", margin: "0 0 36px 0" }} />;
}