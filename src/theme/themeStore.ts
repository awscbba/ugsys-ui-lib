/**
 * themeStore.ts — Theme state management via Nanostores.
 *
 * Provides a reactive atom for theme ("light" | "dark"), toggle function,
 * localStorage persistence, DOM data-theme sync, and system preference detection.
 */
import { atom } from "nanostores";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ugsys-theme";

/** Reactive atom holding current theme */
export const $theme = atom<Theme>("light");

/** Internal flag: true if user has manually toggled */
let userHasToggled = false;

/** MediaQueryList for system preference */
let mediaQuery: MediaQueryList | null = null;

/** Apply theme to DOM */
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persist theme to localStorage */
function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}

/** Read persisted theme, returns null if invalid/missing */
export function readPersistedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
    if (value !== null) localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

/** Get system preference */
export function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Handle system preference change */
function handleSystemChange(e: MediaQueryListEvent): void {
  if (userHasToggled) return;
  const theme = e.matches ? "dark" : "light";
  $theme.set(theme);
  applyTheme(theme);
}

/** Toggle between light and dark */
export function toggleTheme(): void {
  userHasToggled = true;
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", handleSystemChange);
    mediaQuery = null;
  }
  const next = $theme.get() === "light" ? "dark" : "light";
  $theme.set(next);
  applyTheme(next);
  persistTheme(next);
}

/** Initialize theme store */
export function initializeTheme(defaultTheme?: Theme): void {
  const persisted = readPersistedTheme();

  if (persisted) {
    userHasToggled = true;
    $theme.set(persisted);
    applyTheme(persisted);
    return;
  }

  const systemPref = getSystemPreference();
  const initial = defaultTheme ?? systemPref;
  $theme.set(initial);
  applyTheme(initial);

  if (typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemChange);
  }
}

/** Reset internal state — exported for testing only */
export function _resetForTesting(): void {
  userHasToggled = false;
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", handleSystemChange);
    mediaQuery = null;
  }
  $theme.set("light");
  if (typeof document !== "undefined") {
    document.documentElement.removeAttribute("data-theme");
  }
}
