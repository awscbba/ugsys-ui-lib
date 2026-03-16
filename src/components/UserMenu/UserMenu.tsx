import { useRef, useState, useCallback, useEffect } from "react";
import { defaultRenderLink } from "../../types";
import type { UserInfo, ExtraMenuItem, RenderLink } from "../../types";
import { useFocusManagement } from "../../hooks/useFocusManagement";
import { AdminEntry } from "./AdminEntry";

export interface UserMenuProps {
  user: UserInfo;
  onLogout: () => void;
  adminPanelUrl?: string;
  profileHref?: string;
  extraItems?: ExtraMenuItem[];
  renderLink?: RenderLink;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserMenu({
  user,
  onLogout,
  adminPanelUrl,
  profileHref,
  extraItems = [],
  renderLink = defaultRenderLink,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useFocusManagement(isOpen, menuRef);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  // Keyboard navigation within menu
  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!menuRef.current) return;
    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const current = document.activeElement as HTMLElement;
    const idx = items.indexOf(current);

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        e.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  const showAdmin = user.roles.includes("admin") && !!adminPanelUrl;

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center justify-center w-9 h-9 rounded-full focus-visible:outline-2 focus-visible:outline-accent overflow-hidden"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="bg-brand text-primary text-sm font-semibold w-full h-full flex items-center justify-center">
            {getInitials(user.name)}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black/5 z-50 py-1"
          style={{ backgroundColor: "var(--color-surface-elevated)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {user.name}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {user.email}
            </p>
          </div>

          {/* Profile link */}
          {profileHref &&
            renderLink({
              href: profileHref,
              role: "menuitem",
              className:
                "block w-full px-4 py-2 text-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent",
              style: { color: "var(--color-text-secondary)" },
              children: "Mi Perfil",
            })}

          {/* Admin entry */}
          {showAdmin && (
            <AdminEntry adminPanelUrl={adminPanelUrl!} onClose={close} />
          )}

          {/* Extra items */}
          {extraItems.map((item, i) => {
            if (item.href) {
              return renderLink({
                key: i,
                href: item.href,
                role: "menuitem",
                className:
                  "flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent",
                style: { color: "var(--color-text-secondary)" },
                children: (
                  <>
                    {item.icon}
                    {item.label}
                  </>
                ),
              } as Parameters<RenderLink>[0] & { key: number });
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick?.();
                  close();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent text-left"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}

          {/* Logout */}
          <div
            className="mt-1"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onLogout();
                close();
              }}
              className="w-full px-4 py-2 text-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent text-left"
              style={{ color: "var(--color-error)" }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
