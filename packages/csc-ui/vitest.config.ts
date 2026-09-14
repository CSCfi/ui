import { defineConfig } from 'vitest/config';

// Container: declares this package's projects and runs no tests itself. The
// root vitest.config.ts lists this file, so `pnpm test` at the root and
// `pnpm ui test` resolve the same two projects (ADR-0049).
export default defineConfig({
  test: {
    projects: ['./vitest.browser.config.ts', './vitest.node.config.ts'],
  },
});
