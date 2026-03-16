/**
 * tokens-pbt.test.ts — Property-based tests for design tokens.
 *
 * Property 7: Both themes define all required semantic tokens.
 * Property 8: Text-to-background contrast ratio meets WCAG AA (>= 4.5:1).
 *
 * Validates: Requirements 1.1, 1.4, 11.2, 11.3
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── CSS file loading ─────────────────────────────────────────────────────────

const cssContent = readFileSync(
  resolve(__dirname, "../src/tokens/tokens.css"),
  "utf-8",
);

// ── CSS parsing helpers ──────────────────────────────────────────────────────

/**
 * Extract token name→value map from a CSS selector block.
 * Returns e.g. { "--color-surface": "#ffffff", ... }
 */
function extractTokenValues(
  css: string,
  selector: string,
): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "g");
  const match = regex.exec(css);
  if (!match) return {};
  const block = match[1];
  const tokens: Record<string, string> = {};
  const propRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let propMatch: RegExpExecArray | null;
  while ((propMatch = propRegex.exec(block)) !== null) {
    tokens[propMatch[1]] = propMatch[2].trim();
  }
  return tokens;
}

// ── WCAG contrast ratio helpers ──────────────────────────────────────────────

/** Parse a hex color string (#rrggbb) to [r, g, b] in 0–255 range. */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Convert an sRGB channel (0–255) to linear light value. */
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Compute WCAG relative luminance from a hex color. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/** Compute WCAG contrast ratio between two hex colors. */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Token definitions ────────────────────────────────────────────────────────

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
] as const;

const rootTokens = extractTokenValues(cssContent, ":root");
const darkTokens = extractTokenValues(cssContent, '[data-theme="dark"]');

/** Map theme name to its token values. */
const themeTokens: Record<string, Record<string, string>> = {
  light: rootTokens,
  dark: darkTokens,
};

// ── Text/background pairs to verify for WCAG AA ─────────────────────────────

const TEXT_BG_PAIRS = [
  { text: "--color-text-primary", bg: "--color-surface" },
  { text: "--color-text-primary", bg: "--color-surface-elevated" },
  { text: "--color-text-secondary", bg: "--color-surface" },
  { text: "--color-text-secondary", bg: "--color-surface-elevated" },
] as const;

// ── Property-based tests ─────────────────────────────────────────────────────

describe("Design Tokens — Property-Based Tests", () => {
  /**
   * **Validates: Requirements 1.1, 1.4**
   *
   * Property 7: Both themes define all semantic tokens
   *
   * For any semantic token name in the required set, both the :root and
   * [data-theme="dark"] selectors should define a value for that token.
   */
  it("Property 7: both themes define all required semantic tokens", () => {
    fc.assert(
      fc.property(fc.constantFrom(...REQUIRED_SEMANTIC_TOKENS), (tokenName) => {
        expect(rootTokens).toHaveProperty(tokenName);
        expect(rootTokens[tokenName]).toBeTruthy();

        expect(darkTokens).toHaveProperty(tokenName);
        expect(darkTokens[tokenName]).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 11.2, 11.3**
   *
   * Property 8: Text-to-background contrast ratio meets WCAG AA
   *
   * For any theme ("light" or "dark") and any text/background token pair,
   * the contrast ratio should be at least 4.5:1.
   */
  it("Property 8: contrast ratio >= 4.5:1 for all text/background pairs", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        fc.constantFrom(...TEXT_BG_PAIRS),
        (theme, pair) => {
          const tokens = themeTokens[theme];
          const textColor = tokens[pair.text];
          const bgColor = tokens[pair.bg];

          expect(textColor).toBeTruthy();
          expect(bgColor).toBeTruthy();

          const ratio = contrastRatio(textColor, bgColor);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        },
      ),
      { numRuns: 100 },
    );
  });
});
