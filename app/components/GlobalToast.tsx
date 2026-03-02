"use client";
import { useState, useRef, useCallback, createContext, useContext } from "react";
import { X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info";

export interface ToastMsg {
  id: number;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMsg;
  onDismiss: (id: number) => void;
}) {
  const iconBg =
    toast.type === "error"
      ? "#EF4444"
      : toast.type === "info"
      ? "#3B82F6"
      : "#22C55E";

  const checkmark =
    toast.type === "error" ? (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : toast.type === "info" ? (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );

  return (
    <div
      className="flex items-center gap-3 bg-white rounded-2xl shadow-xl px-4 py-3.5 min-w-[280px] max-w-[340px] pointer-events-auto"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.07)",
        animation: "toastSlideIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Icon circle */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {checkmark}
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</span>
        {toast.description && (
          <span className="text-sm text-gray-500 leading-tight mt-0.5">{toast.description}</span>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMsg[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-60px) scale(0.88); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    }
        }
      `}</style>
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 items-start pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}

// ── Provider (wrap your app/layout with this) ─────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastType = "success") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}