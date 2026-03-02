"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCcw,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  MessageSquare,
  X,
  FileImage,
} from "lucide-react";

// Mock data based on order id
const MOCK_ORDER = {
  "ORD-2024-001": {
    orderId: "ORD-2024-001",
    date: "Feb 6, 2026",
    items: [
      {
        id: "ITEM-1",
        name: "Rose Gold Bracelet",
        variant: "Color: Rose Gold · Size: Medium",
        price: "$89.99",
        image:
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=120&q=80",
        eligible: true,
      },
    ],
  },
  "ORD-2024-002": {
    orderId: "ORD-2024-002",
    date: "Feb 10, 2026",
    items: [
      {
        id: "ITEM-2",
        name: "Pearl Necklace Set",
        variant: "Color: Silver · Style: Classic",
        price: "$129.99",
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&q=80",
        eligible: true,
      },
    ],
  },
};

const REASONS = [
  "Wrong item received",
  "Item defective or damaged",
  "Didn't like the product",
  "Arrived too late",
  "Size/Fit issue",
  "Other",
];

export default function ReturnExchangePage({
  params,
}: {
  params: { id: string };
}) {
  const unwrappedParams = React.use(params as any);
  const idValue = unwrappedParams.id;

  const orderData = MOCK_ORDER[idValue as keyof typeof MOCK_ORDER] || MOCK_ORDER["ORD-2024-001"];

  const [requestType, setRequestType] = useState<"return" | "exchange">("return");
  const [selectedItems, setSelectedItems] = useState<string[]>([orderData.items[0].id]);
  const [reason, setReason] = useState<string>("");
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 3) {
        alert("You can only upload a maximum of 3 photos.");
        return;
      }
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !reason) {
      alert("Please select an item and a reason.");
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 80, fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 16px", textAlign: "center" }}>
          <div style={{
            width: 80,
            height: 80,
            background: "#ecfdf5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <CheckCircle2 color="#10b981" size={40} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 12 }}>Request Successfully Submitted</h1>
          <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>
            Your {requestType} request for Order #{orderData.orderId} has been successfully submitted. Our team will review your request and get back to you within 24-48 hours.
          </p>
          <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginBottom: 32, textAlign: "left" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 16 }}>Request Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>Type</span>
              <span style={{ fontWeight: 600, color: "#111", textTransform: "capitalize" }}>{requestType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>Items</span>
              <span style={{ fontWeight: 600, color: "#111" }}>{selectedItems.length} item(s)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280", fontWeight: 500 }}>Status</span>
              <span style={{ fontWeight: 700, color: "#f59e0b" }}>Under Review</span>
            </div>
          </div>
          <Link href="/profile/orders" style={{
            display: "inline-block",
            background: "#D94F7A",
            color: "#fff",
            padding: "16px 32px",
            borderRadius: 999,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(217, 79, 122, 0.3)",
            transition: "all 0.2s"
          }}>
            Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 100, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link
            href="/profile/orders"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: "#374151",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Return & Exchange
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Order #{orderData.orderId} • {orderData.date}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
          padding: "32px",
          position: "relative"
        }}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Type Selection */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#D94F7A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>1</span>
                What would you like to do?
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setRequestType("return")}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    border: `2px solid ${requestType === "return" ? "#D94F7A" : "#e5e7eb"}`,
                    background: requestType === "return" ? "#fff5f8" : "#f9fafb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                    <RotateCcw size={32} color={requestType === "return" ? "#D94F7A" : "#9ca3af"} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: requestType === "return" ? "#D94F7A" : "#111", marginBottom: 4 }}>
                    Return Item
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Get a refund to your original method</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType("exchange")}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    border: `2px solid ${requestType === "exchange" ? "#D94F7A" : "#e5e7eb"}`,
                    background: requestType === "exchange" ? "#fff5f8" : "#f9fafb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                    <RefreshCcw size={32} color={requestType === "exchange" ? "#D94F7A" : "#9ca3af"} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: requestType === "exchange" ? "#D94F7A" : "#111", marginBottom: 4 }}>
                    Exchange Item
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Swap for a different size or color</div>
                </button>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #e5e7eb", margin: "0 0 36px 0" }} />

            {/* Step 2: Select Items */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#D94F7A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>2</span>
                Select Items
              </h2>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {orderData.items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      borderBottom: index !== orderData.items.length - 1 ? "1px solid #e5e7eb" : "none",
                      cursor: "pointer",
                      background: selectedItems.includes(item.id) ? "#fffafa" : "#f9fafb",
                      transition: "background 0.2s"
                    }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `2px solid ${selectedItems.includes(item.id) ? "#D94F7A" : "#d1d5db"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selectedItems.includes(item.id) ? "#D94F7A" : "#fff"
                    }}>
                      {selectedItems.includes(item.id) && <CheckCircle2 size={16} color="#fff" />}
                    </div>
                    <img src={item.image} alt={item.name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", border: "1px solid #e5e7eb" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{item.variant}</div>
                      <div style={{ fontWeight: 700, color: "#D94F7A" }}>{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #e5e7eb", margin: "0 0 36px 0" }} />

            {/* Step 3: Reason */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#D94F7A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>3</span>
                Reason for {requestType}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 999,
                      border: `1.5px solid ${reason === r ? "#D94F7A" : "#e5e7eb"}`,
                      background: reason === r ? "#D94F7A" : "#f9fafb",
                      color: reason === r ? "#fff" : "#374151",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #e5e7eb", margin: "0 0 36px 0" }} />

            {/* Step 4: Add photos & comments */}
            <div style={{ marginBottom: 8, background: "#f9fafb", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={18} color="#D94F7A" /> Additional Details
              </h2>

              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please provide any additional details that might help us process your request faster..."
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  border: "1.5px solid #d1d5db",
                  background: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                  minHeight: 120,
                  resize: "vertical",
                  marginBottom: 20
                }}
              />

              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                Upload Photos (Optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                multiple
                style={{ display: 'none' }}
              />
              <div
                onClick={() => images.length < 3 && fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  background: images.length >= 3 ? "#f9fafb" : "#fff",
                  cursor: images.length >= 3 ? "not-allowed" : "pointer",
                  transition: "border 0.2s",
                  opacity: images.length >= 3 ? 0.6 : 1
                }}
              >
                <UploadCloud size={32} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: "#4b5563", marginBottom: 4 }}>
                  {images.length >= 3 ? "Maximum files reached" : "Click to upload files"}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Max 3 photos, 5MB each (JPG, PNG)</div>
              </div>

              {/* Render Selected Images */}
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  {images.map((file, idx) => (
                    <div key={idx} style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{ position: "absolute", top: 4, right: 4, zIndex: 10 }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          style={{
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            padding: 4,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`upload-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions (now directly below Upload Files) */}
            <div style={{ marginTop: 32, display: "flex", width: "100%" }}>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={selectedItems.length === 0 || !reason}
                style={{
                  flex: 1,
                  background: selectedItems.length === 0 || !reason ? "#f3f4f6" : "#D94F7A",
                  color: selectedItems.length === 0 || !reason ? "#9ca3af" : "#fff",
                  border: "none",
                  padding: "18px 24px",
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: selectedItems.length === 0 || !reason ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: selectedItems.length > 0 && reason ? "0 4px 14px rgba(217, 79, 122, 0.3)" : "none"
                }}
              >
                Submit {requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
