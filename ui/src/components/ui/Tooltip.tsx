import * as React from "react"
import { cn } from "../../lib/utils"

interface TooltipContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue>({
  isOpen: false,
  setIsOpen: () => {},
})

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export interface TooltipProps {
  children: React.ReactNode
  content?: React.ReactNode
  delay?: number
}

export function Tooltip({ children, content, delay = 200 }: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpen = React.useCallback(() => {
    timerRef.current = setTimeout(() => setIsOpen(true), delay)
  }, [delay])

  const handleClose = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOpen(false)
  }, [])

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <div 
        className="relative inline-flex items-center"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {children}
        {content && isOpen && (
          <TooltipContent side="top">
            {content}
          </TooltipContent>
        )}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ 
  children, 
  asChild = false,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  return (
    <div className={cn("inline-flex items-center", className)} {...props}>
      {children}
    </div>
  )
}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

export function TooltipContent({
  side = "top",
  sideOffset = 6,
  className,
  children,
  ...props
}: TooltipContentProps) {
  const { isOpen } = React.useContext(TooltipContext)

  if (!isOpen) return null

  const sideStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  }[side]

  return (
    <div
      role="tooltip"
      style={{
        marginTop: side === "bottom" ? `${sideOffset}px` : undefined,
        marginBottom: side === "top" ? `${sideOffset}px` : undefined,
        marginLeft: side === "right" ? `${sideOffset}px` : undefined,
        marginRight: side === "left" ? `${sideOffset}px` : undefined,
      }}
      className={cn(
        "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[#18181b] px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-xl ring-1 ring-white/10 animate-in fade-in-0 zoom-in-95 duration-150 select-none",
        sideStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
