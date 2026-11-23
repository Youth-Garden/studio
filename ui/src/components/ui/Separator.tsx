import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const separatorVariants = cva(
  "shrink-0 bg-zinc-800",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "w-px self-stretch",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  orientation?: "horizontal" | "vertical"
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
}
