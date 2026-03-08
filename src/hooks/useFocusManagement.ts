import { useRef, useEffect } from "react";

/**
 * Manages focus lifecycle for dropdown open/close.
 * - Stores previously focused element on open
 * - Moves focus into the container after render
 * - Restores focus to trigger on close
 * - SSR-safe (checks for `document` existence)
 */
export function useFocusManagement(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // SSR guard
    if (typeof document === "undefined") return;

    if (isOpen) {
      // Store the currently focused element before opening
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Move focus into the container
      const container = containerRef.current;
      if (container) {
        const firstFocusable = container.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          container.focus();
        }
      }
    } else {
      // Restore focus to the previously focused element on close
      const prev = previousFocusRef.current;
      if (prev && document.body.contains(prev)) {
        prev.focus();
      }
      previousFocusRef.current = null;
    }
  }, [isOpen, containerRef]);

  return { previousFocusRef };
}
