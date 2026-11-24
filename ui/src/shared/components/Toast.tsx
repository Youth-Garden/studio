import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsList: ToastItem[] = [];
const listeners: ToastListener[] = [];

export const toast = {
  show: (title: string, description?: string, variant: ToastItem["variant"] = "default", duration = 3000) => {
    // Nếu toast có cùng tiêu đề và mô tả đã tồn tại, không push trùng lặp
    const existingIndex = toastsList.findIndex(
      (t) => t.title === title && t.description === description
    );
    if (existingIndex > -1) {
      return;
    }

    const id = Math.random().toString(36).slice(2, 9);
    const item: ToastItem = { id, title, description, variant, duration };
    // Giới hạn tối đa 3 toast cùng lúc trên màn hình, đẩy cái cũ nhất ra
    toastsList = [...toastsList.slice(-2), item];
    listeners.forEach((l) => l(toastsList));

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
  },
  success: (title: string, description?: string) => toast.show(title, description, "success"),
  error: (title: string, description?: string) => toast.show(title, description, "error", 4500),
  dismiss: (id: string) => {
    toastsList = toastsList.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastsList));
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            // Phẳng, không dùng border thừa, shadow êm ái hiện đại
            "pointer-events-auto flex items-start gap-3 rounded-lg p-3.5 shadow-2xl transition-all duration-200 transform translate-y-0 select-none animate-in fade-in-0 slide-in-from-bottom-2",
            t.variant === "success" && "bg-[#18261e] text-emerald-200",
            t.variant === "error" && "bg-[#291818] text-red-200",
            t.variant === "default" && "bg-[#262628] text-zinc-100"
          )}
        >
          {t.variant === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          {t.variant === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          {t.variant === "default" && <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />}

          <div className="flex-1 space-y-0.5 text-xs">
            <p className="font-semibold">{t.title}</p>
            {t.description && <p className="text-[11px] opacity-80 leading-relaxed">{t.description}</p>}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="text-zinc-400 hover:text-zinc-200 shrink-0 p-0.5 rounded cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
