/**
 * useTheme.ts — React hook for theme state access.
 *
 * Returns the current theme and a toggle function via Nanostores useStore.
 */
import { useStore } from "@nanostores/react";
import { $theme, toggleTheme, type Theme } from "./themeStore";

export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const theme = useStore($theme);
  return { theme, toggleTheme };
}
