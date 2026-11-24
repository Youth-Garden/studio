import type { SVGProps } from "react";

export interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Biểu tượng độc quyền thống nhất của Studio Flow:
 * Tổ hợp hình học Geometric Topology biểu thị mô hình Node Graph phân tầng:
 * 4 Node (Trigger -> Processing -> Matting -> Output) liên kết qua các dòng chảy dữ liệu.
 */
export function StudioLogoIcon({ className, size = 18, ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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

      {/* Node chân đế Output */}
      <rect
        x="9.5"
        y="17"
        width="5"
        height="5"
        rx="1.25"
        className="fill-zinc-300"
      />

      {/* Đường nối DAG Flow liên kết */}
      <path
        d="M6 12L10.5 5.5M18 12L13.5 5.5M6 14L10.5 18M18 14L13.5 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-600"
      />

      {/* Node hạt nhân xử lý AI trung tâm */}
      <circle cx="12" cy="12" r="1.75" className="fill-zinc-100" />
    </svg>
  );
}
