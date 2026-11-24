import type * as React from "react"
import { Icons } from "../../shared/icons"

export interface StudioLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

/**
 * Shared StudioLogo component:
 * Kết nối trực tiếp vào Unified Icon Registry với tên "logo"
 * Đảm bảo 100% đồng bộ hình dạng, kích thước và màu sắc giữa Dashboard & Editor view.
 */
export function StudioLogo({ size = 18, className, ...props }: StudioLogoProps) {
  return (
    <Icons name="logo" size={size} className={className} {...props} />
  )
}
