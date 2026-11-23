import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePortalStore } from "../../store/portal.store";
import { Backdrop } from "./backdrop";
import type { PortalInstance } from "../../types/portal.types";

const emptySubscribe = () => () => {};

// Component wrapper để kích hoạt CSS Transition scale-in sau khi DOM vừa mount
function PortalItemWrapper({
  instance,
  index,
  onDismiss,
}: {
  instance: PortalInstance;
  index: number;
  onDismiss: (id?: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const Component = instance.component;
  const contentZIndex = 50 + index * 10 + 1;

  useEffect(() => {
    // Kích hoạt animation xuất hiện ngay lập tức
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const isVisible = mounted && instance.isOpen;

  return (
    <div
      style={{ zIndex: contentZIndex }}
      onClick={(e) => {
        // Nếu click trực tiếp vào vùng đệm flex (khoảng trống ngoài content modal)
        if (e.target === e.currentTarget) {
          if (!instance.disableCloseByBackdrop) {
            onDismiss(instance.id);
          }
        }
      }}
      className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl transform will-change-transform flex justify-center ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0 transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            : "opacity-0 scale-[0.90] translate-y-1 transition-all duration-100 ease-in"
        }`}
      >
        <Component
          id={instance.id}
          data={instance.data}
          isOpen={instance.isOpen}
          onDismiss={() => onDismiss(instance.id)}
        />
      </div>
    </div>
  );
}

export const PortalRenderer = () => {
  const { portals, onDismiss } = usePortalStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isClient || portals.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const topOpenPortal = [...portals].reverse().find((p) => p.isOpen);
        if (topOpenPortal && !topOpenPortal.disableCloseByBackdrop) {
          onDismiss(topOpenPortal.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClient, portals, onDismiss]);

  if (!isClient || portals.length === 0) return null;

  const activeBackdropIndex = portals.reduce((lastIdx, p, idx) => {
    if (!p.disableBackdrop && p.isOpen) return idx;
    return lastIdx;
  }, -1);

  const hasActiveBackdrop = activeBackdropIndex !== -1;
  const backdropZIndex = 50 + activeBackdropIndex * 10;

  const handleBackdropPress = () => {
    const topPortal = [...portals].reverse().find((p) => !p.disableBackdrop && p.isOpen);
    if (topPortal && !topPortal.disableCloseByBackdrop) {
      onDismiss(topPortal.id);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {hasActiveBackdrop && (
        <Backdrop
          isOpen={true}
          onPress={handleBackdropPress}
          style={{ zIndex: backdropZIndex }}
        />
      )}

      {portals.map((instance, index) => (
        <PortalItemWrapper
          key={instance.id}
          instance={instance}
          index={index}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    document.body
  );
};
