import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        ".next/**",
        "coverage/**",
        "next-env.d.ts",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "src/types/**",
        "vitest.config.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.d.ts",
      ],
    },
  },
});
