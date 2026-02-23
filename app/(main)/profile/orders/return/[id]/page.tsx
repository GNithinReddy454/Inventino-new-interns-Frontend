"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const REASONS = [
  "Item damaged or defective",
  "Wrong item received",
  "Item doesn't match description",
  "Changed my mind",
  "Size/fit issue",
  "Quality not as expected",
  "Other",
];

export default function ReturnPage({ params }: { params: { id: string } }) {
  const [type, setType] = useState<"return" | "exchange">("return");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ background: "#fdf8f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Roboto, sans-serif", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #fce7f3", padding: "48px 32px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Request Submitted!</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Your {type} request for order <strong>{params.id.replace(/-/g, "-").toUpperCase()}</strong> has been received. We'll contact you within 24–48 hours.</p>
          <Link href="/profile/orders" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 10, background: "#D94F7A", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 80, fontFamily: "Roboto, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/profile/orders" style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "1px solid #fce7f3", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#D94F7A" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Return / Exchange</h1>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", padding: "28px 24px" }}>

          {/* Type toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28, background: "#fdf2f7", borderRadius: 12, padding: 4 }}>
            {(["return", "exchange"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: type === t ? "#D94F7A" : "transparent", color: type === t ? "#fff" : "#9ca3af", transition: "all 0.2s" }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                Reason for {type} <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select required value={reason} onChange={(e) => setReason(e.target.value)}
                style={{ width: "100%", height: 44, borderRadius: 8, border: "1px solid #fce7f3", background: "rgba(253,242,248,0.4)", padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", color: reason ? "#111" : "#9ca3af" }}>
                <option value="">Select a reason</option>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                Additional Details
              </label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe the issue in more detail..."
                style={{ width: "100%", borderRadius: 8, border: "1px solid #fce7f3", background: "rgba(253,242,248,0.4)", padding: "10px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ fontSize: 12, color: "#92400e", fontWeight: 500 }}>
                📦 Please keep the original packaging. Our team will arrange a pickup within 2–3 business days after approval.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: "#D94F7A", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Submit {type.charAt(0).toUpperCase() + type.slice(1)} Request
              </button>
              <Link href="/profile/orders" style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", color: "#6b7280", textDecoration: "none", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center" }}>
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
