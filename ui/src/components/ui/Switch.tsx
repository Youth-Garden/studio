import * as React from "react"
import { cn } from "../../lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: "sm" | "default"
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, size = "default", ...props }, ref) => {
    const isSm = size === "sm"
    return (
      <label
        className={cn(
          "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-within:ring-2 focus-within:ring-zinc-400 select-none",
          isSm ? "h-3.5 w-6" : "h-5 w-9",
          checked ? "bg-emerald-600" : "bg-zinc-800",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
            isSm ? "size-2.5" : "size-4",
            checked
              ? isSm ? "translate-x-3" : "translate-x-4"
              : "translate-x-0.5"
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"
