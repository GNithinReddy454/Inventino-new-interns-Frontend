"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Home,
} from "lucide-react";

const TRACKING_DATA: Record<
  string,
  {
    orderId: string;
    product: string;
    estimatedDelivery: string;
    carrier: string;
    trackingNumber: string;
    steps: { label: string; date: string; done: boolean; active: boolean }[];
  }
> = {
  "ORD-2024-001": {
    orderId: "#ORD-2024-001",
    product: "Rose Gold Bracelet",
    estimatedDelivery: "Feb 8, 2026",
    carrier: "FedEx",
    trackingNumber: "FX-928374650",
    steps: [
      {
        label: "Order Placed",
        date: "Feb 6, 2026 · 10:30 AM",
        done: true,
        active: false,
      },
      {
        label: "Order Confirmed",
        date: "Feb 6, 2026 · 11:00 AM",
        done: true,
        active: false,
      },
      {
        label: "Shipped",
        date: "Feb 7, 2026 · 2:00 PM",
        done: true,
        active: false,
      },
      {
        label: "Out for Delivery",
        date: "Feb 8, 2026 · 9:00 AM",
        done: true,
        active: false,
      },
      {
        label: "Delivered",
        date: "Feb 8, 2026 · 1:45 PM",
        done: true,
        active: true,
      },
    ],
  },
  "ORD-2024-002": {
    orderId: "#ORD-2024-002",
    product: "Pearl Necklace Set",
    estimatedDelivery: "Feb 14, 2026",
    carrier: "DHL",
    trackingNumber: "DH-374829103",
    steps: [
      {
        label: "Order Placed",
        date: "Feb 10, 2026 · 9:15 AM",
        done: true,
        active: false,
      },
      {
        label: "Order Confirmed",
        date: "Feb 10, 2026 · 10:00 AM",
        done: true,
        active: false,
      },
      {
        label: "Shipped",
        date: "Feb 11, 2026 · 3:00 PM",
        done: true,
        active: true,
      },
      {
        label: "Out for Delivery",
        date: "Expected Feb 14, 2026",
        done: false,
        active: false,
      },
      {
        label: "Delivered",
        date: "Expected Feb 14, 2026",
        done: false,
        active: false,
      },
    ],
  },
  "ORD-2024-003": {
    orderId: "#ORD-2024-003",
    product: "Boho Beaded Set",
    estimatedDelivery: "Feb 18, 2026",
    carrier: "UPS",
    trackingNumber: "UP-192837465",
    steps: [
      {
        label: "Order Placed",
        date: "Feb 13, 2026 · 8:00 AM",
        done: true,
        active: false,
      },
      {
        label: "Order Confirmed",
        date: "Feb 13, 2026 · 9:00 AM",
        done: true,
        active: true,
      },
      {
        label: "Shipped",
        date: "Expected Feb 15, 2026",
        done: false,
        active: false,
      },
      {
        label: "Out for Delivery",
        date: "Expected Feb 17, 2026",
        done: false,
        active: false,
      },
      {
        label: "Delivered",
        date: "Expected Feb 18, 2026",
        done: false,
        active: false,
      },
    ],
  },
};

const stepIcons = [Package, CheckCircle2, Truck, Truck, Home];

export default function TrackingPage({ params }: { params: { id: string } }) {
  const data = TRACKING_DATA[params.id] ?? TRACKING_DATA["ORD-2024-001"];

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
        {/* Header */}
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
            Order Tracking
          </h1>
        </div>

        {/* Order info card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #fce7f3",
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 16,
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
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {data.orderId}
              </p>
            </div>
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
                Product
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                {data.product}
              </p>
            </div>
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
                Carrier
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                {data.carrier}
              </p>
            </div>
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
                Tracking No.
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#D94F7A" }}>
                {data.trackingNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Estimated delivery banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #D94F7A, #f472b6)",
            borderRadius: 16,
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <MapPin size={20} color="#fff" />
          <div>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
              }}
            >
              Estimated Delivery
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {data.estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Tracking steps */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #fce7f3",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#111",
              marginBottom: 24,
            }}
          >
            Tracking Timeline
          </h2>
          <div style={{ position: "relative" }}>
            {data.steps.map((step, i) => {
              const Icon = stepIcons[i];
              const isLast = i === data.steps.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 16,
                    position: "relative",
                    paddingBottom: isLast ? 0 : 28,
                  }}
                >
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      style={{
                        position: "absolute",
                        left: 17,
                        top: 36,
                        bottom: 0,
                        width: 2,
                        background: step.done ? "#D94F7A" : "#f3f4f6",
                      }}
                    />
                  )}
                  {/* Icon circle */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: step.active
                        ? "#D94F7A"
                        : step.done
                          ? "#fce7f3"
                          : "#f9fafb",
                      border: `2px solid ${step.active ? "#D94F7A" : step.done ? "#f9a8d4" : "#e5e7eb"}`,
                    }}
                  >
                    <Icon
                      size={16}
                      color={
                        step.active ? "#fff" : step.done ? "#D94F7A" : "#9ca3af"
                      }
                    />
                  </div>
                  {/* Label + date */}
                  <div style={{ paddingTop: 6 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: step.active ? 700 : step.done ? 600 : 500,
                        color: step.active
                          ? "#D94F7A"
                          : step.done
                            ? "#111"
                            : "#9ca3af",
                        marginBottom: 2,
                      }}
                    >
                      {step.label}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      {step.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
