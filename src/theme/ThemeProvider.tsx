/**
 * ThemeProvider.tsx — React component that initializes the theme store on mount.
 *
 * Wraps children and calls initializeTheme() with optional defaultTheme.
 */
import { useEffect, type ReactNode } from "react";
import { initializeTheme, type Theme } from "./themeStore";

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme,
}: ThemeProviderProps): ReactNode {
  useEffect(() => {
    initializeTheme(defaultTheme);
  }, [defaultTheme]);

  return children;
}
