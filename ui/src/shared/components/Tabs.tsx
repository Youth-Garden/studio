import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const tabsListVariants = cva(
  "relative inline-flex w-fit items-center justify-center rounded-lg p-1 bg-[#18181a] text-zinc-400 select-none overflow-hidden",
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

interface TabIndicatorStyle {
  left: number
  width: number
  opacity: number
}

interface TabsContextValue {
  value?: string
  onValueChange?: (val: string) => void
  registerTrigger: (value: string, element: HTMLButtonElement | null) => void
  indicatorStyle: TabIndicatorStyle
}

const TabsContext = React.createContext<TabsContextValue>({
  registerTrigger: () => {},
  indicatorStyle: { left: 0, width: 0, opacity: 0 },
})

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

  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = React.useState<TabIndicatorStyle>({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const registerTrigger = React.useCallback(
    (val: string, element: HTMLButtonElement | null) => {
      if (element) {
        triggerRefs.current.set(val, element)
      } else {
        triggerRefs.current.delete(val)
      }
    },
    []
  )

  // Cập nhật vị trí và kích thước của thanh trượt (Sliding Pill Indicator)
  const updateIndicator = React.useCallback(() => {
    if (!current) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const currentEl = triggerRefs.current.get(current)
    if (currentEl && currentEl.offsetWidth > 0) {
      setIndicatorStyle({
        left: currentEl.offsetLeft,
        width: currentEl.offsetWidth,
        opacity: 1,
      })
    }
  }, [current])

  React.useLayoutEffect(() => {
    updateIndicator()
    const timer = setTimeout(updateIndicator, 50)
    const timer2 = setTimeout(updateIndicator, 200)
    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [current, updateIndicator])

  React.useEffect(() => {
    window.addEventListener("resize", updateIndicator)
    
    // Tự động lắng nghe thay đổi kích thước container (khi kéo resize sidebar)
    let ro: ResizeObserver | null = null
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateIndicator()
      })
      ro.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", updateIndicator)
      ro?.disconnect()
    }
  }, [updateIndicator])

  const handleSelect = (v: string) => {
    if (value === undefined) setActive(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider
      value={{
        value: current,
        onValueChange: handleSelect,
        registerTrigger,
        indicatorStyle,
      }}
    >
      <div ref={containerRef} className={cn("flex flex-col gap-2", className)} {...props}>
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
  const { indicatorStyle } = React.useContext(TabsContext)

  return (
    <div
      role="tablist"
      className={cn("relative", tabsListVariants({ variant }), className)}
      {...props}
    >
      {/* Sliding Tab Indicator */}
      <div
        className="pointer-events-none absolute top-1 bottom-1 rounded-md bg-zinc-800 shadow-sm transition-[left,width,opacity] duration-200 ease-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
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
  const { value: selectedValue, onValueChange, registerTrigger } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    registerTrigger(value, buttonRef.current)
    return () => {
      registerTrigger(value, null)
    }
  }, [value, registerTrigger])

  return (
    <button
      ref={buttonRef}
      role="tab"
      type="button"
      aria-selected={isSelected}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors select-none",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "text-zinc-100 font-semibold" : "text-zinc-400 hover:text-zinc-200",
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
    <div
      role="tabpanel"
      className={cn("mt-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}
