/**
 * themeStore.test.ts — Unit + property-based tests for theme state management.
 *
 * Unit tests: toggle, localStorage, DOM sync, system preference
 * Property tests: P1 (self-inverse), P2 (persistence), P3 (DOM sync), P4 (manual stops system)
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import fc from "fast-check";

let themeModule: typeof import("../src/theme/themeStore");

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

/** Helper to create a mock matchMedia */
function mockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(
      (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
    ),
    removeEventListener: vi.fn(
      (_: string, cb: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
    ),
    dispatchChange: (matches: boolean) => {
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return mql;
}

beforeEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  store = {};
  vi.restoreAllMocks();
  vi.resetModules();
  themeModule = await import("../src/theme/themeStore");
  themeModule._resetForTesting();
});

describe("themeStore — unit tests", () => {
  it("toggleTheme flips light to dark", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme("light");
    expect(themeModule.$theme.get()).toBe("light");
    themeModule.toggleTheme();
    expect(themeModule.$theme.get()).toBe("dark");
  });

  it("toggleTheme flips dark to light", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme("dark");
    expect(themeModule.$theme.get()).toBe("dark");
    themeModule.toggleTheme();
    expect(themeModule.$theme.get()).toBe("light");
  });

  it("double toggle restores original theme", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme("light");
    themeModule.toggleTheme();
    themeModule.toggleTheme();
    expect(themeModule.$theme.get()).toBe("light");
  });

  it("persists theme to localStorage on toggle", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme("light");
    themeModule.toggleTheme();
    expect(localStorage.getItem("ugsys-theme")).toBe("dark");
  });

  it("reads persisted theme from localStorage on init", () => {
    mockMatchMedia(false);
    localStorage.setItem("ugsys-theme", "dark");
    themeModule.initializeTheme();
    expect(themeModule.$theme.get()).toBe("dark");
  });

  it("syncs data-theme attribute on DOM after toggle", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme("light");
    themeModule.toggleTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to system preference when no localStorage", () => {
    mockMatchMedia(true);
    themeModule.initializeTheme();
    expect(themeModule.$theme.get()).toBe("dark");
  });

  it("falls back to light when system prefers light and no localStorage", () => {
    mockMatchMedia(false);
    themeModule.initializeTheme();
    expect(themeModule.$theme.get()).toBe("light");
  });

  it("manual toggle stops system preference listener", () => {
    const mql = mockMatchMedia(false);
    themeModule.initializeTheme();
    expect(mql.addEventListener).toHaveBeenCalled();

    themeModule.toggleTheme();
    expect(mql.removeEventListener).toHaveBeenCalled();

    const themeAfterToggle = themeModule.$theme.get();
    mql.dispatchChange(true);
    expect(themeModule.$theme.get()).toBe(themeAfterToggle);
  });

  it("cleans invalid localStorage values on init", () => {
    mockMatchMedia(false);
    localStorage.setItem("ugsys-theme", "invalid-value");
    themeModule.initializeTheme();
    expect(localStorage.getItem("ugsys-theme")).toBeNull();
  });
});

const themeArb = fc.constantFrom("light" as const, "dark" as const);

describe("themeStore — property-based tests", () => {
  it("Property 1: toggle is self-inverse", () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        themeModule._resetForTesting();
        store = {};
        mockMatchMedia(false);
        themeModule.initializeTheme(initial);
        const before = themeModule.$theme.get();
        themeModule.toggleTheme();
        expect(themeModule.$theme.get()).not.toBe(before);
        themeModule.toggleTheme();
        expect(themeModule.$theme.get()).toBe(before);
      }),
      { numRuns: 100 },
    );
  });

  it("Property 2: persistence round-trip", () => {
    fc.assert(
      fc.property(
        themeArb,
        fc.integer({ min: 1, max: 5 }),
        (initial, toggleCount) => {
          themeModule._resetForTesting();
          store = {};
          mockMatchMedia(false);
          themeModule.initializeTheme(initial);
          for (let i = 0; i < toggleCount; i++) {
            themeModule.toggleTheme();
          }
          const finalTheme = themeModule.$theme.get();
          expect(localStorage.getItem("ugsys-theme")).toBe(finalTheme);

          // Simulate fresh load: reset state and re-initialize from localStorage
          themeModule._resetForTesting();
          mockMatchMedia(false);
          themeModule.initializeTheme();
          expect(themeModule.$theme.get()).toBe(finalTheme);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 3: DOM synchronization on theme change", () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        themeModule._resetForTesting();
        store = {};
        document.documentElement.removeAttribute("data-theme");
        mockMatchMedia(false);
        themeModule.initializeTheme(initial);
        expect(document.documentElement.getAttribute("data-theme")).toBe(
          initial,
        );
        themeModule.toggleTheme();
        const expected = initial === "light" ? "dark" : "light";
        expect(document.documentElement.getAttribute("data-theme")).toBe(
          expected,
        );
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4: manual toggle stops system preference tracking", () => {
    fc.assert(
      fc.property(themeArb, fc.boolean(), (initial, systemDark) => {
        themeModule._resetForTesting();
        store = {};
        const mql = mockMatchMedia(false);
        themeModule.initializeTheme(initial);
        themeModule.toggleTheme();
        const themeAfterToggle = themeModule.$theme.get();
        mql.dispatchChange(systemDark);
        expect(themeModule.$theme.get()).toBe(themeAfterToggle);
      }),
      { numRuns: 100 },
    );
  });
});
