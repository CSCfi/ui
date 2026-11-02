import type { BrowserCommandContext, BrowserConfigOptions } from 'vitest/node';

import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Deterministic glyphs for visual baselines: the fontconfig selects the
 * Liberation 2.1.5 files bundled in `packages/csc-ui/src/test/fonts` ahead of
 * any system font and aliases every generic family onto them. Without it
 * `sans-serif` is WenQuanYi Zen Hei in the devcontainer and DejaVu Sans on
 * ubuntu-latest, and the distros' own Liberation copies differ in version
 * (1.07.4 vs 2.1.5) (ADR-0049).
 */
export const FONTS_CONF = path.join(
  root,
  'packages/csc-ui/src/test/fonts.conf',
);

const FONTS_DIR = path.join(root, 'packages/csc-ui/src/test/fonts');

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

export type Engine = 'chromium' | 'firefox' | 'webkit';

/**
 * The engines `TEST_BROWSERS` lists (comma-separated), Chromium alone when it
 * is unset. CI runs the behaviour specs on all three (ADR-0077); the
 * devcontainer has only Chromium, since Playwright's Firefox and WebKit need
 * system libraries its arm64 image lacks.
 */
export const testEngines = (): Engine[] => {
  const engines = (process.env.TEST_BROWSERS ?? 'chromium')
    .split(',')
    .map((engine) => engine.trim())
    .filter(Boolean);

  for (const engine of engines) {
    if (!['chromium', 'firefox', 'webkit'].includes(engine)) {
      throw new Error(`TEST_BROWSERS: unknown engine "${engine}"`);
    }
  }

  return engines as Engine[];
};

const browserContext = {
  colorScheme: 'light',
  deviceScaleFactor: 1,
  // Components honour prefers-reduced-motion (c-modal, c-tabs): no
  // open/close keyframes to wait for.
  reducedMotion: 'reduce',
} as const;

const providers = {
  chromium: () =>
    playwright({
      contextOptions: browserContext,
      launchOptions: {
        args: ['--font-render-hinting=none', '--force-device-scale-factor=1'],
        env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
        // Unset → Playwright resolves PLAYWRIGHT_BROWSERS_PATH (/ms-playwright
        // in the devcontainer, ~/.cache/ms-playwright in CI).
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      },
    }),
  // Firefox and WebKit run behaviour specs only, never visual baselines, but
  // read the same pinned fonts: specs that measure text (c-breadcrumb's fold,
  // c-tab-buttons' overflow) then see the same glyph widths.
  firefox: () =>
    playwright({
      contextOptions: browserContext,
      launchOptions: {
        env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
        // The content-process sandbox reads only the system font directories;
        // without this the bundled Liberation files are invisible and every
        // family falls back to DejaVu, about 15% wider.
        firefoxUserPrefs: {
          'security.sandbox.content.read_path_whitelist': `${FONTS_DIR}/`,
        },
      },
    }),
  webkit: () =>
    playwright({
      contextOptions: browserContext,
      launchOptions: { env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF } },
    }),
} satisfies Record<Engine, () => BrowserConfigOptions['provider']>;

/**
 * The browser block every Vitest browser project in the monorepo shares:
 * headless Playwright, a desktop viewport (c-dropdown goes mobile at ≤760px),
 * reduced motion, pinned fonts, and the visual-baseline comparator. `name` is
 * the Chromium instance's name; another engine's instance is
 * `<name> (<engine>)`.
 */
export const browserProject = (
  name: string,
  engines: readonly Engine[] = ['chromium'],
): BrowserConfigOptions => ({
  commands: {
    /**
     * Switch the page's `prefers-reduced-motion` for a spec that asserts the
     * motion itself. The context default (`browserContext`) is `reduce`;
     * restore it after.
     */
    emulateReducedMotion: async (
      ctx: BrowserCommandContext,
      value: 'no-preference' | 'reduce',
    ) => {
      await ctx.page.emulateMedia({ reducedMotion: value });
    },
  },
  enabled: true,
  expect: {
    toMatchScreenshot: {
      comparatorName: 'pixelmatch',
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
  instances: engines.map((engine) => ({
    browser: engine,
    name: engine === 'chromium' ? name : `${name} (${engine})`,
    provider: providers[engine](),
  })),
  // Failure screenshots would land in __screenshots__ next to baselines.
  screenshotFailures: false,
  viewport: { height: 800, width: 1280 },
});
