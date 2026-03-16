/**
 * useTheme.test.tsx — Unit tests for useTheme hook and ThemeProvider component.
 *
 * Tests: useTheme returns correct shape, ThemeProvider renders children,
 * ThemeProvider accepts defaultTheme prop, ThemeProvider sets data-theme on mount.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { ReactNode } from "react";

let useThemeModule: typeof import("../src/theme/useTheme");
let themeProviderModule: typeof import("../src/theme/ThemeProvider");
let themeStoreModule: typeof import("../src/theme/themeStore");

/** In-memory localStorage mock */
let store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function mockMatchMedia(prefersDark: boolean) {
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return mql;
}

/** Test component that consumes useTheme */
function ThemeConsumer(): ReactNode {
  const { theme, toggleTheme } = useThemeModule.useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

beforeEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  store = {};
  vi.restoreAllMocks();
  vi.resetModules();
  mockMatchMedia(false);

  themeStoreModule = await import("../src/theme/themeStore");
  useThemeModule = await import("../src/theme/useTheme");
  themeProviderModule = await import("../src/theme/ThemeProvider");
  themeStoreModule._resetForTesting();
});

describe("useTheme hook", () => {
  it("returns { theme, toggleTheme } shape", () => {
    themeStoreModule.initializeTheme("light");
    let result: ReturnType<typeof useThemeModule.useTheme> | undefined;

    function Capture(): ReactNode {
      result = useThemeModule.useTheme();
      return null;
    }

    render(<Capture />);
    expect(result).toBeDefined();
    expect(result!.theme).toBe("light");
    expect(typeof result!.toggleTheme).toBe("function");
  });

  it("reflects current theme value from store", () => {
    themeStoreModule.initializeTheme("dark");

    render(<ThemeConsumer />);
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("toggleTheme from hook updates theme reactively", () => {
    themeStoreModule.initializeTheme("light");

    render(<ThemeConsumer />);
    expect(screen.getByTestId("theme-value").textContent).toBe("light");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });
});

describe("ThemeProvider component", () => {
  it("renders children", () => {
    render(
      <themeProviderModule.ThemeProvider>
        <span data-testid="child">Hello</span>
      </themeProviderModule.ThemeProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("Hello");
  });

  it("accepts defaultTheme prop and initializes theme", () => {
    render(
      <themeProviderModule.ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </themeProviderModule.ThemeProvider>,
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("sets data-theme attribute on mount", () => {
    render(
      <themeProviderModule.ThemeProvider defaultTheme="dark">
        <span>content</span>
      </themeProviderModule.ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("defaults to system preference when no defaultTheme", () => {
    mockMatchMedia(true); // system prefers dark
    render(
      <themeProviderModule.ThemeProvider>
        <ThemeConsumer />
      </themeProviderModule.ThemeProvider>,
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("prefers localStorage over defaultTheme", () => {
    store["ugsys-theme"] = "dark";
    render(
      <themeProviderModule.ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </themeProviderModule.ThemeProvider>,
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });
});
