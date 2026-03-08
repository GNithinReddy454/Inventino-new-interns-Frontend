"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Home,
} from "lucide-react";
import apiClient from "@/lib/api";

// Status to step index mapping
const STATUS_STEP_MAP: Record<string, number> = {
  placed: 0,
  confirmed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
};

const buildSteps = (status: string) => {
  const activeIndex = STATUS_STEP_MAP[status] ?? 0;

  const stepDefs = [
    { label: "Order Placed", expectedDate: "" },
    { label: "Order Confirmed", expectedDate: "" },
    { label: "Shipped", expectedDate: "" },
    { label: "Out for Delivery", expectedDate: "" },
    { label: "Delivered", expectedDate: "" },
  ];

  return stepDefs.map((step, i) => ({
    label: step.label,
    date:
      i <= activeIndex
        ? "Completed"
        : "Pending",
    done: i <= activeIndex,
    active: i === activeIndex,
  }));
};

type TrackingData = {
  orderId: string;
  product: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  steps: { label: string; date: string; done: boolean; active: boolean }[];
};

const stepIcons = [Package, CheckCircle2, Truck, Truck, Home];

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/orders/${id}/tracking`);
        const apiData = response.data?.data;

        setData({
          orderId: `#${apiData.orderNumber}`,
          product: apiData.product ?? "—",
          estimatedDelivery: apiData.estimatedDelivery ?? "—",
          carrier: apiData.carrier ?? "—",
          trackingNumber: apiData.trackingNumber ?? "—",
          steps: apiData.steps
            ? apiData.steps.map((s: any) => ({
                label: s.label,
                date: s.date,
                done: s.done,
                active: s.active,
              }))
            : buildSteps(apiData.status ?? "placed"),
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message ?? "Failed to fetch tracking details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [id]);

  // ── Loading state ──
  if (loading) {
    return (
      <div
        style={{
          background: "#fdf8f9",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          Loading tracking details…
        </p>
      </div>
    );
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <div
        style={{
          background: "#fdf8f9",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Roboto, sans-serif",
          gap: 12,
        }}
      >
        <p style={{ color: "#D94F7A", fontSize: 14 }}>
          {error ?? "Something went wrong."}
        </p>
        <Link
          href="/profile/orders"
          style={{ fontSize: 13, color: "#9ca3af", textDecoration: "underline" }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // ── Main UI (unchanged) ──
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