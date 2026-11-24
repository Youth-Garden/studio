import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

export interface TooltipProps {
  children: React.ReactNode
  content?: React.ReactNode
  delay?: number
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
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

export function TooltipContent({
  children,
  side,
  sideOffset,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" | "left" | "right"; sideOffset?: number }) {
  return <div className={className} {...props}>{children}</div>
}

export function Tooltip({
  children,
  content: directContent,
  delay = 200,
  side: directSide = "top",
  sideOffset: directSideOffset = 6,
}: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tách con để hỗ trợ cả cú pháp 1: <Tooltip content="..."><Button/></Tooltip>
  // và cú pháp 2: <Tooltip><TooltipTrigger><Button/></TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>
  let resolvedTrigger: React.ReactNode = children
  let resolvedContent: React.ReactNode = directContent
  let side = directSide
  let sideOffset = directSideOffset

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TooltipTrigger) {
        resolvedTrigger = (child.props as any).children
      } else if (child.type === TooltipContent) {
        resolvedContent = (child.props as any).children
        if ((child.props as any).side) side = (child.props as any).side
        if ((child.props as any).sideOffset !== undefined) sideOffset = (child.props as any).sideOffset
      }
    }
  })

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    
    let top = 0
    let left = 0

    if (side === "top") {
      top = rect.top - sideOffset
      left = rect.left + rect.width / 2
    } else if (side === "bottom") {
      top = rect.bottom + sideOffset
      left = rect.left + rect.width / 2
    } else if (side === "left") {
      top = rect.top + rect.height / 2
      left = rect.left - sideOffset
    } else if (side === "right") {
      top = rect.top + rect.height / 2
      left = rect.right + sideOffset
    }

    const padding = 12
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1920
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 1080

    if (left < padding) left = padding
    if (left > windowWidth - padding) left = windowWidth - padding
    if (top < padding) top = padding
    if (top > windowHeight - padding) top = windowHeight - padding

    setCoords({ top, left })
  }, [side, sideOffset])

  const handleOpen = React.useCallback(() => {
    timerRef.current = setTimeout(() => {
      updatePosition()
      setIsOpen(true)
    }, delay)
  }, [delay, updatePosition])

  const handleClose = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, updatePosition])

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {resolvedTrigger}
      </div>

      {resolvedContent && isOpen && typeof document !== "undefined" && (
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                side === "top"
                  ? "translate(-50%, -100%)"
                  : side === "bottom"
                  ? "translate(-50%, 0)"
                  : side === "left"
                  ? "translate(-100%, -50%)"
                  : "translate(0, -50%)",
            }}
            className={cn(
              "pointer-events-none z-[9999] whitespace-nowrap rounded-md bg-[#18181b] px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-xl border-0 select-none animate-in fade-in-0 zoom-in-95 duration-100"
            )}
          >
            {resolvedContent}
          </div>,
          document.body
        )
      )}
    </>
  )
}
