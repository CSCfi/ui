import { defineConfig } from "vitest/config";

// Every Vitest project in the monorepo. A listed package config may itself be
// a container declaring several projects (packages/csc-ui: browser + node);
// Vitest flattens it, so `pnpm test` here and `pnpm ui test` agree.
export default defineConfig({
  test: {
    projects: [
      "packages/csc-ui/vitest.config.ts",
      "packages/csc-ui-documentation/vitest.config.ts",
    ],
  },
});
