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
          "flex w-full rounded-lg border-0 bg-[var(--bg-body)] text-[var(--text-primary)] shadow-sm transition-all duration-150",
          "placeholder:text-[var(--text-secondary)]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Sizes
          inputSize === "sm" && "h-7 px-2.5 text-[11px]",
          inputSize === "default" && "h-8 px-3 text-xs",
          inputSize === "lg" && "h-10 px-3.5 text-sm",
          // Error states
          error && "ring-1 ring-rose-500/80 focus-visible:ring-rose-500",
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
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-[10px] text-[var(--text-secondary)] leading-normal">
          {description}
        </p>
      )}
      {error && (
        <p className="text-[10px] font-medium text-red-400 leading-normal">
          {error}
        </p>
      )}
    </div>
  )
}
