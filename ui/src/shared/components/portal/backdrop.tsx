import React, { useEffect } from "react";
import { cn } from "../../../lib/utils";

interface BackdropProps {
  isOpen?: boolean;
  onPress?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function Backdrop({ isOpen = true, onPress, style, className }: BackdropProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      onClick={onPress}
      style={style}
      className={cn(
        // Không dùng blur, chỉ dùng nền tối mờ tinh gọn phẳng theo đúng chuẩn
        "fixed inset-0 bg-black/50 transition-opacity duration-200 pointer-events-auto",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    />
  );
}
