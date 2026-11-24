import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface DialogProps {
  children?: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export function Dialog({
  children,
  className,
  onDismiss,
  showCloseButton = true,
}: DialogProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xl bg-[var(--bg-surface)] border-0 rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] space-y-4",
        className
      )}
    >
      {showCloseButton && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="absolute top-4 right-4 h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-lg"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-left pr-8", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-base font-semibold leading-none tracking-tight text-[var(--text-primary)]", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-[var(--text-secondary)] leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("py-2", className)}>{children}</div>;
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-2 pt-2", className)}>
      {children}
    </div>
  );
}
