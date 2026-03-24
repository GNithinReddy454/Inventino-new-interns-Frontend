"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image  from "next/image";
import { ArrowLeft, Truck, RotateCcw, Loader2, AlertCircle, MapPin, CreditCard, Calendar } from "lucide-react";
import { orderService } from "@/services/order.service";
import { OrderData, statusColors } from "@/types/orderid";

function getStatusStyle(status: string) {
  const key = status?.toLowerCase();
  return statusColors[key] ?? statusColors["created"];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getOrderById(id);
        const rawOrder = response.data;
        
        // Normalize pricing with fallbacks
        if (rawOrder && rawOrder.pricing) {
          const subtotal = Number(rawOrder.subtotal ?? rawOrder.pricing.subtotal ?? 0);
          const total = Number(rawOrder.total_amount ?? rawOrder.total ?? rawOrder.pricing.total ?? 0);
          
          const localDiscounts = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("order_discounts") || "{}") : {};
          const localDiscountPercent = localDiscounts[rawOrder.orderNumber] || localDiscounts[rawOrder?._id] || 0;

          let discount = Number(rawOrder.discount ?? rawOrder.discountAmount ?? rawOrder.pricing.discount ?? 0);
          
          if (discount === 0 && subtotal > total && subtotal > 0) {
            discount = subtotal - total;
          }
          
          if (discount === 0 && localDiscountPercent > 0 && subtotal > 0) {
            discount = subtotal * (localDiscountPercent / 100);
          }
          
          rawOrder.pricing = {
            ...rawOrder.pricing,
            subtotal,
            total: (discount > 0 && total === subtotal) ? subtotal - discount : total,
            discount
          };
          
          if (localDiscountPercent > 0) {
            (rawOrder as any).promoCode = "SESSION_PROMO";
          }
        }
        
        setOrder(rawOrder);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const s = order ? getStatusStyle(order.status) : statusColors["created"];

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

        {/* Loading state */}
        {loading && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #fce7f3",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              color: "#9ca3af",
            }}
          >
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#D94F7A" }} />
            <p style={{ fontSize: 14 }}>Loading order details...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #fce7f3",
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              color: "#6b7280",
            }}
          >
            <AlertCircle size={28} color="#D94F7A" />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
              Unable to load order
            </p>
            <p style={{ fontSize: 13, textAlign: "center" }}>{error}</p>
          </div>
        )}

        {/* Order content */}
        {!loading && !error && order && (
          <>
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
                    #{order.orderNumber}
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
                  {s.label}
                </span>
              </div>
              
              {/* Order Date */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={14} color="#9ca3af" />
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  Ordered on {formatDate(order.createdAt)}
                </p>
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
                Items Ordered ({order.items.length})
              </h2>
              {order.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: i !== order.items.length - 1 ? 16 : 0,
                    marginBottom: i !== order.items.length - 1 ? 16 : 0,
                    borderBottom: i !== order.items.length - 1 ? "1px solid #fef3f7" : "none",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {item.imageUrl || item.product?.images?.[0]?.url ? (
                      <Image
                        width={70}
                        height={70}
                        src={item.imageUrl || item.product?.images[0]?.url}
                        alt={item.name}
                        style={{
                          borderRadius: 10,
                          background: "#fdf2f7",
                          border: "1px solid #fce7f3",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 10,
                          background: "#fdf2f7",
                          border: "1px solid #fce7f3",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      Quantity: {item.quantity}
                    </p>
                    {item.product?.discountPrice && item.product.discountPrice < item.product.price && (
                      <p style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>
                        {Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)}% off
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>
                      ₹{item.price.toLocaleString("en-IN")} each
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Price Breakdown */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #fef3f7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</p>
                  <p style={{ fontSize: 13, color: "#111" }}>₹{order.pricing.subtotal.toLocaleString("en-IN")}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>Discount</p>
                    {(order.pricing.discount > 0 || (order as any).promoCode || (order as any).code) && (
                      <p style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>
                        ({(order.pricing.discount > 0 && order.pricing.subtotal > 0) ? Math.round((order.pricing.discount / order.pricing.subtotal) * 100) : 10}% Applied)
                      </p>
                    )}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: order.pricing.discount > 0 ? "#059669" : "#111" }}>
                    {order.pricing.discount > 0 
                      ? `-₹${order.pricing.discount.toLocaleString("en-IN")}` 
                      : "₹0"}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Shipping</p>
                  <p style={{ fontSize: 13, color: "#111" }}>
                    {order.pricing.shipping > 0 ? `₹${order.pricing.shipping.toLocaleString("en-IN")}` : "Free"}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>GST</p>
                  <p style={{ fontSize: 13, color: "#111" }}>
                    ₹{order.pricing.tax.toLocaleString("en-IN")} 
                    {order.pricing.tax > 0 && ` (${Math.round((order.pricing.tax / (order.pricing.subtotal || 1)) * 100)}%)`}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #fce7f3" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Total</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#D94F7A" }}>
                    ₹{order.pricing.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #fce7f3",
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MapPin size={16} color="#D94F7A" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                  Shipping Address
                </h2>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                {order.shippingAddress.fullName}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
                {order.shippingAddress.street}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
                {order.shippingAddress.country}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
                Phone: {order.shippingAddress.phone}
              </p>
            </div>

            {/* Payment Information */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #fce7f3",
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <CreditCard size={16} color="#D94F7A" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                  Payment Information
                </h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: "#6b7280" }}>Method</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                  {order.payment.method === "COD" ? "Cash on Delivery" : order.payment.method}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: "#6b7280" }}>Payment Status</p>
                <p style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: order.payment.status === "completed" ? "#059669" : "#c2410c" 
                }}>
                  {order.payment.status === "pending" ? "Pending" : order.payment.status}
                </p>
              </div>
              {order.payment.transactionId && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Transaction ID</p>
                  <p style={{ fontSize: 13, color: "#111" }}>{order.payment.transactionId}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {order.items.length > 0 && (
                <Link
                  href={`/products/${order.items[0].productId || order.items[0].product?._id}`}
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
                  <Truck size={14} /> ReOrder
                </Link>
              )}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <Link
                  href={`/profile/orders/cancel/${id}`}
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
                  <RotateCcw size={14} /> Cancel Order
                </Link>
              )}
              {order.status === "delivered" && (
                <Link
                  onClick={() => {
                    sessionStorage.setItem("returnExchangeOrder", JSON.stringify(order));
                  }}
                  href={`/profile/orders/return/${id}`}
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}