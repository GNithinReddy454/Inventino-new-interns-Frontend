"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { orderService } from "@/services/order.service";
import { OrderData } from "@/types/orderid";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> | any }) {
    const unwrappedParams = React.use(params as Promise<{ id: string }>);
    const orderId = unwrappedParams.id;

    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrder() {
            try {
                setLoading(true);
                const response = await orderService.getOrderById(orderId);
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
                    
                    // Promo field mapping
                    const promoCodeValue = rawOrder.promoCode || rawOrder.code || rawOrder.promo_code || rawOrder.coupon || rawOrder.pricing?.code || rawOrder.pricing?.promoCode;
                    const discountPercentValue = (subtotal > 0 && discount > 0) 
                        ? Math.round((discount / subtotal) * 100) 
                        : promoCodeValue ? 10 : 0;

                    rawOrder.pricing = {
                        ...rawOrder.pricing,
                        subtotal,
                        total: (discount > 0 && total === subtotal) ? subtotal - discount : total,
                        discount,
                        discountPercent: discountPercentValue,
                        promoCode: promoCodeValue
                    };
                }

                setOrder(rawOrder);
            } catch (err: any) {
                setError(err.message || "Failed to load invoice.");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={32} color="#D94F7A" style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <p style={{ color: "red" }}>{error || "Order not found"}</p>
                <Link href="/profile/orders">Back to Orders</Link>
            </div>
        );
    }

    const { items, pricing, shippingAddress, payment, orderNumber, createdAt } = order;

    return (
        <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 60, fontFamily: "Inter, sans-serif" }}>
            <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}</style>

            <div className="no-print" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                        href={`/profile/orders/${orderId}`}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            textDecoration: "none",
                            color: "#6b7280",
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Order
                    </Link>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#fff",
                                border: "1px solid #e5e7eb",
                                padding: "10px 16px",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#374151",
                                cursor: "pointer",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        >
                            <Printer size={16} /> Print
                        </button>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#D94F7A",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#fff",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(217, 79, 122, 0.25)"
                            }}
                        >
                            <Download size={16} /> Save PDF
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
                <div
                    className="print-card"
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
                        padding: "48px",
                        color: "#111"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: "#D94F7A", letterSpacing: "-0.03em", marginBottom: 8 }}>
                                Inventino<span style={{ color: "#111" }}>Jewels</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                                123 Jewelry District<br />
                                Mumbai, MH 400001<br />
                                support@inventinojewels.com<br />
                                +91 800-123-4567
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", marginBottom: 8 }}>INVOICE</div>
                            <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%", maxWidth: 200, marginLeft: "auto" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "4px 0", color: "#6b7280", fontWeight: 500, textAlign: "left" }}>Order ID:</td>
                                        <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>#{orderNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px 0", color: "#6b7280", fontWeight: 500, textAlign: "left" }}>Invoice Date:</td>
                                        <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{new Date(createdAt).toLocaleDateString("en-IN")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Billed & Shipped To</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{shippingAddress.fullName}</div>
                            <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                                {shippingAddress.street}<br />
                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}<br />
                                {shippingAddress.country}
                            </div>
                            <div style={{ fontSize: 14, color: "#4b5563", marginTop: 4 }}>{shippingAddress.phone}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Payment Info</div>
                           <div style={{ fontSize: 14, color: "#4b5563" }}>Method: <strong>{payment.method}</strong></div>
                           <div style={{ fontSize: 14, color: "#4b5563" }}>Status: <strong style={{ color: "#059669" }}>{payment.status.toUpperCase()}</strong></div>
                        </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: "12px 0", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Description</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", width: 80 }}>Qty</th>
                                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", width: 100 }}>Unit Price</th>
                                <th style={{ padding: "12px 0", textAlign: "right", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", width: 100 }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "20px 0" }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{item.name}</div>
                                    </td>
                                    <td style={{ padding: "20px 16px", textAlign: "right", fontSize: 14, color: "#374151" }}>{item.quantity}</td>
                                    <td style={{ padding: "20px 16px", textAlign: "right", fontSize: 14, color: "#374151" }}>₹{item.price.toLocaleString("en-IN")}</td>
                                    <td style={{ padding: "20px 0", textAlign: "right", fontSize: 14, fontWeight: 600, color: "#111" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ flex: 1, paddingRight: 48 }}>
                            <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                                Thank you for your business! This is a system generated invoice. For any support, please contact help@inventinojewels.com
                            </div>
                        </div>

                        <div style={{ width: 280 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left" }}>Subtotal</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right" }}>₹{pricing.subtotal.toLocaleString("en-IN")}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left" }}>
                                            <div>Discount</div>
                                            <div>Discount</div>
                                            {((pricing as any).discount > 0 || (pricing as any).discountPercent > 0 || (pricing as any).promoCode) && (
                                                <div style={{ fontSize: "10px", color: "#059669" }}>
                                                    ({(pricing as any).discountPercent || 10}% Applied)
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: pricing.discount > 0 ? "#059669" : "#111", textAlign: "right", verticalAlign: "top" }}>
                                            {pricing.discount > 0 
                                                ? `-₹${pricing.discount.toLocaleString("en-IN")}` 
                                                : "₹0"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left" }}>Shipping</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right" }}>
                                            {pricing.shipping > 0 ? `₹${pricing.shipping.toLocaleString("en-IN")}` : "Free"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>GST</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>
                                            ₹{pricing.tax.toLocaleString("en-IN")}
                                            {pricing.tax > 0 && ` (${Math.round((pricing.tax / (pricing.subtotal || 1)) * 100)}%)`}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "16px 0 0", color: "#111", fontWeight: 800, fontSize: 16, textAlign: "left" }}>Grand Total</td>
                                        <td style={{ padding: "16px 0 0", fontWeight: 800, fontSize: 20, color: "#D94F7A", textAlign: "right" }}>₹{pricing.total.toLocaleString("en-IN")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
