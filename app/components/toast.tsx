"use client";

import { useEffect } from "react";
import { Check, X, AlertTriangle, XCircle } from "lucide-react";

type ToastProps = {
  title: string;
  message: string;
  type?: "success" | "warning" | "error";
  onClose: () => void;
};

export default function Toast({ title, message, type = "success", onClose }: ToastProps) {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Design config based on type
  const styles = {
    success: { 
      bg: "bg-green-500", 
      icon: <Check size={24} strokeWidth={3} className="text-white" /> 
    },
    warning: { 
      bg: "bg-yellow-400", 
      icon: <AlertTriangle size={24} strokeWidth={3} className="text-white" /> 
    },
    error: { 
      bg: "bg-red-500", 
      icon: <XCircle size={24} strokeWidth={3} className="text-white" /> 
    },
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex items-center gap-4 min-w-[320px] max-w-sm border border-gray-50 animate-[slideDown_0.3s_ease-out]">     
        <div className={`w-12 h-12 rounded-full ${currentStyle.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
           {currentStyle.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1">
           <h4 className="text-gray-800 font-bold text-lg leading-tight">{title}</h4>
           <p className="text-gray-400 text-sm mt-0.5">{message}</p>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors self-start mt-1">
           <X size={20} />
        </button>

      </div>
    
  );
}