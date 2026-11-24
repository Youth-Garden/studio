import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"
import { Input } from "./Input"
import { Textarea } from "./Textarea"

export function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      className={cn(
        "relative flex h-8 w-full min-w-0 items-center rounded-md border border-zinc-800 bg-[#1b1b1b] transition-colors focus-within:border-zinc-500",
        className
      )}
      {...props}
    />
  )
}

export function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & { align?: "inline-start" | "inline-end" }) {
  return (
    <div
      className={cn(
        "flex h-auto items-center justify-center gap-1.5 px-2.5 text-xs font-medium text-zinc-400 select-none shrink-0",
        align === "inline-start" ? "order-first" : "order-last",
        className
      )}
      {...props}
    />
  )
}

export function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type={type}
      size={size}
      variant={variant}
      className={cn("h-7 px-2 text-xs shadow-none shrink-0", className)}
      {...props}
    />
  )
}

export function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 text-xs px-2 h-full",
        className
      )}
      {...props}
    />
  )
}

export function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-1.5 shadow-none ring-0 focus-visible:ring-0 text-xs",
        className
      )}
      {...props}
    />
  )
}
