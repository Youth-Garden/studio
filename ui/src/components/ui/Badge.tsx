import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-800 text-zinc-100 border-transparent",
    secondary: "bg-zinc-900 text-zinc-400 border-zinc-800",
    outline: "text-zinc-300 border-zinc-700",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
  }[variant]

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium tracking-tight transition-colors",
        variantStyles,
        className
      )}
      {...props}
    />
  )
}
