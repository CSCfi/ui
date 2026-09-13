import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import { sfcPlugins } from './vite.plugins';

const here = fileURLToPath(new URL('.', import.meta.url));

// Deterministic glyphs for visual baselines: `sans-serif` resolves to WenQuanYi
// Zen Hei in the devcontainer and to DejaVu Sans on ubuntu-latest. Alias every
// generic family to Liberation, which `playwright install --with-deps` puts on
// both machines.
const fontsConf = path.join(here, 'src/test/fonts.conf');

// Behaviour specs, conformance suites, visual baselines and the dist smoke —
// everything that touches a registered custom element (ADR-0049).
export default defineConfig({
  define: {
    // The dist smoke may skip locally (nothing built yet) but never in CI.
    __CSC_REQUIRE_DIST__: JSON.stringify(Boolean(process.env.CI)),
  },
  plugins: sfcPlugins(),
  test: {
    browser: {
      enabled: true,
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          // A 1% budget of differing pixels plus a per-pixel YIQ tolerance for
          // arm64 vs x64 anti-aliasing. Tune after the first CI run; never
          // raise past the point where a token flip would pass.
          comparatorOptions: {
            allowedMismatchedPixelRatio: 0.01,
            threshold: 0.2,
          },
          // The default appends `-${platform}`; every run is linux, so drop
          // it. If arm64/x64 ever diverge past tolerance, append
          // `-${process.arch}` here and author one set per arch.
          resolveScreenshotPath: ({
            arg,
            browserName,
            ext,
            root,
            screenshotDirectory,
            testFileDirectory,
            testFileName,
          }) =>
            path.join(
              root,
              testFileDirectory,
              screenshotDirectory,
              testFileName,
              `${arg}-${browserName}${ext}`,
            ),
        },
      },
      headless: true,
      instances: [{ browser: 'chromium', name: 'browser' }],
      provider: playwright({
        contextOptions: { colorScheme: 'light', deviceScaleFactor: 1 },
        launchOptions: {
          args: ['--font-render-hinting=none', '--force-device-scale-factor=1'],
          env: { ...process.env, FONTCONFIG_FILE: fontsConf },
          // Unset → Playwright resolves PLAYWRIGHT_BROWSERS_PATH (/ms-playwright
          // in the devcontainer, ~/.cache/ms-playwright in CI).
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      }),
      // Failure screenshots would land in __screenshots__ next to baselines.
      screenshotFailures: false,
      // c-dropdown switches to its mobile sheet at ≤760px; stay on desktop.
      viewport: { height: 800, width: 1280 },
    },
    exclude: ['src/**/*.node.spec.ts', '**/node_modules/**', '**/dist/**'],
    // Test files share one browser page (focus, pointer, keyboard). Run them
    // one at a time so real input events cannot cross between files.
    fileParallelism: false,
    include: ['src/**/*.spec.ts'],
    name: 'browser',
    // Chromium's benign ResizeObserver notice arrives as an unhandled error.
    onUnhandledError: (error) =>
      !/ResizeObserver loop completed with undelivered notifications/.test(
        error.message,
      ),
    root: here,
    setupFiles: ['./src/test/setup.browser.ts'],
    testTimeout: 15_000,
  },
});
