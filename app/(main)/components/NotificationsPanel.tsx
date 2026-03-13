"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Bell, X, CheckCheck, Trash2, Package, ShoppingBag,
  AlertCircle, CreditCard, RotateCcw, Users,
} from "lucide-react";
import Link from "next/link";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = `TODAY — ${today
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase()}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = `YESTERDAY — ${yesterday
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase()}`;
    } else {
      label = d
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase();
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

// ── Type styles ───────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, {
  bg: string; text: string; border: string; label: string;
  iconBg: string; dot: string;
}> = {
  ORDER:    { bg: "bg-white", text: "text-pink-600",   border: "border-pink-200",   label: "ORDER",    iconBg: "bg-pink-50",   dot: "bg-pink-500"   },
  PAYMENT:  { bg: "bg-white", text: "text-green-600",  border: "border-green-200",  label: "PAYMENT",  iconBg: "bg-green-50",  dot: "bg-green-500"  },
  STOCK:    { bg: "bg-white", text: "text-orange-600", border: "border-orange-200", label: "STOCK",    iconBg: "bg-orange-50", dot: "bg-orange-500" },
  RETURN:   { bg: "bg-white", text: "text-blue-600",   border: "border-blue-200",   label: "RETURN",   iconBg: "bg-blue-50",   dot: "bg-blue-500"   },
  CUSTOMER: { bg: "bg-white", text: "text-purple-600", border: "border-purple-200", label: "CUSTOMER", iconBg: "bg-purple-50", dot: "bg-purple-500" },
};

function NotifIcon({ type, isRead }: { type: string; isRead: boolean }) {
  const s = TYPE_STYLES[type];
  const bg = isRead ? "bg-gray-100" : (s?.iconBg ?? "bg-gray-100");
  const icon = ({
    ORDER:    <ShoppingBag size={20} className="text-pink-500" />,
    PAYMENT:  <CreditCard  size={20} className="text-green-500" />,
    STOCK:    <Package     size={20} className="text-orange-500" />,
    RETURN:   <RotateCcw   size={20} className="text-blue-500" />,
    CUSTOMER: <Users       size={20} className="text-purple-500" />,
  } as Record<string, React.ReactNode>)[type] ?? <AlertCircle size={20} className="text-gray-400" />;

  return (
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
      {icon}
    </div>
  );
}

// ── Exported hook ─────────────────────────────────────────────────────────────
export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.data?.unreadCount ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refetch: fetchCount };
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function NotificationsPanel({
  isOpen,
  onClose,
  anchorRef,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [deleting, setDeleting]           = useState<string | null>(null);
  const [isMobile, setIsMobile]           = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.data?.notifications ?? []);
    } catch {
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, anchorRef]);

  // Actions
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    setDeleting(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {
    } finally { setDeleting(null); }
  };

  const LIMIT = 3;
  const unreadCount  = notifications.filter(n => !n.isRead).length;
  const hasMore      = notifications.length > LIMIT;
  const visible      = useMemo(() => notifications.slice(0, LIMIT), [notifications]);
  const grouped      = useMemo(() => groupByDate(visible), [visible]);

  if (!isOpen) return null;

  // ── Shared panel body ─────────────────────────────────────────────────────
  const panelBody = (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-50 to-white border-b border-pink-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
            <Bell size={16} className="text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-[11px] text-pink-500 font-medium">{unreadCount} unread</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
            >
              <CheckCheck size={13} />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-pink-50 transition-colors ml-1"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div
        className="overflow-y-auto custom-scrollbar"
        style={{ maxHeight: isMobile ? "calc(100dvh - 220px)" : "360px" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Loading notifications…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-3">
              <Bell size={24} className="text-pink-300" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">All caught up!</p>
            <p className="text-xs text-gray-400">
              No notifications yet. We&apos;ll let you know when something arrives.
            </p>
          </div>
        ) : (
          <div className="px-3 py-2">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} className="mb-1">
                {/* Date group header */}
                <p className="text-[10px] font-bold text-pink-400 tracking-widest px-2 py-2.5">
                  {dateLabel}
                </p>

                <div className="space-y-0.5">
                  {items.map((notif) => {
                    const s = TYPE_STYLES[notif.type];
                    return (
                      <div
                        key={notif._id}
                        onClick={() => !notif.isRead && markAsRead(notif._id)}
                        className={`group relative flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                          notif.isRead
                            ? "hover:bg-gray-50"
                            : "bg-[#fff5f8] hover:bg-pink-50 border border-pink-100"
                        }`}
                      >
                        <NotifIcon type={notif.type} isRead={notif.isRead} />

                        <div className="flex-1 min-w-0 pr-5">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[12px] font-semibold leading-snug ${
                              notif.isRead ? "text-gray-500" : "text-gray-800"
                            }`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Tags */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {s && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${s.bg} ${s.text} ${s.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                {s.label}
                              </span>
                            )}
                            {notif.data?.orderNumber && (
                              <Link
                                href="/profile/orders"
                                onClick={onClose}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <Package size={9} />
                                {notif.data.orderNumber}
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && s && (
                          <span className={`absolute right-3 top-3.5 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                        )}

                        {/* Delete on hover */}
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotification(notif._id); }}
                          disabled={deleting === notif._id}
                          className="absolute right-3 bottom-3 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        >
                          {deleting === notif._id ? (
                            <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={11} className="text-red-400" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-pink-100 shrink-0">
          {hasMore && (
            <Link
              href="/notifications"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-3 text-[12px] font-bold text bg-pink-500 bg-white transition-colors w-full"
            >
              <Bell size={3} />
              View all {notifications.length} notifications
            </Link>
          )}
          
        </div>
      )}

    </div>
  );

  // ── Mobile: floating card below navbar ────────────────────────────────────
  if (isMobile) {
    return (
      <div
        ref={panelRef}
        className="fixed z-[9999] bg-white rounded-2xl overflow-hidden"
        style={{
          top: 56,
          left: 12,
          right: 12,
          maxHeight: "calc(100dvh - 72px)",
          boxShadow: "0 8px 40px rgba(236,72,153,0.15), 0 2px 12px rgba(0,0,0,0.10)",
        }}
      >
        {panelBody}
      </div>
    );
  }

  // ── Desktop: floating dropdown ────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-24px)] bg-white border border-pink-100 rounded-3xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        boxShadow: "0 8px 40px rgba(236,72,153,0.13), 0 2px 10px rgba(0,0,0,0.07)",
      }}
    >
      {panelBody}
    </div>
  );
}