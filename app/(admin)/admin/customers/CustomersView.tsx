"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Users,
  Download,
} from "lucide-react";
import { SkeletonCard, SkeletonTable } from "../_components/Skeleton";
import Pagination from "../_components/Pagination";
import {
  getAdminCustomers,
  getAdminCustomerStats,
  exportAdminCustomers,
  AdminCustomer,
} from "@/services/admin.service";
import { useToast } from "@/app/components/GlobalToast";

interface CustomersViewProps {
  onViewProfile?: (customerId: string) => void;
  onViewInquiries?: () => void;
}

interface CustomerStatsState {
  total: number;
  active: number;
  inactive: number;
}

interface NormalizedCustomer extends AdminCustomer {
  totalOrders?: number;
  totalSpent?: number;
  customerType?: string;
  registeredAt?: string;
}

const INITIAL_STATS: CustomerStatsState = {
  total: 0,
  active: 0,
  inactive: 0,
};

function getBlobFromResponse(response: any): Blob | null {
  if (!response) return null;
  if (response instanceof Blob) return response;
  if (response?.data instanceof Blob) return response.data;
  return null;
}

function getCustomerType(customer?: Partial<NormalizedCustomer>) {
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

function getInitials(name?: string) {
  if (!name) return "CU";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function CustomersView({ onViewProfile, onViewInquiries }: CustomersViewProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [activeTab, setActiveTab] = useState("All Customers");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [customers, setCustomers] = useState<NormalizedCustomer[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<CustomerStatsState>(INITIAL_STATS);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const sortParams = useMemo(() => {
    switch (sort) {
      case "Oldest":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "Newest":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  }, [sort]);

  const summaryCards = useMemo(
    () => [
      {
        key: "total",
        label: "Total Customers",
        value: stats.total.toLocaleString(),
      },
      {
        key: "active",
        label: "Active Customers",
        value: stats.active.toLocaleString(),
      },
      {
        key: "inactive",
        label: "Inactive Customers",
        value: stats.inactive.toLocaleString(),
      },
      {
        key: "showing",
        label: "Showing",
        value: customers.length.toLocaleString(),
      },
    ],
    [stats, customers.length]
  );

  const tabs = ["All Customers", "Returns", "Replacements", "Inquiries", "Support Tickets"];

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [customersResponse, statsResponse] = await Promise.all([
        getAdminCustomers({
          page: currentPage,
          limit: pageSize,
          search: search.trim() || undefined,
          ...sortParams,
        }),
        getAdminCustomerStats(),
      ]);

      const customerList = Array.isArray(customersResponse?.data)
        ? customersResponse.data
        : Array.isArray(customersResponse)
        ? customersResponse
        : [];

      const normalizedCustomers: NormalizedCustomer[] = customerList
        .filter((customer: any) => customer?.userId || customer?._id)
        .map((customer: any) => ({
          _id: customer?._id || "",
          name: customer?.name || "Unknown",
          email: customer?.email || "—",
          phone: customer?.phone || "—",
          userId: customer?.userId || "",
          totalOrders: Number(customer?.totalOrders ?? 0),
          totalSpent: Number(customer?.totalSpent ?? 0),
          customerType: customer?.customerType,
          registeredAt: customer?.registeredAt || customer?.createdAt || "",
        }));

      setCustomers(normalizedCustomers);

      setTotalItems(
        Number(statsResponse?.total ?? 0) || normalizedCustomers.length
      );

      setStats({
        total: Number(statsResponse?.total ?? 0),
        active: Number(statsResponse?.active ?? 0),
        inactive: Number(statsResponse?.inactive ?? 0),
      });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
      setTotalItems(0);
      setStats(INITIAL_STATS);
      showToast("Error", "Could not load customers", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, search, sortParams, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await exportAdminCustomers({
        format: "csv",
        search: search.trim() || undefined,
      });

      const blob = getBlobFromResponse(response);

      if (!blob) {
        throw new Error("Invalid export response");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast("Success", "Customers exported successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Error", "Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewProfile = (customer: NormalizedCustomer) => {
    const customerIdentifier = customer.userId || customer._id;

    if (!customerIdentifier) {
      showToast("Error", "Customer ID not available", "error");
      return;
    }

    if (!onViewProfile) {
      showToast("Error", "View profile action is unavailable", "error");
      return;
    }

    onViewProfile(customerIdentifier);
  };

  return (
    <div className="w-full rounded-[28px] bg-[#FCF6F4] p-4 md:p-6 text-[#2A1F2F]">
      <div className="mx-auto w-full max-w-[1240px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#2B212E]">
              Customers Management
            </h1>
            <p className="mt-1 text-[13px] text-[#9C93A1]">
              View and manage all customers, returns, and support requests
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] bg-[#E85D8B] px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#df4f80] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={14} />
            {isExporting ? "Exporting..." : "Export Customers"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : summaryCards.map((card) => (
                <div
                  key={card.key}
                  className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]"
                >
                  <p className="text-[11px] font-medium text-[#A79DA8]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">
                    {card.value}
                  </p>
                </div>
              ))}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#F1E6EA] bg-white shadow-[0_10px_30px_rgba(43,33,46,0.05)]">
          <div className="relative border-b border-[#F4E9ED] px-0 md:px-6">
            <button
              onClick={() => {
                if (tabsRef.current) {
                  tabsRef.current.scrollBy({ left: -150, behavior: "smooth" });
                }
              }}
              className="absolute left-0 top-0 bottom-0 z-10 flex w-8 items-center justify-center bg-gradient-to-r from-white via-white to-transparent text-[#8F8694] md:hidden"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={tabsRef}
              className="flex items-center gap-6 overflow-x-auto scrollbar-hide px-8 md:px-0"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "Inquiries" && onViewInquiries) {
                      onViewInquiries();
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                  className={`relative whitespace-nowrap py-4 text-[13px] font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-[#E85D8B]"
                      : "text-[#8F8694] hover:text-[#2A1F2F]"
                  }`}
                >
                  {tab}
                  {tab === "Inquiries" && (
                    <span className="absolute -top-1 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E85D8B] text-[9px] font-bold text-white">
                      9
                    </span>
                  )}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#E85D8B]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (tabsRef.current) {
                  tabsRef.current.scrollBy({ left: 150, behavior: "smooth" });
                }
              }}
              className="absolute right-0 top-0 bottom-0 z-10 flex w-8 items-center justify-center bg-gradient-to-l from-white via-white to-transparent text-[#8F8694] md:hidden"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="border-b border-[#F4E9ED] p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[42px] w-full rounded-[12px] border border-[#EDE2E7] bg-white pl-9 pr-4 text-[13px] text-[#2A1F2F] placeholder:text-[#B5ADB8] outline-none transition focus:border-[#E85D8B]"
                />
              </div>

              <div className="relative min-w-[180px]">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[42px] w-full appearance-none rounded-[12px] border border-[#EDE2E7] bg-white pl-4 pr-9 text-[13px] text-[#2A1F2F] outline-none transition focus:border-[#E85D8B]"
                >
                  <option value="Newest">Sort: Newest</option>
                  <option value="Oldest">Sort: Oldest</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4 md:p-6">
              <SkeletonTable rows={8} cols={6} />
            </div>
          ) : activeTab === "All Customers" ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#FDF1F4]">
                    <tr className="text-left text-[10px] uppercase tracking-[0.08em] text-[#8D8491]">
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Total Orders</th>
                      <th className="px-6 py-4 font-semibold">Total Spent</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F5EDF0]">
                    {customers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center text-[14px] text-[#9C93A1]"
                        >
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => {
                        const menuKey = customer.userId || customer._id;
                        const type = getCustomerType(customer);

                        return (
                          <tr
                            key={menuKey}
                            className="transition hover:bg-[#FFFDFE]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E85D8B] text-[11px] font-bold text-white">
                                  {getInitials(customer.name)}
                                </div>

                                <div className="min-w-0">
                                  <button
                                    onClick={() => handleViewProfile(customer)}
                                    className="block text-left text-[14px] font-semibold text-[#2A1F2F] transition hover:text-[#E85D8B]"
                                  >
                                    {customer.name}
                                  </button>
                                  <p className="mt-0.5 text-[11px] text-[#AAA0AB]">
                                    {customer.registeredAt
                                      ? `Member since ${new Date(
                                          customer.registeredAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })}`
                                      : customer.userId || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-[13px] text-[#6F6573]">
                              {customer.email || "—"}
                            </td>

                            <td className="px-6 py-4 text-[13px] font-medium text-[#2A1F2F]">
                              {Number(customer.totalOrders ?? 0)}
                            </td>

                            <td className="px-6 py-4 text-[13px] font-medium text-[#2A1F2F]">
                              ₹{Number(customer.totalSpent ?? 0).toLocaleString()}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getCustomerTypeClasses(
                                  type
                                )}`}
                              >
                                {type}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div
                                ref={openMenu === menuKey ? menuRef : null}
                                className="relative"
                              >
                                <button
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === menuKey ? null : menuKey
                                    )
                                  }
                                  className="rounded-[10px] p-2 transition hover:bg-[#F8F3F6]"
                                >
                                  <MoreVertical
                                    size={16}
                                    className="text-[#9B93A2]"
                                  />
                                </button>

                                {openMenu === menuKey && (
                                  <div className="absolute right-0 top-[calc(100%-2px)] z-50 mt-2 w-44 rounded-[14px] border border-[#F0E4E8] bg-white py-2 shadow-[0_16px_32px_rgba(43,33,46,0.12)]">
                                    <button
                                      onClick={() => {
                                        handleViewProfile(customer);
                                        setOpenMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-[13px] text-[#2A1F2F] transition hover:bg-[#FAF6F8]"
                                    >
                                      View Profile
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#F4E9ED] px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    setOpenMenu(null);
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                    setOpenMenu(null);
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F9EEF2]">
                <Users size={26} className="text-[#D0C5CE]" />
              </div>
              <p className="text-[15px] font-medium text-[#6F6573]">
                {activeTab}
              </p>
              <p className="mt-1 text-[13px] text-[#9C93A1]">
                No records found for this section yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}