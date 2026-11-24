"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string
  label: React.ReactNode
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

interface SelectContextValue {
  value?: string
  onSelect: (val: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedLabel: React.ReactNode
  setSelectedLabel: (label: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Chọn một mục...",
  disabled = false,
  className,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState<React.ReactNode>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleSelect = React.useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val)
      onValueChange?.(val)
      setOpen(false)
    },
    [isControlled, onValueChange]
  )

  // Đóng khi click ngoài
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener("click", handleOutside, true)
    }
    return () => {
      window.removeEventListener("click", handleOutside, true)
    }
  }, [open])

  // Cập nhật selected label từ options nếu có
  React.useEffect(() => {
    if (options && currentValue) {
      const found = options.find((o) => o.value === currentValue)
      if (found) setSelectedLabel(found.label)
    }
  }, [options, currentValue])

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onSelect: handleSelect,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <div
        ref={containerRef}
        data-slot="select"
        className={cn("relative w-full", className)}
      >
        {options ? (
          <>
            <SelectTrigger disabled={disabled} className="w-full">
              <span className="truncate">
                {selectedLabel || placeholder}
              </span>
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.description && (
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </>
        ) : (
          children
        )}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be inside Select")

  return (
    <button
      type="button"
      data-slot="select-trigger"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) context.setOpen((prev) => !prev)
      }}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 shadow-xs transition-all duration-150 select-none",
        "hover:border-zinc-700 hover:bg-[#1f1f23]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/30 focus-visible:border-zinc-500",
        context.open && "border-zinc-600 ring-1 ring-zinc-400/20 bg-[#1f1f23]",
        disabled && "pointer-events-none opacity-50 bg-zinc-900/50",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-left truncate">{children}</div>
      <ChevronDown
        className={cn(
          "w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150",
          context.open && "rotate-180 text-zinc-200"
        )}
      />
    </button>
  )
}

export function SelectValue({
  placeholder = "Chọn một mục...",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be inside Select")

  return (
    <span className={cn("truncate", !context.value && "text-zinc-500", className)}>
      {context.selectedLabel || placeholder}
    </span>
  )
}

export function SelectContent({
  className,
  children,
  align = "start",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be inside Select")

  if (!context.open) return null

  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-lg border border-zinc-800 bg-[#1e1e1e] p-1 text-zinc-100 shadow-xl ring-1 ring-white/5",
        "animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top",
        align === "end" && "left-auto right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  value,
  children,
  disabled = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be inside Select")

  const isSelected = context.value === value

  React.useEffect(() => {
    if (isSelected && typeof children === "string") {
      context.setSelectedLabel(children)
    }
  }, [isSelected, children, context])

  return (
    <div
      data-slot="select-item"
      data-selected={isSelected || undefined}
      onClick={(e) => {
        e.stopPropagation()
        if (disabled) return
        context.setSelectedLabel(children)
        context.onSelect(value)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-300 outline-none transition-colors duration-100",
        "hover:bg-[#2b2b30] hover:text-white",
        isSelected && "bg-[#2b2b30] text-white font-medium",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...props}
    >
      <div className="flex-1 truncate">{children}</div>
      {isSelected && (
        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      )}
    </div>
  )
}

export function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-group" className={cn("space-y-0.5", className)} {...props} />
}

export function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", className)}
      {...props}
    />
  )
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-zinc-800", className)} {...props} />
}
