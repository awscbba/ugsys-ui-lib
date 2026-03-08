# Changelog

All notable changes to `@ugsys/ui-lib` will be documented in this file.

## [0.1.0] - 2026-03-08

### Added

- **Design Tokens** — CSS custom properties in `tokens.css`: `--color-primary` (#161d2b), `--color-brand` (#FF9900), `--color-accent` (#4A90E2), `--color-footer` (#333333), `--color-background` (#F8F8F8), `--color-focus-ring` (#4A90E2), `--font-sans` (Open Sans stack)
- **Tailwind Preset** — `tailwind.preset.ts` extending theme with `primary`, `brand`, `accent`, `footer`, `background` colors, Open Sans font family, and `ring-accent` focus ring — all referencing CSS custom properties
- **Navbar component** — top navigation bar with brand wordmark, desktop/mobile responsive layout (hamburger menu at <768px), active link highlighting (`bg-brand text-primary`), external link support, `aria-label`, `aria-expanded`, and WCAG 2.1 AA keyboard navigation
- **Footer component** — copyright footer with `bg-footer` background, light text, optional link list with focus rings
- **UserMenu component** — authenticated user dropdown with avatar/initials trigger, full keyboard navigation (ArrowUp/Down, Home/End, Escape), `role="menu"` / `role="menuitem"` ARIA attributes, focus trap via `useFocusManagement`, outside-click close, profile link, extra items slot, and red-styled logout button
- **AdminEntry** (internal) — "Panel de Administración" menu item inside UserMenu, conditionally rendered when `user.roles.includes("admin") && adminPanelUrl` is truthy, visually distinguished with `text-brand` and shield icon
- **`useFocusManagement` hook** — manages focus lifecycle for dropdown open/close; stores previous focus, moves focus into container, restores on close; SSR-safe
- **Build pipeline** — tsup producing CJS + ESM + `.d.ts` outputs; `tokens.css` copied to `dist/`; TypeScript strict mode; build fails on type errors
- **Test suite** — Vitest + React Testing Library + fast-check property-based tests; jsdom environment; 80% line coverage gate
- **ESLint config** — TypeScript + `eslint-plugin-jsx-a11y` for accessibility lint
- **`justfile`** — `build`, `test`, `lint`, `release` recipes
