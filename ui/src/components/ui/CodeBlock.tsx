import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icons } from "../../shared/icons"
import { Button } from "./Button"

const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl text-xs bg-zinc-950 text-zinc-200 select-none",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-zinc-200",
        subtle: "bg-[#18181a] text-zinc-300",
        destructive: "bg-red-950/20 text-red-300",
      },
      size: {
        default: "text-xs",
        sm: "text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export function CodeBlock({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof codeBlockVariants>) {
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      data-size={size}
      className={cn(codeBlockVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-w-0 shrink-0 items-center justify-between gap-2 px-3 py-2 text-zinc-400 bg-zinc-900/60",
        className
      )}
      {...props}
    />
  )
}

export function CodeBlockTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-title"
      className={cn(
        "min-w-0 truncate font-mono text-[11px] font-medium text-zinc-300 flex items-center gap-1.5",
        className
      )}
      {...props}
    />
  )
}

export function CodeBlockActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn(
        "flex shrink-0 items-center gap-1",
        className
      )}
      {...props}
    />
  )
}

export function CodeBlockCopyButton({
  value,
  variant = "ghost",
  size = "icon-sm",
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Button
      data-slot="code-block-copy-button"
      data-copied={copied || undefined}
      variant={variant}
      size={size}
      title={copied ? "Đã sao chép!" : "Sao chép code"}
      className={cn(
        "h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        navigator.clipboard
          .writeText(value)
          .then(() => setCopied(true))
          .catch(() => {})
      }}
      {...props}
    >
      <Icons name={copied ? "check" : "copy"} size={12} className={copied ? "text-emerald-400" : ""} />
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  )
}

export function CodeBlockContent({
  className,
  children,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  ...props
}: React.ComponentProps<"pre"> & {
  wrap?: boolean
  lineNumbers?: boolean
  startLine?: number
}) {
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      tabIndex={0}
      className={cn(
        "min-h-0 min-w-0 overflow-auto p-3 text-start font-mono leading-relaxed outline-none select-text",
        wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        className
      )}
      {...props}
    >
      <code data-slot="code-block-code" className="block text-zinc-300">
        {lineNumbers && typeof children === "string"
          ? children
              .replace(/\n$/, "")
              .split("\n")
              .map((line, index) => (
                <div key={index} className="flex gap-3">
                  <span className="select-none text-zinc-600 font-mono text-[10px] w-5 text-right">
                    {startLine + index}
                  </span>
                  <span>{line || " "}</span>
                </div>
              ))
          : children}
      </code>
    </pre>
  )
}
