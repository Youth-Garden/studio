import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const tabsListVariants = cva(
  "inline-flex w-fit items-center justify-center rounded-lg p-1 bg-[#262626] border border-zinc-800 text-zinc-400 select-none",
  {
    variants: {
      variant: {
        default: "",
        line: "bg-transparent border-b border-zinc-800 rounded-none p-0 gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TabsContextValue {
  value?: string
  onValueChange?: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({})

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [active, setActive] = React.useState(defaultValue || "")
  const current = value !== undefined ? value : active

  const handleSelect = (v: string) => {
    if (value === undefined) setActive(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value: current, onValueChange: handleSelect }}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsListVariants>) {
  return (
    <div
      role="tablist"
      className={cn("relative", tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative z-10 inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium select-none cursor-pointer transition-all duration-200 ease-out",
        isSelected
          ? "bg-zinc-800 text-zinc-100 shadow-sm ring-1 ring-white/5"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: selectedValue } = React.useContext(TabsContext)
  if (selectedValue !== value) return null

  return (
    <div role="tabpanel" className={cn("flex-1 text-xs outline-none", className)} {...props}>
      {children}
    </div>
  )
}
