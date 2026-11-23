import * as React from "react";

export interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple<T extends HTMLElement>() {
  const [ripples, setRipples] = React.useState<RippleItem[]>([]);
  const lastRippleTimeRef = React.useRef(0);

  const createRipple = React.useCallback((event: React.MouseEvent<T>) => {
    const now = Date.now();
    // Throttle chống spam click liên tục (< 180ms)
    if (now - lastRippleTimeRef.current < 180) {
      return;
    }
    lastRippleTimeRef.current = now;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    // Tọa độ click tương đối bên trong phần tử
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Bán kính phủ toàn diện (Bounding Diagonal)
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple: RippleItem = {
      id: now,
      x,
      y,
      size,
    };

    // Giữ tối đa 2 ripples cùng chạy đồng thời
    setRipples((prev) => [...prev.slice(-1), newRipple]);

    // Tự động dọn dẹp sau 550ms hết chu kỳ animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 550);
  }, []);

  const RippleContainer = React.useCallback(() => {
    if (ripples.length === 0) return null;

    return (
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 animate-ripple"
            style={{
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </span>
    );
  }, [ripples]);

  return { createRipple, RippleContainer };
}
