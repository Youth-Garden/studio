"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  inputSize?: "sm" | "default" | "lg"
}

export const Input = React.forwardRef<HTMLInputElement, InputBaseProps>(
  ({ className, type = "text", error, inputSize = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "flex w-full rounded-md border bg-zinc-950 text-zinc-100 shadow-xs transition-all duration-150",
          "placeholder:text-zinc-500",
          "focus-visible:outline-none focus-visible:ring-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Sizes
          inputSize === "sm" && "h-7 px-2 text-[11px]",
          inputSize === "default" && "h-8 px-2.5 text-xs",
          inputSize === "lg" && "h-10 px-3 text-sm",
          // Error states
          error
            ? "border-red-500/80 focus-visible:border-red-500 focus-visible:ring-red-500/30"
            : "border-zinc-800 hover:border-zinc-700 focus-visible:border-zinc-500 focus-visible:ring-zinc-400/30",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
}

export function FormField({
  label,
  description,
  error,
  required,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div data-slot="form-field" className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 select-none">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-[10px] text-zinc-500 leading-tight">{description}</p>
      )}
      {error && (
        <p className="text-[10px] text-red-400 font-medium leading-tight">{error}</p>
      )}
    </div>
  )
}
