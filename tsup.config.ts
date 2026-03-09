import { defineConfig } from "tsup";
import { copyFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "tailwindcss"],
  treeshake: true,
  onSuccess: async () => {
    // Copy tokens.css into dist/ so consumers can import @ugsys/ui-lib/tokens.css
    copyFileSync(
      resolve(__dirname, "src/tokens/tokens.css"),
      resolve(__dirname, "dist/tokens.css")
    );
    console.log("✓ tokens.css copied to dist/");
  },
});
