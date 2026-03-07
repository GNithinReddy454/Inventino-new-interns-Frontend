"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Truck, FileText, RotateCcw } from "lucide-react";

// ── Keys have NO "#" — params.id from Next.js never includes it ──────────────
const ORDERS: Record<
  string,
  {
    displayId: string;
    date: string;
    total: string;
    status: string;
    address: string;
    paymentMethod: string;
    items: { name: string; variant: string; price: string; qty: number }[];
  }
> = {
  "ORD-2024-001": {
    displayId: "#ORD-2024-001",
    date: "Feb 6, 2026",
    total: "$89.99",
    status: "Delivered",
    address: "123 Main St, New York, NY 10001",
    paymentMethod: "Visa •••• 4532",
    items: [
      {
        name: "Rose Gold Bracelet",
        variant: "Color: Rose Gold · Size: Medium",
        price: "$89.99",
        qty: 1,
      },
    ],
  },
  "ORD-2024-002": {
    displayId: "#ORD-2024-002",
    date: "Feb 10, 2026",
    total: "$129.99",
    status: "Shipped",
    address: "123 Main St, New York, NY 10001",
    paymentMethod: "Mastercard •••• 8765",
    items: [
      {
        name: "Pearl Necklace Set",
        variant: "Color: Silver · Style: Classic",
        price: "$129.99",
        qty: 1,
      },
    ],
  },
  "ORD-2024-003": {
    displayId: "#ORD-2024-003",
    date: "Feb 13, 2026",
    total: "$44.99",
    status: "Processing",
    address: "123 Main St, New York, NY 10001",
    paymentMethod: "Visa •••• 4532",
    items: [
      {
        name: "Boho Beaded Set",
        variant: "Color: Gold · Quantity: 1",
        price: "$44.99",
        qty: 1,
      },
    ],
  },
};

const statusColors: Record<
  string,
  { color: string; background: string; dot: string }
> = {
  Delivered: { color: "#059669", background: "#ecfdf5", dot: "#10b981" },
  Shipped: { color: "#1d4ed8", background: "#eff6ff", dot: "#3b82f6" },
  Processing: { color: "#c2410c", background: "#fff7ed", dot: "#f97316" },
};

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // params.id = "ORD-2024-001" (no #)
  const order = ORDERS[params.id] ?? ORDERS["ORD-2024-002"];
  const s = statusColors[order.status] ?? statusColors["Shipped"];

  return (
    <div
      style={{
        background: "#fdf8f9",
        minHeight: "100vh",
        paddingBottom: 80,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {/* Back + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Link
            href="/profile/orders"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #fce7f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: "#D94F7A",
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>
            Order Details
          </h1>
        </div>

        {/* Status banner */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #fce7f3",
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Order ID
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                {order.displayId}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                Placed on {order.date}
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: s.color,
                background: s.background,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: s.dot,
                }}
              />
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #fce7f3",
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111",
              marginBottom: 16,
            }}
          >
            Items Ordered
          </h2>
          {order.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingBottom: 12,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  background: "#fdf2f7",
                  border: "1px solid #fce7f3",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                  {item.name}
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {item.variant}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  Qty: {item.qty}
                </p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {item.price}
              </p>
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid #fef3f7",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              Total
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#D94F7A" }}>
              {order.total}
            </p>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #fce7f3",
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Delivery Address
            </p>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
              {order.address}
            </p>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #fce7f3",
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Payment Method
            </p>
            <p style={{ fontSize: 13, color: "#374151" }}>
              {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* ✅ Fixed: /profile/tracking/[id] — not /profile/orders/tracking/[id] */}
          <Link
            href={`/profile/tracking/${params.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "#D94F7A",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Truck size={14} /> Track Order
          </Link>
          <Link
            href={`/profile/orders/return/${params.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              border: "1.5px solid #fce7f3",
              color: "#374151",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <RotateCcw size={14} /> Return/Exchange
          </Link>
        </div>
      </div>
    </div>
  );
}
