import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BrowserConfigOptions } from "vitest/node";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Deterministic glyphs for visual baselines: `sans-serif` resolves to WenQuanYi
 * Zen Hei in the devcontainer and to DejaVu Sans on ubuntu-latest. The
 * fontconfig aliases every generic family to Liberation, which
 * `playwright install --with-deps` puts on both machines (ADR-0049).
 */
export const FONTS_CONF = path.join(
  root,
  "packages/csc-ui/src/test/fonts.conf",
);

/**
 * Chromium reports a ResizeObserver callback that changed layout in the same
 * frame through the window `error` event. It is delivered as an unhandled
 * error but is not a component fault.
 */
export const RESIZE_OBSERVER_NOTICE =
  /ResizeObserver loop completed with undelivered notifications/;

export const ignoreBenignBrowserNotices = (error: {
  message: string;
}): boolean => !RESIZE_OBSERVER_NOTICE.test(error.message);

/**
 * The browser block every Vitest browser project in the monorepo shares:
 * headless Chromium through Playwright, a desktop viewport (c-dropdown goes
 * mobile at ≤760px), reduced motion, pinned fonts, and the visual-baseline
 * comparator. `name` is the project's instance name.
 */
export const browserProject = (name: string): BrowserConfigOptions => ({
  enabled: true,
  expect: {
    toMatchScreenshot: {
      comparatorName: "pixelmatch",
      // A 1% budget of differing pixels plus a per-pixel YIQ tolerance for
      // arm64 vs x64 anti-aliasing. Tune after the first CI run; never raise
      // past the point where a token flip would pass.
      comparatorOptions: {
        allowedMismatchedPixelRatio: 0.01,
        threshold: 0.2,
      },
      // The default appends `-${platform}`; every run is linux, so drop it.
      // If arm64/x64 ever diverge past tolerance, append `-${process.arch}`
      // here and author one set per arch.
      resolveScreenshotPath: ({
        arg,
        browserName,
        ext,
        root: projectRoot,
        screenshotDirectory,
        testFileDirectory,
        testFileName,
      }) =>
        path.join(
          projectRoot,
          testFileDirectory,
          screenshotDirectory,
          testFileName,
          `${arg}-${browserName}${ext}`,
        ),
    },
  },
  headless: true,
  instances: [{ browser: "chromium", name }],
  provider: playwright({
    contextOptions: {
      colorScheme: "light",
      deviceScaleFactor: 1,
      // Components honour prefers-reduced-motion (c-modal, c-tabs): no
      // open/close keyframes to wait for.
      reducedMotion: "reduce",
    },
    launchOptions: {
      args: ["--font-render-hinting=none", "--force-device-scale-factor=1"],
      env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
      // Unset → Playwright resolves PLAYWRIGHT_BROWSERS_PATH (/ms-playwright
      // in the devcontainer, ~/.cache/ms-playwright in CI).
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  }),
  // Failure screenshots would land in __screenshots__ next to baselines.
  screenshotFailures: false,
  viewport: { height: 800, width: 1280 },
});
