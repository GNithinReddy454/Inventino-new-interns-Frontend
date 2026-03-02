"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";

// Mock data matching other order pages
const MOCK_INVOICE_DATA: Record<string, any> = {
    "ORD-2024-001": {
        orderId: "ORD-2024-001",
        date: "Feb 6, 2026",
        paymentMethod: "Visa ending in •••• 4242",
        billingDetails: {
            name: "Jane Doe",
            email: "jane.doe@example.com",
            address: "123 Magnolia Ave, Apartment 4B",
            city: "New York, NY",
            zip: "10001",
            country: "United States"
        },
        shippingDetails: {
            name: "Jane Doe",
            address: "123 Magnolia Ave, Apartment 4B",
            city: "New York, NY",
            zip: "10001",
            country: "United States"
        },
        items: [
            {
                id: "ITEM-1",
                name: "Rose Gold Bracelet",
                sku: "B-RG-M-001",
                variant: "Color: Rose Gold · Size: Medium",
                price: 89.99,
                quantity: 1,
            },
        ],
        subtotal: 89.99,
        tax: 4.50,
        shipping: 0.00,
        total: 94.49,
    },
    "ORD-2024-002": {
        orderId: "ORD-2024-002",
        date: "Feb 10, 2026",
        paymentMethod: "Mastercard ending in •••• 8831",
        billingDetails: {
            name: "John Smith",
            email: "john.smith@example.com",
            address: "456 Oak Street",
            city: "San Francisco, CA",
            zip: "94107",
            country: "United States"
        },
        shippingDetails: {
            name: "John Smith",
            address: "456 Oak Street",
            city: "San Francisco, CA",
            zip: "94107",
            country: "United States"
        },
        items: [
            {
                id: "ITEM-2",
                name: "Pearl Necklace Set",
                sku: "N-PL-S-004",
                variant: "Color: Silver · Style: Classic",
                price: 129.99,
                quantity: 1,
            },
        ],
        subtotal: 129.99,
        tax: 6.50,
        shipping: 5.00,
        total: 141.49,
    },
};

export default function InvoicePage({ params }: { params: { id: string } }) {
    const unwrappedParams = React.use(params as any);
    const idValue = unwrappedParams.id;

    const invoice = MOCK_INVOICE_DATA[idValue as keyof typeof MOCK_INVOICE_DATA] || MOCK_INVOICE_DATA["ORD-2024-001"];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 60, fontFamily: "Inter, sans-serif" }}>
            {/* Non-printable header actions */}
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
                        href="/profile/orders"
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
                        <ArrowLeft size={16} /> Back to Orders
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
                            onClick={handlePrint} // same action, just labelled download
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

            {/* Invoice Document Main Area */}
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
                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
                        <div>
                            {/* Fake logo / Brand name */}
                            <div style={{ fontSize: 28, fontWeight: 900, color: "#D94F7A", letterSpacing: "-0.03em", marginBottom: 8 }}>
                                Inventino<span style={{ color: "#111" }}>Jewels</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                                123 Jewelry District<br />
                                Los Angeles, CA 90014<br />
                                support@inventinojewels.com<br />
                                +1 (800) 123-4567
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", marginBottom: 8 }}>INVOICE</div>
                            <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%", maxWidth: 200, marginLeft: "auto" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "4px 0", color: "#6b7280", fontWeight: 500, textAlign: "left" }}>Invoice No:</td>
                                        <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{invoice.orderId.replace('ORD-', 'INV-')}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px 0", color: "#6b7280", fontWeight: 500, textAlign: "left" }}>Order ID:</td>
                                        <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{invoice.orderId}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "4px 0", color: "#6b7280", fontWeight: 500, textAlign: "left" }}>Invoice Date:</td>
                                        <td style={{ padding: "4px 0", fontWeight: 600, textAlign: "right" }}>{invoice.date}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
                        {/* Bill To */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Billed To</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{invoice.billingDetails.name}</div>
                            <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                                {invoice.billingDetails.address}<br />
                                {invoice.billingDetails.city} {invoice.billingDetails.zip}<br />
                                {invoice.billingDetails.country}
                            </div>
                            <div style={{ fontSize: 14, color: "#4b5563", marginTop: 4 }}>{invoice.billingDetails.email}</div>
                        </div>

                        {/* Ship To */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Shipped To</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{invoice.shippingDetails.name}</div>
                            <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                                {invoice.shippingDetails.address}<br />
                                {invoice.shippingDetails.city} {invoice.shippingDetails.zip}<br />
                                {invoice.shippingDetails.country}
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
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
                            {invoice.items.map((item: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "20px 0" }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ fontSize: 13, color: "#6b7280" }}>{item.variant}</div>
                                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>SKU: {item.sku}</div>
                                    </td>
                                    <td style={{ padding: "20px 16px", textAlign: "right", fontSize: 14, color: "#374151" }}>{item.quantity}</td>
                                    <td style={{ padding: "20px 16px", textAlign: "right", fontSize: 14, color: "#374151" }}>${item.price.toFixed(2)}</td>
                                    <td style={{ padding: "20px 0", textAlign: "right", fontSize: 14, fontWeight: 600, color: "#111" }}>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals & Payment */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ flex: 1, paddingRight: 48 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Payment Method</div>
                            <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{invoice.paymentMethod}</div>
                            <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                                Thank you for your business! If you have any questions regarding this invoice, please contact support. returns & exchanges are accepted within 30 days of delivery.
                            </div>
                        </div>

                        <div style={{ width: 260 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left" }}>Subtotal</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right" }}>${invoice.subtotal.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left" }}>Shipping</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right" }}>${invoice.shipping.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px 0", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Tax</td>
                                        <td style={{ padding: "8px 0", fontWeight: 600, color: "#111", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>${invoice.tax.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "16px 0 0", color: "#111", fontWeight: 800, fontSize: 16, textAlign: "left" }}>Total Due</td>
                                        <td style={{ padding: "16px 0 0", fontWeight: 800, fontSize: 20, color: "#D94F7A", textAlign: "right" }}>${invoice.total.toFixed(2)}</td>
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
