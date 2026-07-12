"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  MoreVertical,
  Search,
  Star,
  CheckCircle2,
} from "lucide-react";
import { SkeletonTable } from "../_components/Skeleton";
import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  AdminCustomerDetail,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";
import { useRouter } from "next/navigation";

interface ApiCustomerDetail {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isEmailVerified?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  customerType?: string;
  registeredAt?: string;
  active?: boolean;
  customerId?: string;
  addresses?: any;
}

interface ApiOrder {
  _id?: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  paymentMethod?: string;
  date?: string;
  createdAt?: string;
  pricing?: {
    total?: number;
  };
  payment?: {
    method?: string;
  };
  items?: Array<{
    name?: string;
    title?: string;
    productName?: string;
  }>;
}

interface CustomerProfileViewProps {
  customerId: string;
  onBack: () => void;
  onViewOrder?: (orderId: string) => void;
}

type ProfileTab = "Orders" | "Reviews & Ratings";
type OrderFilter =
  | "All Orders"
  | "Delivered"
  | "Cancelled"
  | "Return Products"
  | "Processing";

function getInitials(name?: string) {
  if (!name) return "CU";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getCustomerType(customer?: Partial<AdminCustomerDetail>) {
  if (!customer) return "Regular";
  if (customer.customerType) return customer.customerType;

  const totalOrders = Number(customer.totalOrders ?? 0);
  const totalSpent = Number(customer.totalSpent ?? 0);

  if (totalOrders > 20 || totalSpent > 10000) return "VIP";
  if (totalOrders < 2) return "New";
  return "Regular";
}

function getCustomerTypeClasses(type: string) {
  switch (type.toLowerCase()) {
    case "vip":
      return "bg-[#FFF2D9] text-[#C98A12]";
    case "new":
      return "bg-[#F4E9FF] text-[#A25BE7]";
    default:
      return "bg-[#E8F3FF] text-[#4C9BFF]";
  }
}

function getStatusLabel(status?: string) {
  const value = String(status || "").toLowerCase();

  if (value === "delivered") return "Delivered";
  if (value === "cancelled" || value === "canceled") return "Cancelled";
  if (value === "returned" || value === "return_requested") return "Returned";
  if (
    value === "processing" ||
    value === "packed" ||
    value === "packing" ||
    value === "accepted"
  ) {
    return "Processing";
  }
  if (value === "shipped") return "Shipped";
  if (value === "pending" || value === "created") return "Pending";

  return status || "Pending";
}

function getStatusClasses(status?: string) {
  const label = getStatusLabel(status).toLowerCase();

  if (label === "delivered") {
    return "bg-[#EAF7EA] text-[#63AE67]";
  }

  if (label === "cancelled") {
    return "bg-[#FDEBEC] text-[#E36A73]";
  }

  if (label === "returned") {
    return "bg-[#FFF1E1] text-[#DD933C]";
  }

  if (label === "processing") {
    return "bg-[#EAF3FF] text-[#5E9AE6]";
  }

  if (label === "shipped") {
    return "bg-[#EEF1FF] text-[#6675E4]";
  }

  return "bg-[#F3EEF3] text-[#8D8390]";
}

function getOrderFilterMatch(status?: string, filter?: OrderFilter) {
  if (!filter || filter === "All Orders") return true;

  const label = getStatusLabel(status).toLowerCase();

  if (filter === "Delivered") return label === "delivered";
  if (filter === "Cancelled") return label === "cancelled";
  if (filter === "Return Products") return label === "returned";
  if (filter === "Processing") {
    return (
      label === "processing" ||
      label === "shipped" ||
      label === "pending"
    );
  }

  return true;
}

function getDisplayDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerProfileView({
  customerId,
  onBack,
  onViewOrder,
}: CustomerProfileViewProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Orders");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("All Orders");
  const [orderSearch, setOrderSearch] = useState("");
  const { showToast } = useToast();

  const transformApiCustomerDetail = useCallback(
    (apiCustomer: ApiCustomerDetail, userId: string): AdminCustomerDetail => {
      let customerType = apiCustomer.customerType || "Regular";

      if (!apiCustomer.customerType) {
        if (
          (apiCustomer.totalOrders ?? 0) > 20 ||
          (apiCustomer.totalSpent ?? 0) > 10000
        ) {
          customerType = "VIP";
        } else if ((apiCustomer.totalOrders ?? 0) < 2) {
          customerType = "New";
        }
      }

      return {
        _id: apiCustomer._id || "",
        name: apiCustomer.name || "Unknown",
        email: apiCustomer.email || "—",
        phone: apiCustomer.phone || "—",
        totalOrders: Number(apiCustomer.totalOrders || 0),
        totalSpent: Number(apiCustomer.totalSpent || 0),
        customerType,
        customerId: apiCustomer.userId || apiCustomer.customerId || userId,
        registeredAt: apiCustomer.registeredAt || "",
        active: apiCustomer.active ?? true,
        addresses: apiCustomer.addresses,
      } as AdminCustomerDetail;
    },
    []
  );

  const transformApiOrder = useCallback((apiOrder: ApiOrder, index: number) => {
    const firstItem =
      Array.isArray(apiOrder.items) && apiOrder.items.length > 0
        ? apiOrder.items[0]
        : undefined;

    const firstProductName =
      firstItem?.name || firstItem?.title || firstItem?.productName || "";

    return {
      _id: apiOrder._id || `order-${index}`,
      orderNumber: apiOrder.orderNumber || `ORD-${index + 1}`,
      date: apiOrder.date || apiOrder.createdAt || new Date().toISOString(),
      status: apiOrder.status || "created",
      total: Number(apiOrder.total ?? apiOrder.pricing?.total ?? 0),
      paymentMethod: apiOrder.paymentMethod || apiOrder.payment?.method || "—",
      productName: firstProductName,
    };
  }, []);

  const fetchCustomerData = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [customerData, ordersData] = await Promise.all([
        getAdminCustomerById(customerId),
        getAdminCustomerOrders(customerId),
      ]);

      if (!customerData) {
        throw new Error("Customer details not found");
      }

      const apiCustomer = (customerData as any)?.data ?? customerData;
      const transformedCustomer = transformApiCustomerDetail(
        apiCustomer,
        customerId
      );

      setCustomer(transformedCustomer);
      setIsActive(transformedCustomer.active ?? true);

      const rawOrders = Array.isArray((ordersData as any)?.data)
        ? (ordersData as any).data
        : Array.isArray(ordersData)
        ? ordersData
        : [];

      const transformedOrders = rawOrders.map((order: ApiOrder, index: number) =>
        transformApiOrder(order, index)
      );

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Failed to fetch customer profile:", err);
      setCustomer(null);
      setOrders([]);
      showToast("Error", "Could not load customer details", "error");
    } finally {
      setLoading(false);
    }
  }, [customerId, showToast, transformApiCustomerDetail, transformApiOrder]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied", `${type} copied to clipboard`, "success");
    } catch {
      showToast("Error", `Could not copy ${type.toLowerCase()}`, "error");
    }
  };

  const handleViewOrder = (orderId: string) => {
    if (!orderId) {
      showToast("Error", "Order ID not found", "error");
      return;
    }

    if (onViewOrder) {
      onViewOrder(orderId);
    } else {
      router.push(`/admin/orders/${orderId}`);
    }
  };

  const orderStats = useMemo(() => {
    const cancelled = orders.filter(
      (order) => getStatusLabel(order.status).toLowerCase() === "cancelled"
    ).length;

    const returned = orders.filter(
      (order) => getStatusLabel(order.status).toLowerCase() === "returned"
    ).length;

    return {
      total: Number(customer?.totalOrders ?? orders.length ?? 0),
      cancelled,
      returned,
      totalSpent: Number(customer?.totalSpent ?? 0),
    };
  }, [customer, orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = getOrderFilterMatch(order.status, orderFilter);

      const query = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        String(order.orderNumber || "")
          .toLowerCase()
          .includes(query) ||
        String(order._id || "")
          .toLowerCase()
          .includes(query) ||
        String(order.paymentMethod || "")
          .toLowerCase()
          .includes(query) ||
        String(order.productName || "")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const customerType = getCustomerType(customer ?? undefined);

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonTable rows={10} cols={6} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <button onClick={onBack} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#FCF6F4] p-4 md:p-6">
      <div className="mx-auto max-w-[1240px] space-y-6 text-[#2A1F2F]">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[12px] text-[#9B92A0] transition hover:text-[#2A1F2F]"
          >
            <ArrowLeft size={14} />
            Back to Customers
          </button>

          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[#2B212E]">
            Customer Profile
          </h1>
          <p className="mt-1 text-[13px] text-[#9C93A1]">
            View customer details, orders, and reviews
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#F0E6E9] bg-white shadow-[0_10px_30px_rgba(43,33,46,0.05)]">
          <div className="px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#E85D8B] text-[18px] font-semibold text-white">
                  {getInitials(customer.name)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="text-[28px] font-semibold leading-none text-[#2A1F2F]">
                      {customer.name}
                    </h2>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getCustomerTypeClasses(
                        customerType
                      )}`}
                    >
                      {customerType}
                    </span>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#EAF7EA] text-[#63AE67]"
                          : "bg-[#F1EEF3] text-[#8A8190]"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#8F8694]">
                    <div className="inline-flex items-center gap-1.5">
                      <span>{customer.email || "—"}</span>
                      {customer.email && customer.email !== "—" && (
                        <button
                          onClick={() => copyToClipboard(customer.email, "Email")}
                          className="rounded p-1 transition hover:bg-[#F8F3F6]"
                          title="Copy email"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>

                    <span>{customer.phone || "—"}</span>

                    <div className="inline-flex items-center gap-1.5">
                      <span>
                        {customer.customerId
                          ? `ID: ${customer.customerId}`
                          : "ID: —"}
                      </span>
                      {customer.customerId && (
                        <button
                          onClick={() =>
                            copyToClipboard(customer.customerId!, "Customer ID")
                          }
                          className="rounded p-1 transition hover:bg-[#F8F3F6]"
                          title="Copy customer ID"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-[#F4E9ED] lg:grid-cols-4">
            <div className="px-6 py-5 text-center">
              <p className="text-[28px] font-semibold leading-none text-[#E85D8B]">
                {orderStats.total}
              </p>
              <p className="mt-2 text-[11px] text-[#A79DA8]">Total Orders</p>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-[28px] font-semibold leading-none text-[#E85D8B]">
                {orderStats.cancelled}
              </p>
              <p className="mt-2 text-[11px] text-[#A79DA8]">Cancelled</p>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-[28px] font-semibold leading-none text-[#E85D8B]">
                {orderStats.returned}
              </p>
              <p className="mt-2 text-[11px] text-[#A79DA8]">Returned</p>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-[28px] font-semibold leading-none text-[#E85D8B]">
                ₹{orderStats.totalSpent.toLocaleString()}
              </p>
              <p className="mt-2 text-[11px] text-[#A79DA8]">Total Spent</p>
            </div>
          </div>
        </div>

        {(customer.addresses?.billing || customer.addresses?.shipping) && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#F0E6E9] bg-white p-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A79DA8]">
                Billing Address
              </p>
              <div className="mt-3 space-y-1 text-[13px] text-[#6F6573]">
                <p>{customer.addresses?.billing?.line1 || "—"}</p>
                <p>
                  {customer.addresses?.billing?.city || "—"},{" "}
                  {customer.addresses?.billing?.state || "—"}{" "}
                  {customer.addresses?.billing?.postalCode || ""}
                </p>
                <p>{customer.addresses?.billing?.country || "—"}</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#F0E6E9] bg-white p-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A79DA8]">
                Shipping Address
              </p>
              <div className="mt-3 space-y-1 text-[13px] text-[#6F6573]">
                <p>{customer.addresses?.shipping?.line1 || "—"}</p>
                <p>
                  {customer.addresses?.shipping?.city || "—"},{" "}
                  {customer.addresses?.shipping?.state || "—"}{" "}
                  {customer.addresses?.shipping?.postalCode || ""}
                </p>
                <p>{customer.addresses?.shipping?.country || "—"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[24px] border border-[#F0E6E9] bg-white shadow-[0_10px_30px_rgba(43,33,46,0.05)]">
          <div className="border-b border-[#F4E9ED] px-5 md:px-6">
            <div className="flex items-center gap-6">
              {(["Orders", "Reviews & Ratings"] as ProfileTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-4 text-[13px] font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-[#E85D8B]"
                      : "text-[#8F8694] hover:text-[#2A1F2F]"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#E85D8B]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Orders" ? (
            <div className="p-4 md:p-5">
              <div className="rounded-[20px] border border-[#F4E9ED] bg-white">
                <div className="border-b border-[#F4E9ED] p-4 md:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="text-[18px] font-semibold text-[#2A1F2F]">
                      Order History
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "All Orders",
                          "Delivered",
                          "Cancelled",
                          "Return Products",
                          "Processing",
                        ] as OrderFilter[]
                      ).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`rounded-[10px] border px-4 py-2 text-[12px] font-medium transition ${
                            orderFilter === filter
                              ? "border-[#E85D8B] bg-[#E85D8B] text-white"
                              : "border-[#EDE2E7] bg-white text-[#6F6573] hover:bg-[#FAF6F8]"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 max-w-[320px]">
                    <div className="relative">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                      />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="h-[40px] w-full rounded-[12px] border border-[#EDE2E7] bg-white pl-9 pr-4 text-[13px] text-[#2A1F2F] placeholder:text-[#B5ADB8] outline-none transition focus:border-[#E85D8B]"
                      />
                    </div>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <p className="text-[15px] font-medium text-[#6F6573]">
                      No orders found
                    </p>
                    <p className="mt-1 text-[13px] text-[#9C93A1]">
                      Try changing the filter or search term.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-[#FFF7F9]">
                        <tr className="text-left text-[10px] uppercase tracking-[0.08em] text-[#8D8491]">
                          <th className="px-6 py-4 font-semibold">Order ID</th>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Payment</th>
                          <th className="px-6 py-4 font-semibold">Total</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#F5EDF0]">
                        {filteredOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="transition hover:bg-[#FFFDFE]"
                          >
                            <td className="px-6 py-4">
                              <div className="min-w-[150px]">
                                <p className="text-[13px] font-semibold text-[#2A1F2F]">
                                  {order.orderNumber}
                                </p>
                                <p className="mt-1 text-[11px] text-[#AAA0AB]">
                                  {order._id
                                    ? `${order._id.slice(0, 12)}...`
                                    : "—"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-[13px] text-[#6F6573]">
                              {getDisplayDate(order.date)}
                            </td>

                            <td className="px-6 py-4 text-[13px] text-[#6F6573]">
                              {order.paymentMethod || "—"}
                            </td>

                            <td className="px-6 py-4 text-[13px] font-medium text-[#2A1F2F]">
                              ₹{Number(order.total || 0).toLocaleString()}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewOrder(order._id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] transition hover:bg-[#F8F3F6]"
                                title="View order"
                              >
                                <MoreVertical
                                  size={16}
                                  className="text-[#9B93A2]"
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-5">
              <div className="rounded-[20px] border border-[#F4E9ED] bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E85D8B] text-[11px] font-bold text-white">
                    {getInitials(customer.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-[#2A1F2F]">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-[11px] text-[#AAA0AB]">
                          Customer reviews
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 text-[#F3B21B]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[16px] border border-dashed border-[#E8DCE1] bg-[#FFF9FB] px-4 py-6 text-center">
                      <p className="text-[15px] font-medium text-[#6F6573]">
                        No reviews yet
                      </p>
                      <p className="mt-2 text-[13px] text-[#9C93A1]">
                        This customer hasn’t submitted any reviews.
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EA] px-2.5 py-1 text-[10px] font-semibold text-[#63AE67]">
                          <CheckCircle2 size={12} />
                          Verified Purchase
                        </span>
                        <span className="inline-flex rounded-full bg-[#FFF2D9] px-2.5 py-1 text-[10px] font-semibold text-[#C98A12]">
                          Helpful (0)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}