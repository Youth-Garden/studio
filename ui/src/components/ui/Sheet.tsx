import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  side = "right",
  children,
  className,
}: SheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      {/* Backdrop phẳng chuẩn Meta */}
      <div
        className="fixed inset-0 bg-black/50 pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      {/* Panel trượt Sheet */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 flex flex-col bg-[#1b1b1b] border-zinc-800 text-zinc-100 shadow-2xl pointer-events-auto transition-transform duration-300 ease-in-out w-80 sm:w-96",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <div>
            {title && <h3 className="font-semibold text-xs text-zinc-100">{title}</h3>}
            {description && <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-zinc-400 hover:text-zinc-100">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-xs">{children}</div>
      </div>
    </div>
  );
}
