"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        background: "#fdf8f9",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Roboto, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #fce7f3",
          padding: "48px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(217,79,122,0.08)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#fff5f8",
            border: "1.5px solid #fce7f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <AlertCircle size={36} color="#D94F7A" />
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#111",
            marginBottom: 10,
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          We couldn't load this order. This might be a temporary issue — please
          try again.
          {error.digest && (
            <span
              style={{
                display: "block",
                marginTop: 8,
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#D94F7A",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>

          <Link
            href="/profile/orders"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#fff",
              color: "#374151",
              border: "1.5px solid #fce7f3",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
