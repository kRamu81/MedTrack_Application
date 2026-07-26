import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const typeStyles = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeSlideIn`}
          >
            <Icon size={20} className="shrink-0" />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 hover:opacity-80 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
