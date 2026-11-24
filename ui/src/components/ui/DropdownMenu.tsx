"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Check, ChevronRight } from "lucide-react"

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

  // Positioning & scale-up animation styles
  const alignClass = 
    align === "end" || align === "right" 
      ? "right-0 origin-top-right" 
      : align === "center"
      ? "left-1/2 -translate-x-1/2 origin-top"
      : "left-0 origin-top-left"

  const sideClass =
    side === "top"
      ? "bottom-full mb-1 origin-bottom"
      : "top-full mt-1 origin-top"

  return (
    <div
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute z-50 min-w-36 overflow-hidden rounded-lg border border-zinc-800 bg-[#1e1e1e] p-1 text-zinc-100 shadow-xl ring-1 ring-white/5",
        "animate-in fade-in-0 zoom-in-95 duration-150 ease-out",
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
        "group/dropdown-menu-item relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 outline-none transition-colors duration-100",
        "hover:bg-[#2b2b30] hover:text-white",
        variant === "destructive" && "text-red-400 hover:bg-red-500/10 hover:text-red-300",
        inset && "pl-8",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: React.ComponentProps<"div"> & { checked?: boolean }) {
  const context = React.useContext(DropdownMenuContext)

  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
        context?.setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-8 pr-2.5 text-xs text-zinc-200 outline-none transition-colors",
        "hover:bg-[#2b2b30] hover:text-white",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex items-center justify-center">
        {checked && <Check className="w-3.5 h-3.5 text-sky-400" />}
      </span>
      {children}
    </div>
  )
}

export function DropdownMenuRadioGroup({
  className,
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <div data-slot="dropdown-menu-radio-group" className={className} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            checked: (child.props as any).value === value,
            onSelect: () => onValueChange?.((child.props as any).value),
          })
        }
        return child
      })}
    </div>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  checked,
  value,
  onSelect,
  ...props
}: React.ComponentProps<"div"> & {
  checked?: boolean
  value?: string
  onSelect?: () => void
}) {
  const context = React.useContext(DropdownMenuContext)

  return (
    <div
      data-slot="dropdown-menu-radio-item"
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
        context?.setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-8 pr-2.5 text-xs text-zinc-200 outline-none transition-colors",
        "hover:bg-[#2b2b30] hover:text-white",
        checked && "bg-[#2b2b30]/60 text-white font-medium",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex items-center justify-center">
        {checked && <Check className="w-3.5 h-3.5 text-sky-400" />}
      </span>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-zinc-800", className)}
      {...props}
    />
  )
}

export function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-[10px] tracking-widest text-zinc-500 font-mono",
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-[#2b2b30] hover:text-white",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
    </div>
  )
}

export function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      align="start"
      side="right"
      className={cn("min-w-32", className)}
      {...props}
    />
  )
}
