import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { Footer } from "../src/components/Footer/Footer";

describe("Footer", () => {
  it("renders copyright with provided year", () => {
    render(<Footer year={2025} />);
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByText(/AWS User Group Cochabamba/)).toBeInTheDocument();
  });

  it("applies bg-footer class to footer element", () => {
    const { container } = render(<Footer year={2025} />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-footer");
  });

  it("renders light text color class for contrast", () => {
    const { container } = render(<Footer year={2025} />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("text-background");
  });

  it("renders link elements when links prop provided", () => {
    const links = [
      { label: "Inicio", href: "/inicio" },
      { label: "Proyectos", href: "/proyectos" },
    ];
    render(<Footer year={2025} links={links} />);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
  });

  it("renders no link elements when links array is empty", () => {
    render(<Footer year={2025} links={[]} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("uses custom renderLink when provided", () => {
    const links = [{ label: "Custom", href: "/custom" }];
    render(
      <Footer
        year={2025}
        links={links}
        renderLink={({ href, children }) => (
          <span data-testid="custom-link" data-href={href}>
            {children}
          </span>
        )}
      />,
    );
    expect(screen.getByTestId("custom-link")).toBeInTheDocument();
    expect(screen.getByTestId("custom-link")).toHaveAttribute(
      "data-href",
      "/custom",
    );
  });

  // Property 3: Footer renders year and links
  it("Property 3: renders year and one link per item for any valid inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2100 }),
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1 }),
            href: fc.webUrl(),
          }),
          { maxLength: 10 },
        ),
        (year, links) => {
          const { unmount, container } = render(
            <Footer year={year} links={links} />,
          );
          // Copyright contains the year — scope to this container
          expect(container.textContent).toContain(String(year));
          // One link per item
          links.forEach((link) => {
            expect(container.textContent).toContain(link.label);
          });
          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });
});
