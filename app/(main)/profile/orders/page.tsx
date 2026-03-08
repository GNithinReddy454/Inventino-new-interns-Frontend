"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  RotateCcw,
  Star,
  Truck,
  MapPin,
  XCircle,
  Phone,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { orderService } from "@/services/order.service";

type TabType = "all" | "delivered" | "cancelled";
type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Cancelled";

interface OrderItem {
  name: string;
  variant: string;
  price: string;
  image: string;
}

interface Order {
  id: string;        // orderNumber — used for display only
  backendId: string; // MongoDB _id — used for ALL API calls & links
  date: string;
  total: string;
  status: OrderStatus;
  items: OrderItem[];
  _raw: any;         // full raw API order — passed to Return/Exchange page
}

const API_STATUS_MAP: Record<string, OrderStatus> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  created: "Processing",
  pending: "Processing",
  confirmed: "Processing",
  out_for_delivery: "Shipped",
  in_transit: "Shipped",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  refunded: "Cancelled",
  returned: "Cancelled",
};

const statusConfig = {
  Delivered: {
    dot: "#10b981",
    badge: { color: "#059669", background: "#ecfdf5" },
  },
  Shipped: {
    dot: "#3b82f6",
    badge: { color: "#1d4ed8", background: "#eff6ff" },
  },
  Processing: {
    dot: "#f97316",
    badge: { color: "#c2410c", background: "#fff7ed" },
  },
  Cancelled: {
    dot: "#ef4444",
    badge: { color: "#b91c1c", background: "#fef2f2" },
  },
};

function mapApiOrder(apiOrder: any): Order {
  const rawStatus = (apiOrder.status ?? "").toLowerCase().trim();
  const mappedStatus: OrderStatus = API_STATUS_MAP[rawStatus] ?? "Processing";

  return {
    id: apiOrder.orderNumber,
    backendId: apiOrder._id ?? apiOrder.id ?? apiOrder.orderNumber,
    date: new Date(apiOrder.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    total: `₹${Number(apiOrder.pricing?.total ?? 0).toFixed(2)}`,
    status: mappedStatus,
    items: (apiOrder.items ?? []).map((item: any) => ({
      name: item.name ?? "Product",
      variant: `Qty: ${item.quantity ?? 1}`,
      price: `₹${Number(item.price).toFixed(2)}`,
      image: item.imageUrl ?? "",
    })),
    _raw: apiOrder, // preserve full raw order for passing to Return/Exchange page
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      if (response?.data && Array.isArray(response.data)) {
        setOrders(response.data.map(mapApiOrder));
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "all") fetchOrders();
  };

  const filtered = orders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "delivered") return o.status === "Delivered";
    if (activeTab === "cancelled") return o.status === "Cancelled";
    return true;
  });

  // Store full raw order in sessionStorage, then navigate to Return/Exchange page
  const handleReturnExchange = (order: Order) => {
    sessionStorage.setItem("returnExchangeOrder", JSON.stringify(order._raw));
    router.push(`/profile/orders/return/${order.backendId}`);
  };

  const handleCancelOrder = async (orderNumber: string) => {
    const order = orders.find((o) => o.id === orderNumber);
    if (!order) return;

    try {
      setCancelLoading(true);
      await orderService.cancelOrder(order.backendId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderNumber ? { ...o, status: "Cancelled" as OrderStatus } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancelLoading(false);
      setCancellingId(null);
    }
  };

  return (
    <div
      style={{
        background: "#fdf8f9",
        minHeight: "100vh",
        paddingBottom: 80,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
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
            href="/profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #fce7f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D94F7A",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                marginBottom: 4,
              }}
            >
              My Orders
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              Track, manage, and view all your orders
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["all", "delivered", "cancelled"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                border: "1.5px solid",
                background: activeTab === tab ? "#D94F7A" : "#fff",
                color: activeTab === tab ? "#fff" : "#6b7280",
                borderColor: activeTab === tab ? "#D94F7A" : "#e5e7eb",
              }}
            >
              {tab === "all"
                ? "All Orders"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #fce7f3",
              padding: "48px 24px",
              textAlign: "center",
              color: "#D94F7A",
              fontSize: 14,
            }}
          >
            Loading your orders...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #fce7f3",
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                No orders found.
              </div>
            )}

            {filtered.map((order) => {
              const s = statusConfig[order.status];
              return (
                <div
                  key={order.backendId || order.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #fce7f3",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 24,
                      padding: "16px 24px",
                      borderBottom: "1px solid #fef3f7",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 3,
                        }}
                      >
                        Order ID
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
                        #{order.id}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 3,
                        }}
                      >
                        Order Date
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {order.date}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 3,
                        }}
                      >
                        Total Amount
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#E8456A",
                        }}
                      >
                        {order.total}
                      </p>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          ...s.badge,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: s.dot,
                            flexShrink: 0,
                          }}
                        />
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: "16px 24px" }}>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: 16 }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 10,
                              objectFit: "cover",
                              border: "1px solid #fce7f3",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
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
                        )}
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#111",
                              marginBottom: 3,
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#9ca3af",
                              marginBottom: 3,
                            }}
                          >
                            {item.variant}
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#E8456A",
                            }}
                          >
                            {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div
                    style={{
                      borderTop: "1px solid #fef3f7",
                      display: "grid",
                      gridTemplateColumns:
                        order.status === "Delivered"
                          ? "repeat(4,1fr)"
                          : order.status === "Shipped"
                            ? "repeat(3,1fr)"
                            : order.status === "Processing"
                              ? "repeat(3,1fr)"
                              : "1fr",
                    }}
                  >
                    {/* ── Delivered ── */}
                    {order.status === "Delivered" && (
                      <>
                        <Link
                          href={`/profile/orders/${order.backendId}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                            background: "#D94F7A",
                            color: "#fff",
                            borderRight: "1px solid #fce7f3",
                          }}
                        >
                          <Eye size={13} /> View Details
                        </Link>
                        <button
                          onClick={() =>
                            window.open(
                              `/profile/orders/invoice/${order.backendId}`,
                              "_blank",
                            )
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "#fff",
                            color: "#374151",
                            border: "none",
                            borderRight: "1px solid #fce7f3",
                            fontFamily: "inherit",
                          }}
                        >
                          <FileText size={13} /> Download Invoice
                        </button>
                        {/* ── Return/Exchange: uses handleReturnExchange to pass order data ── */}
                        <button
                          onClick={() => handleReturnExchange(order)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "#fff",
                            color: "#374151",
                            border: "none",
                            borderRight: "1px solid #fce7f3",
                            fontFamily: "inherit",
                          }}
                        >
                          <RotateCcw size={13} /> Return/Exchange
                        </button>
                        <Link
                          href={`/profile/reviews/write?orderId=${order.backendId}&productName=${encodeURIComponent(order.items[0]?.name ?? "")}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "#374151",
                          }}
                        >
                          <Star size={13} /> Write Review
                        </Link>
                      </>
                    )}

                    {/* ── Shipped ── */}
                    {order.status === "Shipped" && (
                      <>
                        <Link
                          href={`/profile/tracking/${order.backendId}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                            background: "#D94F7A",
                            color: "#fff",
                            borderRight: "1px solid #fce7f3",
                          }}
                        >
                          <Truck size={13} /> Track Order
                        </Link>
                        <Link
                          href={`/profile/orders/${order.backendId}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "#374151",
                            borderRight: "1px solid #fce7f3",
                          }}
                        >
                          <Eye size={13} /> View Details
                        </Link>
                        <Link
                          href="/contact"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "#374151",
                          }}
                        >
                          <Phone size={13} /> Contact Seller
                        </Link>
                      </>
                    )}

                    {/* ── Processing ── */}
                    {order.status === "Processing" && (
                      <>
                        <button
                          onClick={() => setCancellingId(order.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "#fff",
                            color: "#374151",
                            border: "none",
                            borderRight: "1px solid #fce7f3",
                            fontFamily: "inherit",
                          }}
                        >
                          <XCircle size={13} /> Cancel Order
                        </button>
                        <Link
                          href="/profile/addresses"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "#374151",
                            borderRight: "1px solid #fce7f3",
                          }}
                        >
                          <MapPin size={13} /> Modify Address
                        </Link>
                        <Link
                          href="/contact"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "12px 8px",
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "#374151",
                          }}
                        >
                          <Phone size={13} /> Contact Support
                        </Link>
                      </>
                    )}

                    {/* ── Cancelled ── */}
                    {order.status === "Cancelled" && (
                      <div
                        style={{
                          padding: "12px 24px",
                          fontSize: 12,
                          color: "#9ca3af",
                          fontStyle: "italic",
                        }}
                      >
                        This order has been cancelled.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111",
                marginBottom: 8,
              }}
            >
              Cancel Order?
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Are you sure you want to cancel order{" "}
              <strong>#{cancellingId}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setCancellingId(null)}
                disabled={cancelLoading}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: cancelLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: cancelLoading ? 0.6 : 1,
                }}
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(cancellingId)}
                disabled={cancelLoading}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: cancelLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: cancelLoading ? 0.7 : 1,
                }}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}