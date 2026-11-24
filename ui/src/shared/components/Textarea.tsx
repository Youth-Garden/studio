import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-0 bg-[var(--bg-body)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-secondary)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"
