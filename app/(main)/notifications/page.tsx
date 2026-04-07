"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  ShoppingBag,
  AlertCircle,
  Search,
  CreditCard,
  RotateCcw,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import { useAuth } from "@/app/(main)/components/authContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    let label: string;

    if (d.toDateString() === today.toDateString()) {
      label = `TODAY — ${today
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase()}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = `YESTERDAY — ${yesterday
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase()}`;
    } else {
      label = d
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "ALL", label: "All" },
  { key: "ORDER", label: "Orders" },
  { key: "PAYMENT", label: "Payments" },
  { key: "STOCK", label: "Stock" },
  { key: "RETURN", label: "Returns" },
  { key: "CUSTOMER", label: "Customers" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Type styles ───────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    iconBg: string;
    dot: string;
  }
> = {
  ORDER: {
    bg: "bg-white",
    text: "text-pink-600",
    border: "border-pink-200",
    label: "ORDER",
    iconBg: "bg-pink-50",
    dot: "bg-pink-500",
  },
  PAYMENT: {
    bg: "bg-white",
    text: "text-green-600",
    border: "border-green-200",
    label: "PAYMENT",
    iconBg: "bg-green-50",
    dot: "bg-green-500",
  },
  STOCK: {
    bg: "bg-white",
    text: "text-orange-600",
    border: "border-orange-200",
    label: "STOCK",
    iconBg: "bg-orange-50",
    dot: "bg-orange-500",
  },
  RETURN: {
    bg: "bg-white",
    text: "text-blue-600",
    border: "border-blue-200",
    label: "RETURN",
    iconBg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  CUSTOMER: {
    bg: "bg-white",
    text: "text-purple-600",
    border: "border-purple-200",
    label: "CUSTOMER",
    iconBg: "bg-purple-50",
    dot: "bg-purple-500",
  },
};

function NotifIcon({ type, isRead }: { type: string; isRead: boolean }) {
  const s = TYPE_STYLES[type];
  const bg = isRead ? "bg-gray-100" : (s?.iconBg ?? "bg-gray-100");

  const icon =
    {
      ORDER: <ShoppingBag size={20} className="text-pink-500" />,
      PAYMENT: <CreditCard size={20} className="text-green-500" />,
      STOCK: <Package size={20} className="text-orange-500" />,
      RETURN: <RotateCcw size={20} className="text-blue-500" />,
      CUSTOMER: <Users size={20} className="text-purple-500" />,
    }[type] ?? <AlertCircle size={20} className="text-gray-400" />;

  return (
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}
    >
      {icon}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.data?.notifications ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [fetchNotifications, user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    setDeleting(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const clearAll = async () => {
    try {
      await Promise.all(
        notifications.map((n) => notificationService.deleteNotification(n._id))
      );
      setNotifications([]);
    } catch {}
  };

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: notifications.length };
    notifications.forEach((n) => {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    });
    return counts;
  }, [notifications]);

  const totalUnread = notifications.filter((n) => !n.isRead).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab !== "ALL" && n.type !== activeTab) return false;
      if (unreadOnly && n.isRead) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [notifications, activeTab, search, unreadOnly]);

  const grouped = useMemo<Record<string, Notification[]>>(() => {
    return groupByDate(filtered);
  }, [filtered]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F9]">
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F9] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-3xl bg-pink-50 flex items-center justify-center mb-6 shadow-sm border border-pink-100">
          <Bell size={40} className="text-pink-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-500 text-center max-w-xs mb-8">
          Please log in to your account to view your notifications and stay updated
          on your orders.
        </p>
        <Link
          href="/login"
          className="bg-[#D94F7A] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-pink-200/50 transition-all hover:scale-105 active:scale-95"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F9]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {totalUnread > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                {totalUnread} unread notification{totalUnread !== 1 ? "s" : ""} across
                all categories
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-full transition-all"
            >
              <CheckCheck size={14} className="text-gray-500" />
              Mark all read
            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-[13px] font-semibold text-white bg-[#D94F7A] hover:bg-pink-600 px-5 py-2.5 rounded-full transition-all"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-pink-100 px-4">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key] ?? 0;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 pb-3 pt-4 text-[13px] font-semibold whitespace-nowrap transition-all shrink-0 border-b-2 -mb-0.5 ${
                    active
                      ? "border-[#D94F7A] text-[#D94F7A]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        active
                          ? "bg-[#D94F7A] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-pink-100">
            <div className="flex-1 relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#fff5f8] border border-pink-200 rounded-xl outline-none focus:border-[#D94F7A] transition-colors"
              />
            </div>

            <button
              onClick={() => setUnreadOnly((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-full border transition-all whitespace-nowrap ${
                unreadOnly
                  ? "bg-[#fff5f8] text-[#D94F7A] border-pink-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-pink-200"
              }`}
            >
              {totalUnread > 0 && (
                <span className="w-6 h-6 rounded-full bg-[#D94F7A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {totalUnread}
                </span>
              )}
              Unread only
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading notifications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-300" />
              </div>
              <p className="text-base font-bold text-gray-600 mb-1">No notifications</p>
              <p className="text-sm text-gray-400">
                {search ? "Nothing matches your search." : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="px-4 py-2">
              {Object.entries(grouped).map(
                ([dateLabel, items]: [string, Notification[]]) => (
                  <div key={dateLabel} className="mb-2">
                    <p className="text-[11px] font-bold text-pink-400 tracking-widest px-2 py-3">
                      {dateLabel}
                    </p>

                    <div className="space-y-0.5">
                      {items.map((notif: Notification) => {
                        const s = TYPE_STYLES[notif.type];

                        return (
                          <div
                            key={notif._id}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={`group relative flex items-start gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all duration-150 ${
                              notif.isRead
                                ? "hover:bg-gray-50"
                                : "bg-[#fff5f8] hover:bg-pink-50 border border-pink-100"
                            }`}
                          >
                            <NotifIcon type={notif.type} isRead={notif.isRead} />

                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm font-semibold leading-snug ${
                                    notif.isRead ? "text-gray-500" : "text-gray-800"
                                  }`}
                                >
                                  {notif.title}
                                </p>

                                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                                  {formatTime(notif.createdAt)}
                                </span>
                              </div>

                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                {notif.message}
                              </p>

                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {s && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${s.bg} ${s.text} ${s.border}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}
                                    />
                                    {s.label}
                                  </span>
                                )}

                                {notif.data?.orderNumber && (
                                  <Link
                                    href="/profile/orders"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    <Package size={10} />
                                    {notif.data.orderNumber}
                                  </Link>
                                )}
                              </div>
                            </div>

                            {!notif.isRead && s && (
                              <span
                                className={`absolute right-4 top-4 w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`}
                              />
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif._id);
                              }}
                              disabled={deleting === notif._id}
                              className="absolute right-4 bottom-4 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                            >
                              {deleting === notif._id ? (
                                <div className="w-3.5 h-3.5 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={13} className="text-red-400" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}