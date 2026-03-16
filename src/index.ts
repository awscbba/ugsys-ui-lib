// Components
export { Navbar } from "./components/Navbar";
export { Footer } from "./components/Footer";
export { UserMenu } from "./components/UserMenu";
export { LoginCard } from "./components/LoginCard";
export type { LoginCardProps } from "./components/LoginCard";

// Hooks
export { useFocusManagement } from "./hooks/useFocusManagement";

// Theme
export { ThemeProvider } from "./theme/ThemeProvider";
export type { ThemeProviderProps } from "./theme/ThemeProvider";
export { useTheme } from "./theme/useTheme";
export type { UseThemeReturn } from "./theme/useTheme";
export { $theme, toggleTheme, initializeTheme } from "./theme/themeStore";
export type { Theme } from "./theme/themeStore";

// Types
export type { RenderLink, LinkItem, UserInfo, ExtraMenuItem } from "./types";
export { defaultRenderLink } from "./types";
