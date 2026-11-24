import { cn } from "../../lib/utils"
import { Group, Panel, Separator } from "react-resizable-panels"
import type * as React from "react"

export function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

export function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel {...props} />
}

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-1.5 items-center justify-center bg-zinc-900 transition-colors hover:bg-zinc-700 active:bg-zinc-500 cursor-col-resize select-none",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 h-6 w-0.5 rounded-full bg-zinc-600" />
      )}
    </Separator>
  )
}
