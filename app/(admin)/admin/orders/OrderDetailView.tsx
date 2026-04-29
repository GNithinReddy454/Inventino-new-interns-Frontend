"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Bell,
  Save,
  Copy,
  X,
  Clock,
  CheckCircle,
  Package,
  Truck,
  FileText,
} from "lucide-react";
import { SkeletonTable } from "../_components/Skeleton";
import {
  getAdminOrderById,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  addOrderNote,
  downloadOrderInvoice,
  AdminOrderDetail,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

// ============ MOCK DATA (Remove when APIs are ready) ============
const MOCK_ORDER: OrderDetailExtended = {
  _id: "ord-113",
  orderNumber: "ORD-113",
  status: "packed",
  createdAt: "2026-04-07T14:50:00.000Z",
  total: 1,
  paymentMethod: "UPI",
  paymentStatus: "paid",
  payment: {
    method: "UPI",
    transactionId: "pay_test_1453",
    status: "paid",
    subtotal: 1,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 1,
  },
  paymentTransactionId: "pay_test_1453",
  paymentDate: "2026-04-07T14:51:00.000Z",
  invoiceNumber: "INV2026040025",
  invoiceGeneratedAt: "2026-04-07T14:50:00.000Z",
  trackingNumber: "",
  customer: {
    name: "Sujith",
    email: "sujith@gmail.com",
    phone: "9876542210",
    userId: "usr_abc123",
  },
  shippingAddress: {
    name: "John Doe",
    line1: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
  },
  items: [
    {
      name: "Budget Everyday Bracelet",
      sku: "Budget Everyday Bracelet",
      quantity: 1,
      price: 1,
      total: 1,
    },
  ],
  trackingUpdates: [
    {
      status: "created",
      label: "Order Placed",
      timestamp: "2026-04-07T14:50:51.000Z",
      description: "Order #ORD-113 placed by Sujith (sujith@gmail.com). Payment method: UPI.",
    },
    {
      status: "confirmed",
      label: "Payment Confirmed",
      timestamp: "2026-04-07T14:51:17.000Z",
      description: "₹1 received · Transaction ID: pay_test_1453",
    },
    {
      status: "invoice",
      label: "Invoice Generated",
      timestamp: "2026-04-07T14:51:06.000Z",
      description: "Invoice INV2026040025 issued and available for download.",
    },
    {
      status: "packed",
      label: "Order Packed",
      timestamp: "2026-04-07T18:15:31.000Z",
      description: "Awaiting dispatch...",
    },
  ],
  notes: [],
  allowedNextStatuses: ["shipped", "cancelled"],
};
// ============ END MOCK DATA ============

const STATUS_TRANSITIONS: Record<string, string[]> = {
  created: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  created: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  confirmed: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  packed: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  shipped: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
};

const TIMELINE_COLORS: Record<string, string> = {
  created: "bg-emerald-500",
  confirmed: "bg-blue-500",
  invoice: "bg-indigo-500",
  packed: "bg-amber-500",
  shipped: "bg-purple-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

interface OrderDetailExtended extends AdminOrderDetail {
  paymentStatus?: string;
  paymentTransactionId?: string;
  paymentDate?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: string;
  shippingAddress?: {
    name?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  customer: AdminOrderDetail["customer"] & {
    userId?: string;
  };
}

interface OrderDetailViewProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetailView({ orderId, onBack }: OrderDetailViewProps) {
  const [order, setOrder] = useState<OrderDetailExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingTracking, setPendingTracking] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

  const { showToast } = useToast();

  const USE_MOCK = false; // Use actual admin APIs from services

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      showToast("Error", "Order ID not found", "error");
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 500));
        setOrder(MOCK_ORDER);
        setPendingTracking(MOCK_ORDER.trackingNumber || "");
      } else {
        const data = (await getAdminOrderById(orderId)) as OrderDetailExtended;
        if (data) {
          setOrder(data);
          setPendingTracking(data.trackingNumber || "");
        } else {
          setOrder(null);
          showToast("Error", "No order found", "error");
        }
      }
    } catch {
      setOrder(null);
      showToast("Error", "Could not load order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const resolvedOrderId = order?._id || orderId || "";
  const currentStatusKey = (order?.status ?? "").toLowerCase();
  const allowedNextStatuses = order?.allowedNextStatuses?.length
    ? order.allowedNextStatuses
    : STATUS_TRANSITIONS[currentStatusKey] ?? [];

  const handleStatusUpdate = async () => {
    if (!resolvedOrderId || !pendingStatus || isUpdatingStatus) return;
    try {
      setIsUpdatingStatus(true);
      if (!USE_MOCK) {
        await updateOrderStatus(resolvedOrderId, pendingStatus);
      }
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: pendingStatus,
              trackingUpdates: [
                ...(prev.trackingUpdates ?? []),
                {
                  status: pendingStatus,
                  label: pendingStatus.charAt(0).toUpperCase() + pendingStatus.slice(1),
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : prev
      );
      showToast("Success", "Order status updated", "success");
      setPendingStatus("");
    } catch {
      showToast("Error", "Failed to update status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!resolvedOrderId || isUpdatingTracking) return;
    const tracking = pendingTracking.trim();
    if (!tracking) {
      showToast("Error", "Please enter tracking number", "error");
      return;
    }
    try {
      setIsUpdatingTracking(true);
      if (!USE_MOCK) {
        await updateOrderTracking(resolvedOrderId, tracking);
      }
      setOrder((prev) => (prev ? { ...prev, trackingNumber: tracking } : prev));
      showToast("Success", "Tracking updated", "success");
    } catch {
      showToast("Error", "Failed to update tracking", "error");
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!resolvedOrderId || isCancelling) return;
    try {
      setIsCancelling(true);
      if (!USE_MOCK) {
        await cancelOrder(resolvedOrderId, "Cancelled by admin");
      }
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
              trackingUpdates: [
                ...(prev.trackingUpdates ?? []),
                { status: "cancelled", label: "Cancelled", timestamp: new Date().toISOString() },
              ],
            }
          : prev
      );
      showToast("Success", "Order cancelled", "success");
    } catch {
      showToast("Error", "Failed to cancel order", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyTxn = () => {
    if (order?.paymentTransactionId) {
      navigator.clipboard.writeText(order.paymentTransactionId);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 1500);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!resolvedOrderId) {
      showToast("Error", "Order ID not found", "error");
      return;
    }

    try {
      setIsDownloadingInvoice(true);
      const blob = await downloadOrderInvoice(resolvedOrderId);
      if (!blob) {
        throw new Error("Invoice response invalid");
      }

      const url = window.URL.createObjectURL(blob as Blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed:", err);
      showToast("Error", "Could not download invoice", "error");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (loading) return <SkeletonTable rows={6} cols={4} />;

  if (!order) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-gray-500">No order found.</p>
      </div>
    );
  }

  const displayId = order.orderNumber || resolvedOrderId;
  const placedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            Orders
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">#{displayId}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell size={14} />
            Notify Customer
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={!pendingStatus || isUpdatingStatus}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-[#E85D5D] rounded-lg hover:bg-[#d54d4d] disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            {isUpdatingStatus ? "Saving..." : "Save Changes"}
          </button>
          <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <div className="w-6 h-6 bg-[#E85D5D] rounded-full flex items-center justify-center text-white text-xs font-medium">
              A
            </div>
            <span className="text-sm text-gray-700">Admin User</span>
          </div>
        </div>
      </div>

      {/* Cancel Order - Top Right */}
      <div className="max-w-4xl mx-auto px-6 pt-4 flex justify-end">
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <X size={14} />
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8 space-y-5">
        {/* Order Header */}
        <div className="pt-2">
          <p className="text-xs font-medium text-[#E85D5D] uppercase tracking-wider mb-1">
            ORDER DETAILS
          </p>
          <h1 className="text-2xl font-bold text-gray-900">#{displayId}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              Placed {placedAt}
            </span>
            <span className="text-gray-300">·</span>
            <span>
              Customer: <span className="text-gray-900 font-medium">{order.customer?.name}</span>
            </span>
            <span className="text-gray-300">·</span>
            <span>
              Total:{" "}
              <span className="text-gray-900 font-medium">
                ₹{Number(order.total || 0).toLocaleString()}
              </span>
            </span>
            <span className="text-gray-300">·</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS.paid.bg} ${STATUS_COLORS.paid.text}`}
            >
              Paid · {order.paymentMethod?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Ordered Items Section */}
        <Section
          icon={<Package size={16} className="text-gray-500" />}
          title="Ordered Items"
          subtitle={`${order.items?.length ?? 0} product · ₹${Number(order.total || 0).toLocaleString()} total`}
        >
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.sku && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      SKU: {item.sku} · {item.productId}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹{Number(item.price).toLocaleString()} / unit
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {item.quantity} × ₹{Number(item.price).toLocaleString()}
                  </p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    ₹{Number(item.total ?? item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{Number(order.total || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax / GST</span>
              <span>—</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span>—</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
              <span>Order Total</span>
              <span className="text-[#E85D5D]">
                ₹{Number(order.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Section>

        {/* Customer & Delivery Section */}
        <Section
          icon={<span className="text-base">👤</span>}
          title="Customer & Delivery"
          subtitle="Buyer details and shipping address"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                CUSTOMER
              </p>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {order.customer?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="font-medium text-gray-900">{order.customer?.name}</span>
              </div>
              {order.customer?.email && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-gray-400">✉</span>
                  {order.customer.email}
                </p>
              )}
              {order.customer?.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <span className="text-gray-400">📞</span>
                  {order.customer.phone}
                </p>
              )}
              {order.customer?.userId && (
                <p className="text-xs text-gray-400 mt-2">User ID: {order.customer.userId}</p>
              )}
            </div>

            {order.shippingAddress && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  SHIP TO
                </p>
                <p className="font-medium text-gray-900 mb-1">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  {order.shippingAddress.line1}
                </p>
                <p className="text-sm text-gray-500 ml-5">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p className="text-sm text-gray-500 ml-5">
                  {order.shippingAddress.pincode}, {order.shippingAddress.country}
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* Payment Section */}
        <Section
          icon={<span className="text-base">💳</span>}
          title="Payment"
          subtitle="Method, status and transaction details"
          badge={
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <CheckCircle size={12} />
              Paid
            </span>
          }
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                METHOD
              </p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <span className="text-lg">💳</span>
                {order.paymentMethod?.toUpperCase()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                STATUS
              </p>
              <p className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Paid
              </p>
              {order.paymentDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.paymentDate).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                AMOUNT PAID
              </p>
              <p className="font-semibold text-[#E85D5D]">
                ₹{Number(order.total || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {order.paymentTransactionId && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    TRANSACTION ID
                  </p>
                  <p className="font-mono text-sm text-gray-900">
                    {order.paymentTransactionId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyTxn}
                className="text-sm text-gray-500 border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                {copiedTxn ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </Section>

        {/* Invoice & Tracking Section */}
        <Section
          icon={<FileText size={16} className="text-gray-500" />}
          title="Invoice & Tracking"
          subtitle="Documents and shipment information"
        >
          {order.invoiceNumber && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.invoiceNumber}</p>
                  <p className="text-xs text-gray-400">
                    Generated{" "}
                    {order.invoiceGeneratedAt &&
                      new Date(order.invoiceGeneratedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                    · Status: generated
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download size={14} />
                {isDownloadingInvoice ? "Downloading..." : "Download"}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 text-gray-500">
            <Truck size={16} />
            <span className="text-sm">
              {order.trackingNumber || "No tracking number assigned yet"}
            </span>
          </div>
        </Section>

        {/* Update Order Section */}
        <Section
          icon={<span className="text-base">✏️</span>}
          title="Update Order"
          subtitle="Change status or add tracking number"
        >
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                ORDER STATUS
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <select
                    value={pendingStatus || currentStatusKey}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    disabled={allowedNextStatuses.length === 0}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 capitalize appearance-none focus:ring-2 focus:ring-[#E85D5D]/20 focus:border-[#E85D5D] transition-colors"
                  >
                    <option value={currentStatusKey} className="capitalize">
                      {currentStatusKey.charAt(0).toUpperCase() + currentStatusKey.slice(1)}
                    </option>
                    {allowedNextStatuses.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </span>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!pendingStatus || pendingStatus === currentStatusKey || isUpdatingStatus}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#E85D5D] text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#d54d4d] transition-colors"
                >
                  <CheckCircle size={14} />
                  {isUpdatingStatus ? "Updating..." : "Update"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                TRACKING NUMBER
              </p>
              <div className="flex gap-2">
                <input
                  value={pendingTracking}
                  onChange={(e) => setPendingTracking(e.target.value)}
                  placeholder="e.g. BD9384726104 — enter courier tracking ID"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#E85D5D]/20 focus:border-[#E85D5D] transition-colors"
                />
                <button
                  onClick={handleTrackingUpdate}
                  disabled={isUpdatingTracking}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {isUpdatingTracking ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors mt-2"
              >
                <X size={14} />
                {isCancelling ? "Cancelling..." : "Cancel This Order"}
              </button>
            )}
          </div>
        </Section>

        {/* Order Timeline Section */}
        <Section
          icon={<Clock size={16} className="text-gray-500" />}
          title="Order Timeline"
          subtitle="Full activity history from placement to now"
        >
          {order.trackingUpdates?.length ? (
            <div className="relative ml-2">
              {order.trackingUpdates.map((update: any, i: number) => {
                const statusKey = (update.status || "").toLowerCase();
                const isLast = i === order.trackingUpdates!.length - 1;
                const dotColor = TIMELINE_COLORS[statusKey] || "bg-gray-400";

                return (
                  <div key={i} className="relative pl-6 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {!isLast && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full ${dotColor} flex items-center justify-center`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>

                    {/* Content */}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {update.label || update.status}
                      </p>
                      <p className="text-xs text-gray-400 mb-1.5">
                        {update.timestamp &&
                          new Date(update.timestamp).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                      </p>
                      {update.description && (
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                          {update.description}
                        </div>
                      )}
                      {isLast && !update.description && (
                        <div className="text-sm text-gray-400 italic">Awaiting dispatch...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No timeline events yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

// Section Component
function Section({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
