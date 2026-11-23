import type * as React from "react"
import { cn } from "../../lib/utils"

export interface StudioLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

/**
 * Biểu tượng độc quyền của Studio Flow:
 * Tổ hợp hình học Geometric Topology biểu thị mô hình Node Graph phân tầng:
 * 4 Node (Trigger -> Processing -> Matting -> Output) liên kết qua các dòng chảy dữ liệu.
 */
export function StudioLogo({ size = 20, className, ...props }: StudioLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      {/* Khối nền hình thoi trung tâm */}
      <rect
        x="9.5"
        y="2"
        width="5"
        height="5"
        rx="1.25"
        transform="rotate(45 9.5 2)"
        className="fill-zinc-200"
      />
      
      {/* Node trái & Node phải */}
      <rect
        x="2"
        y="9.5"
        width="5"
        height="5"
        rx="1.25"
        className="fill-zinc-400"
      />
      <rect
        x="17"
        y="9.5"
        width="5"
        height="5"
        rx="1.25"
        className="fill-zinc-400"
      />

      {/* Node trung tâm hợp nhất */}
      <circle
        cx="12"
        cy="12"
        r="2.5"
        className="fill-zinc-100"
      />

      {/* Node đầu ra kết quả (Output Terminal) */}
      <rect
        x="9.5"
        y="17"
        width="5"
        height="5"
        rx="1.25"
        transform="rotate(45 9.5 17)"
        className="fill-zinc-300"
      />

      {/* Các đường dây nối logic Topological DAG */}
      <path
        d="M6 12H9.5M14.5 12H18M12 6V9.5M12 14.5V18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-zinc-600"
      />
    </svg>
  )
}
