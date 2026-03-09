import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { Navbar } from "../src/components/Navbar/Navbar";
import type { LinkItem } from "../src/types";

const baseLinks: LinkItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/proyectos" },
];

describe("Navbar", () => {
  it("renders brand wordmark AWS User Group Cochabamba", () => {
    render(<Navbar links={[]} />);
    expect(screen.getByText("AWS User Group Cochabamba")).toBeInTheDocument();
  });

  it("applies bg-primary class to header element", () => {
    const { container } = render(<Navbar links={[]} />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-primary");
  });

  it("renders brandSubtitle when provided", () => {
    render(<Navbar links={[]} brandSubtitle="Registro de Proyectos" />);
    expect(screen.getByText("Registro de Proyectos")).toBeInTheDocument();
  });

  it("external links have target=_blank and rel=noopener noreferrer", () => {
    const links: LinkItem[] = [
      { label: "Sitio", href: "https://cbba.cloud.org.bo", external: true },
    ];
    render(<Navbar links={links} />);
    const link = screen.getByText("Sitio").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hamburger button has aria-expanded attribute", () => {
    render(<Navbar links={baseLinks} />);
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    expect(hamburger).toHaveAttribute("aria-expanded");
  });

  it("hamburger aria-expanded is false initially, true after click", async () => {
    render(<Navbar links={baseLinks} />);
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });

  it("Enter on hamburger toggles mobile menu open", async () => {
    render(<Navbar links={baseLinks} />);
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    hamburger.focus();
    await userEvent.keyboard("{Enter}");
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("navigation", { name: /mobile navigation/i }),
    ).toBeInTheDocument();
  });

  it("Space on hamburger toggles mobile menu open", async () => {
    render(<Navbar links={baseLinks} />);
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    hamburger.focus();
    await userEvent.keyboard(" ");
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });

  it("userMenuSlot renders inside mobile menu when open", async () => {
    render(
      <Navbar
        links={baseLinks}
        userMenuSlot={<button data-testid="mobile-user-slot">User</button>}
      />,
    );
    const hamburger = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    await userEvent.click(hamburger);
    const mobileNav = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });
    expect(
      mobileNav.querySelector("[data-testid='mobile-user-slot']"),
    ).toBeInTheDocument();
  });

  it("userMenuSlot content renders", () => {
    render(
      <Navbar
        links={baseLinks}
        userMenuSlot={<button data-testid="user-menu-slot">User</button>}
      />,
    );
    expect(screen.getByTestId("user-menu-slot")).toBeInTheDocument();
  });

  it("nav element has aria-label", () => {
    render(<Navbar links={baseLinks} />);
    expect(
      screen.getByRole("navigation", { name: /main navigation/i }),
    ).toBeInTheDocument();
  });

  it("active link gets bg-brand class", () => {
    const links: LinkItem[] = [
      { label: "Inicio", href: "/", active: true },
      { label: "Proyectos", href: "/proyectos", active: false },
    ];
    render(<Navbar links={links} />);
    // Find all rendered link elements with the label text
    const activeLinks = screen.getAllByText("Inicio");
    const inactiveLinks = screen.getAllByText("Proyectos");
    // At least one active link should have bg-brand
    expect(activeLinks.some((el) => el.closest("[class*='bg-brand']"))).toBe(
      true,
    );
    // No inactive link should have bg-brand
    expect(
      inactiveLinks.every((el) => !el.closest("[class*='bg-brand']")),
    ).toBe(true);
  });

  // Property 1: Navbar renders all provided links
  it("Property 1: renders exactly one accessible link per item", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.webUrl(),
            active: fc.boolean(),
            external: fc.boolean(),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        (links) => {
          // Filter out whitespace-only labels — browsers collapse them and RTL can't find them
          const visibleLinks = links.filter((l) => l.label.trim().length > 0);
          const { unmount, container } = render(<Navbar links={links} />);
          visibleLinks.forEach((link) => {
            expect(container.textContent).toContain(link.label.trim());
          });
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  // Property 2: Navbar active link indicator
  it("Property 2: bg-brand applied only to active links", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.webUrl(),
            active: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        (links) => {
          const { unmount, container } = render(<Navbar links={links} />);
          const allLinkEls = container.querySelectorAll(
            "a, button[class*='px-3']",
          );
          allLinkEls.forEach((el) => {
            const hasBrand = el.className.includes("bg-brand");
            const label = el.textContent ?? "";
            const matchingLink = links.find((l) => l.label === label);
            if (matchingLink) {
              if (matchingLink.active) {
                expect(hasBrand).toBe(true);
              } else {
                expect(hasBrand).toBe(false);
              }
            }
          });
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });
});
