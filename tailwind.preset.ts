import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        brand: "var(--color-brand)",
        accent: "var(--color-accent)",
        footer: "var(--color-footer)",
        background: "var(--color-background)",
      },
      fontFamily: {
        sans: ["Open Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      ringColor: {
        accent: "var(--color-focus-ring)",
      },
    },
  },
} satisfies Partial<Config>;
