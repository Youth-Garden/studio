"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface DropdownMenuContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener("click", handleOutsideClick, true)
    }
    return () => {
      window.removeEventListener("click", handleOutsideClick, true)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be inside DropdownMenu")

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        context.setOpen((prev) => !prev)
      }}
      className={cn("cursor-pointer inline-flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center" | "left" | "right"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

export function DropdownMenuContent({
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuContent must be inside DropdownMenu")

  if (!context.open) return null

  const alignClass = 
    align === "end" || align === "right" 
      ? "right-0" 
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0"

  const sideClass =
    side === "top"
      ? "bottom-full mb-1.5"
      : "top-full mt-1.5"

  return (
    <div
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute z-50 min-w-40 overflow-hidden rounded-xl border-0 bg-[#1e1e22] p-1.5 text-zinc-100 shadow-2xl",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200 ease-out",
        sideClass,
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-group" className={cn("space-y-0.5", className)} {...props} />
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        "px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onClick,
  disabled,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
  variant?: "default" | "destructive"
  disabled?: boolean
}) {
  const context = React.useContext(DropdownMenuContext)

  return (
    <div
      data-slot="dropdown-menu-item"
      data-variant={variant}
      onClick={(e) => {
        e.stopPropagation()
        if (disabled) return
        onClick?.(e)
        context?.setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors duration-150",
        "hover:bg-zinc-800 hover:text-zinc-100 focus:bg-zinc-800",
        variant === "destructive" && "text-rose-400 hover:bg-rose-950/40 hover:text-rose-300",
        disabled && "pointer-events-none opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-zinc-800/80", className)}
      {...props}
    />
  )
}
