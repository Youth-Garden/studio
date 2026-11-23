import React, { useCallback, useMemo, useState } from "react";
import { usePortalStore } from "../store/portal.store";
import type { PortalProps } from "../types/portal.types";

interface UsePortalOptions {
  key?: string;
  disableCloseByBackdrop?: boolean;
  disableBackdrop?: boolean;
}

export function usePortal<T = unknown>(
  Component: React.ComponentType<PortalProps<T>>,
  options: UsePortalOptions = {}
): [(data?: T) => void, () => void, boolean] {
  const { onPresent, onDismiss, portals } = usePortalStore();
  const {
    key,
    disableCloseByBackdrop = false,
    disableBackdrop = false,
  } = options;

  const [generatedId] = useState(
    () => key || `portal_${Math.random().toString(36).substring(7)}`
  );

  const handlePresent = useCallback(
    (data?: T) => {
      onPresent({
        id: generatedId,
        component: Component as React.ComponentType<PortalProps<unknown>>,
        data,
        disableCloseByBackdrop,
        disableBackdrop,
      });
    },
    [onPresent, Component, generatedId, disableCloseByBackdrop, disableBackdrop]
  );

  const handleDismiss = useCallback(() => {
    onDismiss(generatedId);
  }, [onDismiss, generatedId]);

  const isOpen = useMemo(() => {
    return portals.some((portal) => portal.id === generatedId && portal.isOpen);
  }, [portals, generatedId]);

  return [handlePresent, handleDismiss, isOpen];
}

export function usePortalWithoutBackdrop<T = unknown>(
  Component: React.ComponentType<PortalProps<T>>,
  options: Omit<UsePortalOptions, 'disableBackdrop'> = {}
): [(data?: T) => void, () => void, boolean] {
  return usePortal<T>(Component, {
    ...options,
    disableBackdrop: true,
    disableCloseByBackdrop: true,
  });
}

export function useCloseAllPortals() {
  const { closeAllPortals } = usePortalStore();
  return closeAllPortals;
}
