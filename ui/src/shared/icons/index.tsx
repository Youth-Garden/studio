import type { SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import { iconRegistry, type IconComponent } from "./registry";

export interface IconsProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  name: string;
  size?: number | string;
  className?: string;
}

/**
 * Chuyển kebab-case thành PascalCase (ví dụ: "arrow-right" -> "ArrowRight")
 */
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function Icons({ name, size = 16, className, ...props }: IconsProps) {
  // Tier 1: Tra cứu trực tiếp trong registry đã đăng ký
  let Component: IconComponent | undefined = iconRegistry[name];

  // Tier 2: Dynamic fallback tự động chuyển đổi PascalCase từ LucideIcons
  if (!Component) {
    const pascalName = toPascalCase(name);
    const LucideComp = (LucideIcons as unknown as Record<string, IconComponent>)[pascalName];
    if (LucideComp) {
      Component = LucideComp;
    }
  }

  // Tier 3: Cảnh báo môi trường dev nếu không tìm thấy icon
  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[Icons Registry] Icon "${name}" chưa được đăng ký trong iconRegistry hoặc lucide-react.`);
    }
    return null;
  }

  return (
    <Component
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

export { iconRegistry };
