# Requirements Document

## Introduction

This feature introduces a shared React UI library as a standalone repository (`ugsys-ui-lib`) under the `awscbba` GitHub organization that encapsulates the platform's visual design system — design tokens, Navbar, Footer, UserMenu, and related primitives — and distributes them as an npm git dependency. The library will be consumed by `ugsys-projects-registry` (web/), `ugsys-admin-panel` (admin-shell/), and all future ugsys frontends. The admin panel shell will be migrated from raw inline styles to Tailwind v4 + brand tokens. A "Panel de Administración" entry will be added to the UserMenu dropdown, visible only to users with the `admin` role, linking to `https://admin.apps.cloud.org.bo`.

## Glossary

- **UI_Library**: The `ugsys-ui-lib` standalone repository under the `awscbba` GitHub organization, built with tsup/Vite lib mode, distributed as an npm git dependency.
- **Design_Tokens**: The canonical set of CSS custom properties and Tailwind theme values representing the brand palette (primary dark `#161d2b`, AWS orange `#FF9900`, accent blue `#4A90E2`, footer dark `#333333`, background `#F8F8F8`, font Open Sans).
- **Navbar**: The top navigation bar component exported by UI_Library, styled with the brand palette.
- **Footer**: The bottom footer component exported by UI_Library.
- **UserMenu**: The authenticated user dropdown component exported by UI_Library, supporting keyboard navigation and WCAG focus management.
- **AdminEntry**: The "Panel de Administración" menu item inside UserMenu, conditionally rendered based on the user's `admin` role.
- **Admin_Panel**: The `ugsys-admin-panel` (admin-shell/) application — a separate shell with sidebar + topbar layout, not a public-facing app.
- **Consumer**: Any frontend application that installs UI_Library as an npm git dependency (projects-registry, admin-panel, future services).
- **JWT_Claims**: The decoded payload of the user's JWT token, which includes role information used to determine AdminEntry visibility.

---

## Requirements

### Requirement 1: UI Library Package Structure and Build

**User Story:** As a frontend developer, I want a publishable UI library package in its own repository, so that I can install it as an npm git dependency in any ugsys frontend without needing a private npm registry.

#### Acceptance Criteria

1. THE UI_Library SHALL be located at the root of the `ugsys-ui-lib` repository under the `awscbba` GitHub organization.
2. THE UI_Library SHALL include a `package.json` with `name: "@ugsys/ui-lib"`, a `main` field pointing to the CJS build output, a `module` field pointing to the ESM build output, and a `types` field pointing to the TypeScript declaration file.
3. THE UI_Library SHALL be built using tsup, producing both CJS and ESM outputs with TypeScript declarations.
4. THE UI_Library SHALL declare `react`, `react-dom`, and `tailwindcss` as `peerDependencies` — not `dependencies` — to avoid version conflicts in Consumer applications.
5. WHEN a Consumer installs UI_Library via `npm install github:awscbba/ugsys-ui-lib#v<version>`, THE UI_Library SHALL be importable as `import { Navbar, Footer, UserMenu } from "@ugsys/ui-lib"`.
6. THE UI_Library SHALL export a Tailwind CSS preset file (`tailwind.preset.ts`) that Consumers can extend in their own `tailwind.config.ts`.
7. IF the tsup build encounters a TypeScript type error, THEN THE UI_Library build SHALL fail with a non-zero exit code and a descriptive error message.

---

### Requirement 2: Design Tokens

**User Story:** As a designer and developer, I want a single source of truth for brand colors, typography, and spacing, so that all ugsys frontends look visually consistent without duplicating token definitions.

#### Acceptance Criteria

1. THE Design_Tokens SHALL be defined as CSS custom properties in a `tokens.css` file exported by UI_Library, covering at minimum: `--color-primary` (`#161d2b`), `--color-brand` (`#FF9900`), `--color-accent` (`#4A90E2`), `--color-footer` (`#333333`), `--color-background` (`#F8F8F8`).
2. THE Design_Tokens SHALL be mirrored as Tailwind theme extension values in `tailwind.preset.ts` so that Consumers can use utility classes such as `bg-primary`, `text-brand`, `ring-accent`.
3. THE UI_Library SHALL export the font family "Open Sans" as the default sans-serif stack via the Tailwind preset.
4. WHEN a Consumer imports `tokens.css` and applies `bg-primary` via Tailwind, THE rendered element SHALL display background color `#161d2b`.
5. THE Design_Tokens SHALL include focus ring styles (`--color-focus-ring: #4A90E2`) used consistently across all interactive elements in UI_Library components.

---

### Requirement 3: Navbar Component

**User Story:** As a frontend developer, I want a reusable Navbar component from the shared library, so that all ugsys public-facing apps display a consistent top navigation bar without duplicating markup.

#### Acceptance Criteria

1. THE Navbar SHALL accept a `links` prop of type `Array<{ label: string; href: string; active?: boolean }>` and render each link in the navigation area.
2. THE Navbar SHALL accept a `userMenuSlot` prop of type `React.ReactNode` to allow Consumers to inject a UserMenu instance.
3. THE Navbar SHALL render the ugsys brand logo/wordmark on the left side using Design_Tokens colors.
4. WHEN the viewport width is below 768px, THE Navbar SHALL collapse navigation links into a hamburger menu that expands on activation.
5. THE Navbar SHALL apply `bg-primary` (`#161d2b`) as its background color using the Design_Tokens Tailwind class.
6. WHEN a link has `active: true`, THE Navbar SHALL apply a visual indicator (bottom border or highlight) using `--color-brand` (`#FF9900`).
7. THE Navbar SHALL meet WCAG 2.1 AA keyboard navigation requirements: all interactive elements reachable via Tab, hamburger toggle operable via Enter/Space.

---

### Requirement 4: Footer Component

**User Story:** As a frontend developer, I want a reusable Footer component, so that all public-facing ugsys apps share a consistent footer without duplicating code.

#### Acceptance Criteria

1. THE Footer SHALL accept a `year` prop (number) and render a copyright notice using it.
2. THE Footer SHALL accept an optional `links` prop of type `Array<{ label: string; href: string }>` and render them as a horizontal list.
3. THE Footer SHALL apply `bg-footer` (`#333333`) as its background color using Design_Tokens.
4. THE Footer SHALL render text in a light color (`#F8F8F8` or white) for sufficient contrast against the dark background.

---

### Requirement 5: UserMenu Component

**User Story:** As a frontend developer, I want a reusable UserMenu dropdown component, so that all ugsys frontends display a consistent authenticated user menu with keyboard accessibility and role-based entries.

#### Acceptance Criteria

1. THE UserMenu SHALL accept a `user` prop of type `{ name: string; email: string; avatarUrl?: string; roles: string[] }`.
2. WHEN `user.avatarUrl` is provided, THE UserMenu SHALL display the avatar image; IF `user.avatarUrl` is absent, THEN THE UserMenu SHALL display a circle with the user's initials derived from `user.name`.
3. THE UserMenu SHALL render a dropdown that opens on click or Enter/Space keypress on the trigger button.
4. WHEN the dropdown is open, THE UserMenu SHALL trap focus within the dropdown and close on Escape keypress, returning focus to the trigger button.
5. THE UserMenu SHALL accept a `onLogout` callback prop and invoke it when the logout menu item is activated.
6. THE UserMenu SHALL accept an optional `extraItems` prop of type `Array<{ label: string; href?: string; onClick?: () => void; icon?: React.ReactNode }>` to allow Consumers to inject additional menu entries.
7. THE UserMenu SHALL meet WCAG 2.1 AA requirements: dropdown items navigable via arrow keys, role="menu" and role="menuitem" ARIA attributes applied correctly.

---

### Requirement 6: AdminEntry in UserMenu

**User Story:** As an admin user, I want a "Panel de Administración" entry in the user menu dropdown, so that I can navigate to the admin panel from any ugsys frontend without needing a separate bookmark.

#### Acceptance Criteria

1. THE UserMenu SHALL accept an `adminPanelUrl` prop of type `string | undefined`.
2. WHEN `user.roles` includes `"admin"` AND `adminPanelUrl` is provided, THE UserMenu SHALL render an AdminEntry item labeled "Panel de Administración" in the dropdown.
3. WHEN `user.roles` does NOT include `"admin"`, THE UserMenu SHALL NOT render the AdminEntry item regardless of `adminPanelUrl`.
4. WHEN the AdminEntry is activated, THE UserMenu SHALL navigate to `adminPanelUrl` (opening in the same tab via `window.location.href` or an anchor tag).
5. THE AdminEntry SHALL be visually distinguished from regular menu items using `--color-brand` (`#FF9900`) as an accent color or icon.
6. WHEN JWT_Claims are used to populate `user.roles`, THE Consumer SHALL derive the roles array from the JWT payload before passing it to UserMenu — THE UserMenu SHALL NOT perform JWT decoding itself.

---

### Requirement 7: Consumer Integration — projects-registry

**User Story:** As a developer maintaining ugsys-projects-registry, I want to replace the local Navbar, Footer, and UserMenu with the shared library versions, so that visual updates to the design system propagate automatically on dependency upgrade.

#### Acceptance Criteria

1. THE projects-registry `web/` application SHALL install UI_Library as an npm git dependency via `github:awscbba/ugsys-ui-lib#v<version>` pinned to a version tag.
2. THE projects-registry `tailwind.config.ts` SHALL extend the UI_Library Tailwind preset so that Design_Tokens utility classes are available.
3. THE projects-registry SHALL pass `adminPanelUrl="https://admin.apps.cloud.org.bo"` to UserMenu and derive `user.roles` from the decoded JWT stored in application state.
4. WHEN a user with `admin` role is logged in to projects-registry, THE UserMenu SHALL display the AdminEntry.
5. WHEN a user without `admin` role is logged in to projects-registry, THE UserMenu SHALL NOT display the AdminEntry.
6. THE projects-registry local `Navbar.tsx`, `Footer.tsx`, and `UserMenu.tsx` files SHALL be removed after the shared library versions are adopted, with no duplicate component definitions remaining.

---

### Requirement 8: Consumer Integration — admin-panel shell

**User Story:** As a developer maintaining ugsys-admin-panel, I want the admin shell to use the brand design tokens and Tailwind instead of raw inline styles, so that the admin panel looks consistent with the rest of the platform.

#### Acceptance Criteria

1. THE Admin_Panel `admin-shell/` application SHALL install UI_Library as an npm git dependency via `github:awscbba/ugsys-ui-lib#v<version>` and configure Tailwind v4 using the UI_Library preset.
2. THE Admin_Panel SHALL replace all raw inline style objects in `AppShell.tsx`, `Sidebar.tsx`, and `TopBar.tsx` with Tailwind utility classes using Design_Tokens.
3. THE Admin_Panel sidebar SHALL use `bg-primary` (`#161d2b`) as its background, matching the brand palette.
4. THE Admin_Panel TopBar SHALL use `bg-primary` (`#161d2b`) as its background and display the user's name/avatar using the UserMenu component's trigger element (without the full Navbar/Footer wrapper, since the admin shell has its own layout).
5. THE Admin_Panel login screen SHALL use Design_Tokens colors: `bg-primary` for the page background, `--color-brand` for the primary action button, and Open Sans as the font.
6. THE Admin_Panel SHALL NOT render the public-facing Navbar or Footer components — the admin shell layout (sidebar + topbar) is preserved.
7. WHEN a developer adds a new page to Admin_Panel, THE existing Tailwind + Design_Tokens setup SHALL apply without additional configuration.

---

### Requirement 9: Versioning and Distribution

**User Story:** As a platform engineer, I want the UI library versioned with git tags, so that Consumers can pin to a specific version and upgrade deliberately.

#### Acceptance Criteria

1. THE UI_Library SHALL follow the git tag pattern `v<semver>` (e.g., `v0.1.0`) for version releases in the `ugsys-ui-lib` repository.
2. THE UI_Library `package.json` `version` field SHALL match the semver portion of the git tag at release time.
3. WHEN a Consumer specifies `"@ugsys/ui-lib": "github:awscbba/ugsys-ui-lib#v0.1.0"` in `package.json`, THE npm/pnpm install SHALL resolve to the exact tagged commit.
4. THE UI_Library SHALL include a `CHANGELOG.md` updated on each release describing breaking changes, new components, and bug fixes.
5. THE `ugsys-ui-lib` `justfile` SHALL include a `release version=<v>` recipe that bumps `package.json` version, builds the library, and creates the git tag.

---

### Requirement 10: Accessibility and Quality Gates

**User Story:** As a platform engineer, I want automated accessibility and quality checks on the UI library, so that components meet WCAG 2.1 AA standards before being distributed to all frontends.

#### Acceptance Criteria

1. THE UI_Library SHALL include a Vitest + React Testing Library test suite covering: Navbar renders links, UserMenu opens/closes on keyboard, AdminEntry visibility based on roles, Footer renders copyright.
2. WHEN `user.roles` includes `"admin"`, THE UserMenu test SHALL assert that an element with text "Panel de Administración" is present in the rendered output.
3. WHEN `user.roles` does NOT include `"admin"`, THE UserMenu test SHALL assert that no element with text "Panel de Administración" is present.
4. THE UI_Library CI job SHALL run `tsc --noEmit` (TypeScript strict mode) and fail the build if type errors are present.
5. THE UI_Library CI job SHALL run ESLint with `eslint-plugin-jsx-a11y` and fail on any accessibility rule violation.
6. THE UI_Library SHALL achieve 80% unit test line coverage as measured by Vitest's built-in coverage reporter.