import * as React from "react";
import { cn } from "../../lib/utils";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      // Dùng true (capture phase) để bắt sự kiện click bên ngoài ngay cả khi con stopPropagation
      window.addEventListener("click", handleOutsideClick, true);
    }
    return () => {
      window.removeEventListener("click", handleOutsideClick, true);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be inside DropdownMenu");

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        context.setOpen((prev) => !prev);
      }}
      className={cn("cursor-pointer inline-flex items-center", className)}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = "right",
  className,
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuContent must be inside DropdownMenu");

  if (!context.open) return null;

  const alignStyles = {
    left: "left-0 origin-top-left",
    right: "right-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top",
  }[align];

  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 min-w-[8rem] overflow-hidden rounded-md border border-zinc-800 bg-[#222222] p-1 text-zinc-100 shadow-2xl animate-dropdown",
        alignStyles,
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const context = React.useContext(DropdownMenuContext);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClick?.();
        context?.setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-100",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-zinc-800", className)} />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-2.5 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", className)}>
      {children}
    </div>
  );
}
