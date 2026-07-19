"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const showError = useCallback((msg: string) => toast(msg, "error"), [toast]);
  const showInfo = useCallback((msg: string) => toast(msg, "info"), [toast]);
  const showWarning = useCallback((msg: string) => toast(msg, "warning"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Floating Luxury Toast Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm font-hanken transition-all duration-300 animate-fade-in ${
              t.type === "success"
                ? "bg-zinc-900/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/20"
                : t.type === "error"
                ? "bg-zinc-900/95 border-rose-500/50 text-rose-100 shadow-rose-950/20"
                : t.type === "warning"
                ? "bg-zinc-900/95 border-amber-500/50 text-amber-100 shadow-amber-950/20"
                : "bg-zinc-900/95 border-gold-luxury/50 text-zinc-100 shadow-amber-950/10"
            }`}
            style={{ backdropFilter: "blur(14px)" }}
          >
            <span
              className={`material-symbols-outlined text-xl flex-shrink-0 mt-0.5 ${
                t.type === "success"
                  ? "text-emerald-400"
                  : t.type === "error"
                  ? "text-rose-400"
                  : t.type === "warning"
                  ? "text-amber-400"
                  : "text-gold-luxury"
              }`}
            >
              {t.type === "success"
                ? "check_circle"
                : t.type === "error"
                ? "error"
                : t.type === "warning"
                ? "warning"
                : "info"}
            </span>

            <div className="flex-1 leading-relaxed font-medium text-xs md:text-sm">{t.message}</div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1 p-0.5 rounded hover:bg-zinc-800"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return dummy fallback if called outside provider to prevent crashes
    return {
      toast: (msg: string) => console.log(msg),
      showSuccess: (msg: string) => console.log(msg),
      showError: (msg: string) => console.log(msg),
      showInfo: (msg: string) => console.log(msg),
      showWarning: (msg: string) => console.log(msg),
    };
  }
  return context;
}
