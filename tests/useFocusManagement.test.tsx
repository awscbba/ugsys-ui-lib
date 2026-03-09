import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useFocusManagement } from "../src/hooks/useFocusManagement";

// Minimal harness — exposes isOpen as prop so tests can control it via rerender
function Harness({ isOpen }: { isOpen: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusManagement(isOpen, containerRef);

  return (
    <div>
      <button data-testid="trigger">Trigger</button>
      {isOpen && (
        <div ref={containerRef} data-testid="container">
          <button data-testid="first-focusable">First</button>
          <button data-testid="second-focusable">Second</button>
        </div>
      )}
    </div>
  );
}

describe("useFocusManagement", () => {
  it("moves focus to first focusable element when opened", () => {
    const { rerender } = render(<Harness isOpen={false} />);
    act(() => {
      rerender(<Harness isOpen={true} />);
    });
    expect(screen.getByTestId("first-focusable")).toHaveFocus();
  });

  it("restores focus to previously focused element on close", () => {
    const { rerender } = render(<Harness isOpen={false} />);
    // Focus the trigger before opening
    screen.getByTestId("trigger").focus();

    act(() => {
      rerender(<Harness isOpen={true} />);
    });
    act(() => {
      rerender(<Harness isOpen={false} />);
    });

    expect(screen.getByTestId("trigger")).toHaveFocus();
  });

  it("does not throw when closed without prior open (previousFocus is null)", () => {
    // Start closed and stay closed — the else branch runs with null previousFocusRef
    expect(() => {
      const { rerender } = render(<Harness isOpen={false} />);
      act(() => {
        rerender(<Harness isOpen={false} />);
      });
    }).not.toThrow();
  });

  it("focuses container itself when no focusable child exists", () => {
    function HarnessNoChildren({ isOpen }: { isOpen: boolean }) {
      const containerRef = useRef<HTMLDivElement>(null);
      useFocusManagement(isOpen, containerRef);
      return (
        <div>
          {isOpen && (
            <div
              ref={containerRef}
              data-testid="empty-container"
              tabIndex={-1}
            />
          )}
        </div>
      );
    }

    const { rerender } = render(<HarnessNoChildren isOpen={false} />);
    act(() => {
      rerender(<HarnessNoChildren isOpen={true} />);
    });
    expect(screen.getByTestId("empty-container")).toHaveFocus();
  });
});
