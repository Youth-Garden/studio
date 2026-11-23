import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

export function TraceLine({
  className,
  status,
  ...props
}: React.ComponentProps<"div"> & {
  status?: "running" | "error" | "pending" | "completed"
}) {
  return (
    <div
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-xs text-zinc-400 transition-colors",
        status === "error" && "text-red-400",
        status === "running" && "text-amber-400",
        status === "completed" && "text-emerald-400",
        className
      )}
      {...props}
    />
  )
}

export function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-3.5 shrink-0 items-center justify-center", className)}
      {...props}
    />
  )
}

export function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("min-w-0 truncate font-medium text-zinc-200", className)}
      {...props}
    />
  )
}

export function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("shrink-0 text-zinc-500 font-mono text-[10px]", className)}
      {...props}
    />
  )
}

export function TraceCollapsible({
  open,
  onOpenChange,
  children,
  className,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isExpanded = open !== undefined ? open : internalOpen

  const toggle = () => {
    if (open === undefined) setInternalOpen((prev) => !prev)
    onOpenChange?.(!isExpanded)
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col", className)}>
      <div onClick={toggle} className="cursor-pointer flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")} />
        {React.Children.toArray(children)[0]}
      </div>
      {isExpanded && (
        <div className="mt-1 ml-4 border-l border-zinc-800 pl-3 py-1 text-xs text-zinc-400">
          {React.Children.toArray(children).slice(1)}
        </div>
      )}
    </div>
  )
}
