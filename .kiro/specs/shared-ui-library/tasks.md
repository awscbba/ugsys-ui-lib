# Implementation Plan: Shared UI Library (`ugsys-ui-lib`)

## Overview

Build the `@ugsys/ui-lib` React component library from scratch in the blank `ugsys-ui-lib` repo, then integrate it into both consumer applications (projects-registry and admin-panel). Tasks progress from project scaffolding → design tokens → components → testing → consumer integration → versioning.

## Tasks

- [x] 1. Scaffold project structure and build pipeline
  - [x] 1.1 Create `package.json` with `name: "@ugsys/ui-lib"`, `main`, `module`, `types`, `exports` map, and `peerDependencies` (react ^18.0.0 || ^19.0.0, react-dom ^18.0.0 || ^19.0.0, tailwindcss ^4.0.0)
    - Add devDependencies: tsup, typescript, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, fast-check, eslint, eslint-plugin-jsx-a11y, @vitest/coverage-v8
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 1.2 Create `tsconfig.json` with strict mode, JSX react-jsx, and `tsup.config.ts` producing CJS + ESM + .d.ts outputs
    - tsup must copy `tokens.css` into `dist/`
    - Build must fail on TypeScript type errors (non-zero exit code)
    - _Requirements: 1.3, 1.7_

  - [x] 1.3 Create `vitest.config.ts` with jsdom environment, coverage thresholds (80% lines), and `tests/setup.ts` with @testing-library/jest-dom
    - _Requirements: 10.1, 10.6_

  - [x] 1.4 Create `eslint.config.js` with TypeScript + jsx-a11y plugin configuration
    - _Requirements: 10.5_

  - [x] 1.5 Create the directory structure: `src/components/Navbar/`, `src/components/Footer/`, `src/components/UserMenu/`, `src/hooks/`, `src/tokens/`, and `tests/`
    - _Requirements: 1.1_

- [x] 2. Implement design tokens and Tailwind preset
  - [x] 2.1 Create `src/tokens/tokens.css` with CSS custom properties: `--color-primary` (#161d2b), `--color-brand` (#FF9900), `--color-accent` (#4A90E2), `--color-footer` (#333333), `--color-background` (#F8F8F8), `--color-focus-ring` (#4A90E2), `--font-sans` (Open Sans stack)
    - _Requirements: 2.1, 2.5_

  - [x] 2.2 Create `tailwind.preset.ts` extending theme with colors (primary, brand, accent, footer, background), fontFamily (sans: Open Sans), and ringColor (accent) — all referencing CSS custom properties
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 3. Implement shared types and barrel export
  - [x] 3.1 Create `src/types.ts` with `RenderLink`, `defaultRenderLink`, `LinkItem`, `UserInfo`, and `ExtraMenuItem` type definitions
    - _Requirements: 3.1, 3.2, 4.2, 5.1, 5.6_

  - [x] 3.2 Create `src/index.ts` barrel export re-exporting Navbar, Footer, UserMenu, types, and `useFocusManagement` hook
    - _Requirements: 1.5_

- [x] 4. Checkpoint — Verify build pipeline
  - Run `npm install`, `tsc --noEmit`, and `npx tsup` to confirm the project compiles and builds correctly. Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Footer component
  - [x] 5.1 Create `src/components/Footer/Footer.tsx` accepting `year` (number), optional `links` (LinkItem[]), and optional `renderLink` (RenderLink) props
    - Render "© {year} AWS User Group Cochabamba" copyright text
    - Apply `bg-footer` background and light text (#F8F8F8) for contrast
    - Render optional links as horizontal list with focus rings (`ring-accent`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Create `src/components/Footer/index.ts` barrel export
    - _Requirements: 1.5_

  - [ ]* 5.3 Write unit tests for Footer in `tests/Footer.test.tsx`
    - Test: renders copyright with provided year
    - Test: applies `bg-footer` class
    - Test: renders light text color class for contrast
    - Test: renders link elements when `links` prop provided
    - Test: empty links array renders no link elements (edge case)
    - _Requirements: 10.1_

  - [ ]* 5.4 Write property test for Footer — Property 3: Footer renders year and links
    - **Property 3: Footer renders year and links**
    - For any valid year (1970–2100) and any array of LinkItem objects, Footer renders copyright containing the year and one link per item with matching label
    - **Validates: Requirements 4.1, 4.2**

- [x] 6. Implement useFocusManagement hook
  - [x] 6.1 Create `src/hooks/useFocusManagement.ts` — manages focus lifecycle for dropdown open/close
    - Store previously focused element on open
    - Move focus into dropdown container after render
    - Restore focus to trigger on close
    - SSR-safe (check `document` existence)
    - _Requirements: 5.4_

  - [ ]* 6.2 Write unit tests for useFocusManagement in `tests/useFocusManagement.test.tsx`
    - Test: focus moves to container ref on open
    - Test: focus restores to previous element on close
    - _Requirements: 10.1_

- [x] 7. Implement UserMenu component with AdminEntry
  - [x] 7.1 Create `src/components/UserMenu/AdminEntry.tsx` — internal sub-component (not exported)
    - Accept `adminPanelUrl` and `onClose` props
    - Render "Panel de Administración" label with `text-brand` accent and shield icon
    - Navigate via `<a href={adminPanelUrl}>` (same-tab)
    - _Requirements: 6.2, 6.4, 6.5_

  - [x] 7.2 Create `src/components/UserMenu/UserMenu.tsx` accepting `user` (UserInfo), `onLogout`, optional `adminPanelUrl`, optional `profileHref`, optional `extraItems` (ExtraMenuItem[]), optional `renderLink` (RenderLink)
    - Trigger button: show avatar `<img>` when `avatarUrl` provided, otherwise initials circle (`bg-brand text-primary`)
    - Dropdown opens on click or Enter/Space on trigger
    - Dropdown has `role="menu"`, items have `role="menuitem"`
    - Arrow keys navigate items, Home/End jump to first/last, Escape closes and returns focus to trigger
    - Focus trapped within dropdown while open (use `useFocusManagement`)
    - Header shows user name + email
    - Render "Mi Perfil" link when `profileHref` provided
    - Render AdminEntry when `user.roles.includes("admin") && adminPanelUrl` is truthy
    - Render `extraItems` as menuitems
    - "Cerrar Sesión" button invokes `onLogout`, styled in red
    - Outside click closes dropdown
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.6_

  - [x] 7.3 Create `src/components/UserMenu/index.ts` barrel export (export UserMenu only, AdminEntry is internal)
    - _Requirements: 6.1_

  - [ ]* 7.4 Write unit tests for UserMenu in `tests/UserMenu.test.tsx`
    - Test: click opens dropdown with `role="menu"`
    - Test: Enter/Space on trigger opens dropdown
    - Test: Escape closes dropdown and returns focus to trigger
    - Test: ArrowDown/ArrowUp navigate menuitems
    - Test: Home/End jump to first/last menuitem
    - Test: outside click closes dropdown
    - Test: `onLogout` callback invoked on logout click
    - Test: dropdown items have `role="menuitem"`
    - Test: AdminEntry has `text-brand` class for visual distinction
    - Test: profile link renders when `profileHref` provided
    - Test: profile link absent when `profileHref` omitted
    - Test: AdminEntry visible when roles includes "admin" AND adminPanelUrl provided
    - Test: AdminEntry hidden when roles does NOT include "admin"
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 7.5 Write property test — Property 4: UserMenu avatar vs initials display
    - **Property 4: UserMenu avatar vs initials display**
    - For any UserInfo, if avatarUrl is non-empty then trigger contains `<img>` with that src; if absent/empty, trigger contains initials text and no `<img>`
    - **Validates: Requirements 5.2**

  - [ ]* 7.6 Write property test — Property 5: UserMenu renders all extra items
    - **Property 5: UserMenu renders all extra items**
    - For any array of ExtraMenuItem objects with non-empty labels, when dropdown is open, each extra item appears as a menuitem with matching label text
    - **Validates: Requirements 5.6**

  - [ ]* 7.7 Write property test — Property 6: AdminEntry visibility determined by role and URL
    - **Property 6: AdminEntry visibility is determined by role and URL**
    - For any UserInfo and adminPanelUrl value, "Panel de Administración" is visible iff roles includes "admin" AND adminPanelUrl is non-empty string; when visible, anchor href equals adminPanelUrl
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 8. Checkpoint — Core components complete
  - Run `tsc --noEmit`, `vitest run --coverage`, and `npx tsup` to verify all components compile, tests pass, and build succeeds. Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Navbar component
  - [x] 9.1 Create `src/components/Navbar/Navbar.tsx` accepting `links` (LinkItem[]), optional `userMenuSlot` (ReactNode), optional `renderLink` (RenderLink), optional `brandSubtitle` (string)
    - Render brand wordmark "AWS User Group Cochabamba" on the left with `text-brand` subtitle
    - Desktop (≥768px): horizontal nav links + userMenuSlot on the right
    - Mobile (<768px): hamburger button toggles vertical menu panel
    - Active links get `bg-brand text-primary` highlight
    - External links render with `target="_blank" rel="noopener noreferrer"`
    - Apply `bg-primary` background
    - All interactive elements have `focus-visible:outline-2 focus-visible:outline-accent` ring
    - Hamburger toggle operable via Enter/Space, nav has `aria-label`
    - `aria-expanded` attribute on hamburger button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 9.2 Create `src/components/Navbar/index.ts` barrel export
    - _Requirements: 1.5_

  - [ ]* 9.3 Write unit tests for Navbar in `tests/Navbar.test.tsx`
    - Test: renders brand wordmark "AWS User Group Cochabamba"
    - Test: applies `bg-primary` class to header element
    - Test: external links have `target="_blank"` and `rel="noopener noreferrer"`
    - Test: hamburger button has `aria-expanded` attribute
    - Test: `userMenuSlot` content renders in the right position
    - Test: nav element has `aria-label`
    - _Requirements: 10.1_

  - [ ]* 9.4 Write property test — Property 1: Navbar renders all provided links
    - **Property 1: Navbar renders all provided links**
    - For any array of LinkItem objects with non-empty labels and valid hrefs, Navbar produces exactly one accessible link per item with matching label text
    - **Validates: Requirements 3.1**

  - [ ]* 9.5 Write property test — Property 2: Navbar active link indicator
    - **Property 2: Navbar active link indicator**
    - For any array of LinkItem objects with mixed active values, Navbar applies brand highlight class only to links marked active: true
    - **Validates: Requirements 3.6**

- [x] 10. Checkpoint — Library complete
  - Run full quality gate: `tsc --noEmit`, `eslint .`, `vitest run --coverage`, `npx tsup`. Verify 80% line coverage, zero type errors, zero a11y lint violations. Ensure all tests pass, ask the user if questions arise.

- [x] 11. Add versioning and release tooling
  - [x] 11.1 Create `CHANGELOG.md` with initial v0.1.0 entry documenting all components (Navbar, Footer, UserMenu), design tokens, and Tailwind preset
    - _Requirements: 9.4_

  - [x] 11.2 Create `justfile` with recipes: `build` (tsup), `test` (vitest run --coverage), `lint` (eslint + tsc --noEmit), `release version` (bump package.json version, build, git tag v{version})
    - _Requirements: 9.5_

- [x] 12. Consumer integration — projects-registry
  - [x] 12.1 Add `@ugsys/ui-lib` as npm git dependency in `ugsys-projects-registry/web/package.json` via `github:awscbba/ugsys-ui-lib#v0.1.0`
    - _Requirements: 7.1_

  - [x] 12.2 Update `ugsys-projects-registry/web/tailwind.config.ts` to extend the UI_Library Tailwind preset and add `node_modules/@ugsys/ui-lib/dist/**/*.{js,mjs}` to content paths
    - Import `@ugsys/ui-lib/tokens.css` in the app entry point
    - _Requirements: 7.2_

  - [x] 12.3 Update `ugsys-projects-registry/web/src/components/layout/Layout.tsx` to import Navbar, Footer, UserMenu from `@ugsys/ui-lib`
    - Create a `renderLink` adapter wrapping react-router-dom v7 `NavLink`
    - Pass `adminPanelUrl="https://admin.apps.cloud.org.bo"` to UserMenu
    - Derive `user.roles` from decoded JWT in application state
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 12.4 Remove local `Navbar.tsx`, `Footer.tsx`, `UserMenu.tsx` and their test files from `ugsys-projects-registry/web/src/components/layout/`
    - Verify no duplicate component definitions remain
    - _Requirements: 7.6_

- [x] 13. Consumer integration — admin-panel
  - [x] 13.1 Add `@ugsys/ui-lib` as npm git dependency in `ugsys-admin-panel/admin-shell/package.json` via `github:awscbba/ugsys-ui-lib#v0.1.0`
    - Configure Tailwind v4 using the UI_Library preset
    - Import `@ugsys/ui-lib/tokens.css` in the app entry point
    - _Requirements: 8.1_

  - [x] 13.2 Replace inline styles in `AppShell.tsx`, `Sidebar.tsx`, and `TopBar.tsx` with Tailwind utility classes using Design_Tokens
    - Sidebar: `bg-primary` (#161d2b), active items use `text-brand` and `border-brand`
    - TopBar: `bg-primary text-white`
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 13.3 Update admin-panel login screen to use Design_Tokens colors: `bg-primary` page background, `bg-brand` action button, Open Sans font
    - _Requirements: 8.5_

  - [x] 13.4 Verify admin-panel does NOT render Navbar or Footer — sidebar + topbar layout preserved
    - _Requirements: 8.6, 8.7_

- [x] 14. Final checkpoint — Full integration verified ✅
  - Run `tsc --noEmit` and `vitest run` in all three repos (ugsys-ui-lib, projects-registry web/, admin-panel admin-shell/). Ensure all tests pass, ask the user if questions arise.
  - ugsys-ui-lib: 37 tests pass, 88% coverage, tsc clean
  - ugsys-projects-registry/web: 87 tests pass, tsc clean
  - ugsys-admin-panel/admin-shell: 122 tests pass, tsc clean
  - Both consumer repos migrated to pnpm@10.29.2 and committed on `feature/migrate-to-pnpm`

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The library is built first (tasks 1–11), then integrated into consumers (tasks 12–14)
- Consumer integration tasks modify files in separate repos (`ugsys-projects-registry/web/` and `ugsys-admin-panel/admin-shell/`)
