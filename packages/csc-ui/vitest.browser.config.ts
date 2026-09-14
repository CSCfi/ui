import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import {
  browserProject,
  ignoreBenignBrowserNotices,
} from '../../vitest.browser.shared';
import { sfcPlugins } from './vite.plugins';

const here = fileURLToPath(new URL('.', import.meta.url));

// Behaviour specs, conformance suites, visual baselines and the dist smoke —
// everything that touches a registered custom element (ADR-0049).
export default defineConfig({
  define: {
    // The dist smoke may skip locally (nothing built yet) but never in CI.
    __CSC_REQUIRE_DIST__: JSON.stringify(Boolean(process.env.CI)),
  },
  plugins: sfcPlugins(),
  test: {
    browser: browserProject('browser'),
    exclude: ['src/**/*.node.spec.ts', '**/node_modules/**', '**/dist/**'],
    // Test files share one browser page (focus, pointer, keyboard). Run them
    // one at a time so real input events cannot cross between files.
    fileParallelism: false,
    include: ['src/**/*.spec.ts'],
    name: 'browser',
    onUnhandledError: ignoreBenignBrowserNotices,
    root: here,
    setupFiles: ['./src/test/setup.browser.ts'],
    testTimeout: 15_000,
  },
});
