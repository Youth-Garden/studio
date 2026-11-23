import * as React from "react"
import { cn } from "../../lib/utils"

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const current = value !== undefined ? value : internalValue

  return (
    <div role="radiogroup" className={cn("grid gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<any>, {
          checked: (child.props as any).value === current,
          onChange: () => {
            if (value === undefined) setInternalValue((child.props as any).value)
            onValueChange?.((child.props as any).value)
          },
        })
      })}
    </div>
  )
}

export function RadioGroupItem({
  checked,
  onChange,
  disabled,
  className,
}: {
  value?: string
  checked?: boolean
  onChange?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <label
      onClick={disabled ? undefined : onChange}
      className={cn(
        "relative flex aspect-square size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 transition-colors select-none",
        checked && "border-emerald-500 bg-emerald-600",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {checked && <span className="size-1.5 rounded-full bg-white" />}
    </label>
  )
}
