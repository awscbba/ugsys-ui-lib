import { defaultRenderLink } from "../../types";
import type { LinkItem, RenderLink } from "../../types";

export interface FooterProps {
  /** Copyright year */
  year: number;
  /** Optional navigation links */
  links?: LinkItem[];
  /** Router-aware link renderer (defaults to plain <a>) */
  renderLink?: RenderLink;
}

export function Footer({
  year,
  links = [],
  renderLink = defaultRenderLink,
}: FooterProps) {
  return (
    <footer className="bg-footer text-background py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
          &copy; {year} AWS User Group Cochabamba
        </p>
        {links.length > 0 && (
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-4 list-none m-0 p-0">
              {links.map((link) => (
                <li key={link.href}>
                  {renderLink({
                    href: link.href,
                    className:
                      "text-sm hover:text-brand focus-visible:outline-2 focus-visible:outline-accent ring-accent transition-colors",
                    style: { color: "var(--color-text-primary)" },
                    children: link.label,
                  })}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
