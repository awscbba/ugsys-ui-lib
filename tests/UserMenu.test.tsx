import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { UserMenu } from "../src/components/UserMenu/UserMenu";
import type { UserInfo } from "../src/types";

const baseUser: UserInfo = {
  name: "Ana Pérez",
  email: "ana@example.com",
  roles: [],
};

function renderMenu(overrides: Partial<Parameters<typeof UserMenu>[0]> = {}) {
  const onLogout = vi.fn();
  const result = render(
    <UserMenu user={baseUser} onLogout={onLogout} {...overrides} />,
  );
  return { ...result, onLogout };
}

describe("UserMenu", () => {
  it("click opens dropdown with role=menu", async () => {
    renderMenu();
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("Enter on trigger opens dropdown", async () => {
    renderMenu();
    const trigger = screen.getByRole("button");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("Space on trigger opens dropdown", async () => {
    renderMenu();
    const trigger = screen.getByRole("button");
    trigger.focus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("Escape closes dropdown and returns focus to trigger", async () => {
    renderMenu();
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("dropdown items have role=menuitem", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBeGreaterThan(0);
  });

  it("onLogout callback invoked on logout click", async () => {
    const { onLogout } = renderMenu();
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("Cerrar Sesión"));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("outside click closes dropdown", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("profile link renders when profileHref provided", async () => {
    renderMenu({ profileHref: "/dashboard" });
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
  });

  it("profile link absent when profileHref omitted", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();
  });

  it("AdminEntry visible when roles includes admin AND adminPanelUrl provided", async () => {
    renderMenu({
      user: { ...baseUser, roles: ["admin"] },
      adminPanelUrl: "https://admin.example.com",
    });
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
  });

  it("AdminEntry hidden when roles does NOT include admin", async () => {
    renderMenu({
      user: { ...baseUser, roles: ["user"] },
      adminPanelUrl: "https://admin.example.com",
    });
    await userEvent.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Panel de Administración"),
    ).not.toBeInTheDocument();
  });

  it("AdminEntry has text-brand class for visual distinction", async () => {
    renderMenu({
      user: { ...baseUser, roles: ["admin"] },
      adminPanelUrl: "https://admin.example.com",
    });
    await userEvent.click(screen.getByRole("button"));
    const adminEntry = screen.getByText("Panel de Administración").closest("a");
    expect(adminEntry).toHaveClass("text-brand");
  });

  it("ArrowDown navigates to next menuitem", async () => {
    renderMenu({ profileHref: "/dashboard" });
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    items[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();
  });

  it("ArrowUp navigates to previous menuitem", async () => {
    renderMenu({ profileHref: "/dashboard" });
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    items[1].focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(items[0]).toHaveFocus();
  });

  it("Home jumps to first menuitem", async () => {
    renderMenu({ profileHref: "/dashboard" });
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    items[items.length - 1].focus();
    await userEvent.keyboard("{Home}");
    expect(items[0]).toHaveFocus();
  });

  it("End jumps to last menuitem", async () => {
    renderMenu({ profileHref: "/dashboard" });
    await userEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    items[0].focus();
    await userEvent.keyboard("{End}");
    expect(items[items.length - 1]).toHaveFocus();
  });

  // Property 4: UserMenu avatar vs initials display
  it("Property 4: shows img when avatarUrl provided, initials when absent", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          avatarUrl: fc.option(fc.webUrl(), { nil: undefined }),
          roles: fc.array(fc.string()),
        }),
        (user) => {
          const { unmount, container } = render(
            <UserMenu user={user} onLogout={() => {}} />,
          );
          const trigger = container.querySelector("button");
          if (user.avatarUrl) {
            expect(trigger?.querySelector("img")).toBeTruthy();
          } else {
            expect(trigger?.querySelector("img")).toBeFalsy();
          }
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  // Property 5: UserMenu renders all extra items
  it("Property 5: renders all extra items as menuitems when open", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            label: fc
              .string({ minLength: 1 })
              .filter((s) => s.trim().length > 0),
          }),
          { minLength: 0, maxLength: 5 },
        ),
        async (extraItems) => {
          const { unmount, container } = render(
            <UserMenu
              user={baseUser}
              onLogout={() => {}}
              extraItems={extraItems.map((item) => ({
                ...item,
                onClick: () => {},
              }))}
            />,
          );
          await userEvent.click(within(container).getByRole("button"));
          extraItems.forEach((item) => {
            // Use a function matcher to avoid getByText whitespace normalization issues
            const found = within(container).getByText(
              (_content, element) =>
                element?.textContent?.trim() === item.label.trim(),
            );
            expect(found).toBeInTheDocument();
          });
          unmount();
        },
      ),
      { numRuns: 30 },
    );
  });

  // Property 6: AdminEntry visibility determined by role and URL
  it("Property 6: AdminEntry visible iff roles includes admin AND adminPanelUrl non-empty", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          roles: fc.array(fc.constantFrom("admin", "user", "editor")),
        }),
        fc.option(fc.webUrl(), { nil: undefined }),
        async (user, adminPanelUrl) => {
          const { unmount } = render(
            <UserMenu
              user={{ ...user, avatarUrl: undefined }}
              onLogout={() => {}}
              adminPanelUrl={adminPanelUrl}
            />,
          );
          await userEvent.click(screen.getByRole("button"));
          const shouldShow = user.roles.includes("admin") && !!adminPanelUrl;
          if (shouldShow) {
            const entry = screen.queryByText("Panel de Administración");
            expect(entry).toBeInTheDocument();
            expect(entry?.closest("a")).toHaveAttribute("href", adminPanelUrl);
          } else {
            expect(
              screen.queryByText("Panel de Administración"),
            ).not.toBeInTheDocument();
          }
          unmount();
        },
      ),
      { numRuns: 30 },
    );
  });
});
