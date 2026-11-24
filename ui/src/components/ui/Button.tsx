import * as React from "react"
import { cn } from "../../lib/utils"
import { useRipple } from "../../shared/hooks/use-ripple"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
  disableRipple?: boolean
  shimmer?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disableRipple = false, shimmer = false, onClick, children, ...props }, ref) => {
    const { createRipple, RippleContainer } = useRipple<HTMLButtonElement>()

    const variantStyles = {
      default: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm",
      secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
      outline: "border border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-300",
      ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100",
      destructive: "bg-red-900/40 text-red-300 border border-red-800/60 hover:bg-red-900/60",
    }[variant]

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-7 px-3 text-[11px]",
      lg: "h-10 px-6 text-sm",
      icon: "h-8 w-8 p-0",
      "icon-sm": "h-6 w-6 p-0",
    }[size]

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple && !props.disabled) {
        createRipple(e)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          shimmer && "shimmer-surface",
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      >
        {children}
        {!disableRipple && <RippleContainer />}
      </button>
    )
  }
)
Button.displayName = "Button"
