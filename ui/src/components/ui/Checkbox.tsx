import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-zinc-700 bg-zinc-900 transition-colors focus-within:ring-2 focus-within:ring-zinc-400 select-none",
          checked && "border-emerald-500 bg-emerald-600 text-white",
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
        {checked && <Check className="size-3 text-white stroke-[3]" />}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"
