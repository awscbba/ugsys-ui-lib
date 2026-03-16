/**
 * tokens.test.ts — Unit tests for design tokens (tokens.css).
 *
 * Verifies:
 * - Required semantic tokens present under :root
 * - Required semantic tokens present under [data-theme="dark"]
 * - Existing brand tokens preserved unchanged under :root
 * - Theme transition CSS scoped to color-only properties (200ms)
 * - prefers-reduced-motion: reduce disables transitions (0ms)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const cssContent = readFileSync(
  resolve(__dirname, "../src/tokens/tokens.css"),
  "utf-8",
);

/** Extract all custom properties from a CSS selector block */
function extractTokensFromSelector(css: string, selector: string): string[] {
  // Build regex to match the selector block
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "g");
  const match = regex.exec(css);
  if (!match) return [];
  const block = match[1];
  const tokens: string[] = [];
  const propRegex = /(--[\w-]+)\s*:/g;
  let propMatch: RegExpExecArray | null;
  while ((propMatch = propRegex.exec(block)) !== null) {
    tokens.push(propMatch[1]);
  }
  return tokens;
}

const REQUIRED_SEMANTIC_TOKENS = [
  "--color-surface",
  "--color-surface-elevated",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-border",
  "--color-input-bg",
  "--color-input-border",
  "--color-error",
  "--color-error-bg",
  "--color-error-border",
];

const BRAND_TOKENS = [
  "--color-primary",
  "--color-brand",
  "--color-accent",
  "--color-footer",
  "--color-background",
  "--color-focus-ring",
  "--font-sans",
];

describe("Design Tokens — :root selector", () => {
  const rootTokens = extractTokensFromSelector(cssContent, ":root");

  it.each(REQUIRED_SEMANTIC_TOKENS)(
    "defines semantic token %s under :root",
    (token) => {
      expect(rootTokens).toContain(token);
    },
  );

  it.each(BRAND_TOKENS)(
    "preserves existing brand token %s under :root",
    (token) => {
      expect(rootTokens).toContain(token);
    },
  );
});

describe('Design Tokens — [data-theme="dark"] selector', () => {
  const darkTokens = extractTokensFromSelector(
    cssContent,
    '[data-theme="dark"]',
  );

  it.each(REQUIRED_SEMANTIC_TOKENS)(
    "defines semantic token %s under [data-theme='dark']",
    (token) => {
      expect(darkTokens).toContain(token);
    },
  );

  it.each(["--color-primary", "--color-background", "--color-footer"])(
    "overrides brand token %s in dark theme",
    (token) => {
      expect(darkTokens).toContain(token);
    },
  );
});

describe("Design Tokens — Theme transitions", () => {
  it("applies transition to body and .theme-transition", () => {
    // Both selectors should be present in a combined rule
    expect(cssContent).toMatch(/body\s*,\s*\n?\s*\.theme-transition/);
  });

  it("scopes transition-property to color-only properties", () => {
    expect(cssContent).toMatch(
      /transition-property:\s*background-color\s*,\s*color\s*,\s*border-color/,
    );
  });

  it("sets transition-duration to 200ms", () => {
    expect(cssContent).toMatch(/transition-duration:\s*200ms/);
  });

  it("disables transitions for prefers-reduced-motion: reduce", () => {
    // Should contain a media query that sets duration to 0ms
    expect(cssContent).toMatch(
      /prefers-reduced-motion:\s*reduce[\s\S]*?transition-duration:\s*0ms/,
    );
  });
});
