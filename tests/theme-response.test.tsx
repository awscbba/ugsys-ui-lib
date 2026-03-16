/**
 * theme-response.test.tsx — Verifies all shared components use semantic CSS
 * custom properties (var(--color-*)) so they respond to data-theme changes
 * without requiring a React re-render.
 *
 * Strategy: render each component, inspect style attributes for var(--color-*)
 * references, then flip data-theme and confirm no re-render is needed (the
 * same DOM elements still reference CSS variables — the browser resolves them).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../src/components/Navbar/Navbar";
import { Footer } from "../src/components/Footer/Footer";
import { UserMenu } from "../src/components/UserMenu/UserMenu";
import { LoginCard } from "../src/components/LoginCard/LoginCard";
import type { LinkItem, UserInfo } from "../src/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function setTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Check that an element's inline style contains at least one var(--color-*) */
function hasSemanticToken(el: Element): boolean {
  const style = el.getAttribute("style") ?? "";
  return /var\(--color-[\w-]+\)/.test(style);
}

/** Collect all elements with inline styles containing var(--color-*) */
function findSemanticElements(container: HTMLElement): Element[] {
  const all = container.querySelectorAll("[style]");
  return Array.from(all).filter(hasSemanticToken);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const navLinks: LinkItem[] = [
  { label: "Home", href: "/", active: true },
  { label: "Projects", href: "/projects" },
];

const testUser: UserInfo = {
  name: "Test User",
  email: "test@example.com",
  roles: ["admin"],
};

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Theme response — Navbar", () => {
  it("uses semantic CSS variables in header style", () => {
    const { container } = render(<Navbar links={navLinks} />);
    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header!.getAttribute("style")).toContain(
      "var(--color-surface-elevated)",
    );
    expect(header!.getAttribute("style")).toContain("var(--color-border)");
  });

  it("mobile menu uses semantic CSS variables", async () => {
    render(<Navbar links={navLinks} />);
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    await userEvent.click(hamburger);
    const mobileNav = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });
    expect(mobileNav.getAttribute("style")).toContain(
      "var(--color-surface-elevated)",
    );
    expect(mobileNav.getAttribute("style")).toContain("var(--color-border)");
  });

  it("DOM elements persist across data-theme change without re-render", () => {
    const { container } = render(<Navbar links={navLinks} />);
    const headerBefore = container.querySelector("header");

    setTheme("dark");
    const headerAfter = container.querySelector("header");

    // Same DOM node — no re-render needed
    expect(headerAfter).toBe(headerBefore);
    // Still references CSS variables
    expect(headerAfter!.getAttribute("style")).toContain(
      "var(--color-surface-elevated)",
    );
  });
});

describe("Theme response — Footer", () => {
  it("uses semantic CSS variables for text color", () => {
    const { container } = render(
      <Footer year={2025} links={[{ label: "Home", href: "/" }]} />,
    );
    const semanticEls = findSemanticElements(container);
    expect(semanticEls.length).toBeGreaterThanOrEqual(1);
    // Copyright text uses --color-text-primary
    const copyright = container.querySelector("p");
    expect(copyright!.getAttribute("style")).toContain(
      "var(--color-text-primary)",
    );
  });

  it("link items use semantic CSS variables", () => {
    const { container } = render(
      <Footer year={2025} links={[{ label: "About", href: "/about" }]} />,
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link!.getAttribute("style")).toContain("var(--color-text-primary)");
  });

  it("DOM elements persist across data-theme change without re-render", () => {
    const { container } = render(<Footer year={2025} />);
    const pBefore = container.querySelector("p");

    setTheme("dark");
    const pAfter = container.querySelector("p");

    expect(pAfter).toBe(pBefore);
    expect(pAfter!.getAttribute("style")).toContain(
      "var(--color-text-primary)",
    );
  });
});

describe("Theme response — UserMenu", () => {
  it("dropdown uses semantic CSS variables when open", async () => {
    render(
      <UserMenu
        user={testUser}
        onLogout={() => {}}
        adminPanelUrl="https://admin.example.com"
        profileHref="/profile"
      />,
    );
    // Open the menu
    const trigger = screen.getByRole("button", { expanded: false });
    await userEvent.click(trigger);

    const menu = screen.getByRole("menu");
    expect(menu.getAttribute("style")).toContain(
      "var(--color-surface-elevated)",
    );

    // Check text elements use semantic tokens
    const semanticEls = findSemanticElements(menu);
    expect(semanticEls.length).toBeGreaterThanOrEqual(2);
  });

  it("logout button uses error color token", async () => {
    render(<UserMenu user={testUser} onLogout={() => {}} />);
    const trigger = screen.getByRole("button", { expanded: false });
    await userEvent.click(trigger);

    const logoutBtn = screen.getByRole("menuitem", {
      name: /cerrar sesión/i,
    });
    expect(logoutBtn.getAttribute("style")).toContain("var(--color-error)");
  });

  it("DOM elements persist across data-theme change without re-render", async () => {
    render(<UserMenu user={testUser} onLogout={() => {}} />);
    const trigger = screen.getByRole("button", { expanded: false });
    await userEvent.click(trigger);

    const menuBefore = screen.getByRole("menu");
    setTheme("dark");
    const menuAfter = screen.getByRole("menu");

    expect(menuAfter).toBe(menuBefore);
    expect(menuAfter.getAttribute("style")).toContain(
      "var(--color-surface-elevated)",
    );
  });
});

describe("Theme response — LoginCard", () => {
  const cardProps = {
    title: "Test App",
    email: "",
    password: "",
    isLoading: false,
    error: "Test error",
    onEmailChange: () => {},
    onPasswordChange: () => {},
    onSubmit: (e: React.FormEvent) => e.preventDefault(),
  };

  it("title uses semantic text-primary token", () => {
    render(<LoginCard {...cardProps} />);
    const heading = screen.getByRole("heading", { name: "Test App" });
    expect(heading.getAttribute("style")).toContain(
      "var(--color-text-primary)",
    );
  });

  it("error message uses semantic error token", () => {
    render(<LoginCard {...cardProps} />);
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("style")).toContain("var(--color-error)");
  });

  it("inputs use semantic input tokens", () => {
    const { container } = render(<LoginCard {...cardProps} />);
    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => {
      const style = input.getAttribute("style") ?? "";
      expect(style).toContain("var(--color-input-bg)");
      expect(style).toContain("var(--color-input-border)");
      expect(style).toContain("var(--color-text-primary)");
    });
  });

  it("labels use semantic text-secondary token", () => {
    const { container } = render(<LoginCard {...cardProps} />);
    const labels = container.querySelectorAll("label");
    labels.forEach((label) => {
      expect(label.getAttribute("style")).toContain(
        "var(--color-text-secondary)",
      );
    });
  });

  it("DOM elements persist across data-theme change without re-render", () => {
    render(<LoginCard {...cardProps} />);
    const headingBefore = screen.getByRole("heading", { name: "Test App" });

    setTheme("dark");
    const headingAfter = screen.getByRole("heading", { name: "Test App" });

    expect(headingAfter).toBe(headingBefore);
    expect(headingAfter.getAttribute("style")).toContain(
      "var(--color-text-primary)",
    );
  });
});
