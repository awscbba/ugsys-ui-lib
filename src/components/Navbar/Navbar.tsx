import React, { useState } from "react";
import { defaultRenderLink } from "../../types";
import type { LinkItem, RenderLink } from "../../types";

export interface NavbarProps {
  links: LinkItem[];
  userMenuSlot?: React.ReactNode;
  renderLink?: RenderLink;
  brandSubtitle?: string;
}

export function Navbar({
  links,
  userMenuSlot,
  renderLink = defaultRenderLink,
  brandSubtitle,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleHamburgerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMobileOpen((v) => !v);
    }
  }

  function renderNavLink(link: LinkItem, index: number) {
    const baseClass =
      "px-3 py-2 rounded text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent";
    const activeClass = "bg-brand text-primary";
    const inactiveClass = "text-gray-200 hover:bg-white/10";
    const className = `${baseClass} ${link.active ? activeClass : inactiveClass}`;

    if (link.external) {
      return (
        <a
          key={index}
          href={link.href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          aria-current={link.active ? "page" : undefined}
        >
          {link.label}
        </a>
      );
    }

    return (
      <React.Fragment key={index}>
        {renderLink({
          href: link.href,
          className,
          "aria-current": link.active ? "page" : undefined,
          children: link.label,
        })}
      </React.Fragment>
    );
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <span className="text-white font-bold text-base leading-tight">
              AWS User Group Cochabamba
            </span>
            {brandSubtitle && (
              <span className="block text-brand text-xs font-medium">
                {brandSubtitle}
              </span>
            )}
          </div>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {links.map((link, i) => renderNavLink(link, i))}
          </nav>

          {/* Right side: userMenuSlot + hamburger */}
          <div className="flex items-center gap-3">
            {userMenuSlot && (
              <div className="hidden md:block">{userMenuSlot}</div>
            )}

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              onKeyDown={handleHamburgerKeyDown}
              className="md:hidden p-2 rounded text-gray-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
            >
              {mobileOpen ? (
                /* X icon */
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          {links.map((link, i) => renderNavLink(link, i))}
          {userMenuSlot && (
            <div className="pt-2 border-t border-white/10">{userMenuSlot}</div>
          )}
        </nav>
      )}
    </header>
  );
}
