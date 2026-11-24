/**
 * Viewport smoke (plan `_plan/fullscreen-panel-and-mobile-docs.md`, part B):
 * every prerendered route of the docs site must fit a 360px-wide phone
 * viewport without page-level horizontal scroll. Wide content (code, tables,
 * wide examples) scrolls inside its own container; nothing widens the page.
 *
 * Usage (after `pnpm generate`):
 *   node scripts/viewport-smoke.mjs [--width 360] [--height 740] [--only <route>]
 * Renders with the harness font pin (see FONTS_CONF below).
 *
 * Serves `.output/public` on a local port, opens each `index.html` route in
 * the pinned Playwright Chromium at the phone viewport, waits for the custom
 * elements to upgrade, and fails the run when a route's scroll width exceeds
 * the viewport — naming the widest offending elements, with their light-DOM
 * path and the shadow host they sit in, so the fix is targeted.
 *
 * The landing page also gets an axe pass (WCAG 2.1 AA, the example smoke's
 * tags) in both theme modes (plan `_plan/csc-ui-landing-page.md`): it is the
 * one page of hand-written markup around live components, where a skipped
 * heading level or an unnamed link would otherwise go unchecked.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import {
  PUBLIC,
  requireGenerated,
  servePublic,
  settlePage,
} from './static-site.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

/** Routes that also get the axe pass, in both theme modes. */
const AXE_ROUTES = new Set(['/']);

/** The example smoke's axe rules (tests/smoke.ts AXE_OPTIONS). */
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * The same font pin the visual baselines use (ADR-0049): the bundled
 * Liberation 2.1.5, so a route fits or overflows identically in the
 * devcontainer and in CI — without it the runner renders DejaVu Sans, which is
 * wider, and a route that fits here can spill there. Set FONTCONFIG_FILE to
 * probe another stack on purpose.
 */
const FONTS_CONF =
  process.env.FONTCONFIG_FILE ??
  resolve(here, '../../csc-ui/src/test/fonts.conf');

const args = process.argv.slice(2);

const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);

  return index === -1 ? fallback : args[index + 1];
};

const WIDTH = Number(option('width', 360));

const HEIGHT = Number(option('height', 740));

const ONLY = option('only', null);

/** Directory for a first-screen screenshot of every route (a review aid); none by default. */
const SHOTS = option('shots', null);

/** A route may exceed the viewport by this much before it counts (subpixel rounding). */
const TOLERANCE = 1;

requireGenerated('viewport-smoke');

/** Every prerendered route: a directory holding an index.html, as a URL path. */
const routes = (dir = PUBLIC, found = []) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      // The /v3/ archive is the 3.x site, built once (build-v3-archive.mjs).
      if (entry !== '_nuxt' && path !== join(PUBLIC, 'v3')) {
        routes(path, found);
      }
    } else if (entry === 'index.html') {
      const route = `/${relative(PUBLIC, dir).split('\\').join('/')}`.replace(
        /\/$/,
        '',
      );

      found.push(route || '/');
    }
  }

  return found.sort();
};

const { close, origin } = await servePublic();

const browser = await chromium.launch({
  env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

const context = await browser.newContext({
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
  viewport: { height: HEIGHT, width: WIDTH },
});

const page = await context.newPage();

const failures = [];

const list = ONLY ? [ONLY] : routes();

for (const route of list) {
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });

  await settlePage(page);

  const result = await page.evaluate((tolerance) => {
    const viewport = document.documentElement.clientWidth;

    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );

    /**
     * The horizontal-overflow treatment `el` gets from its nearest clipping
     * ancestor: 'scroll' (auto / scroll — wide content the user can reach),
     * 'cut' (hidden / clip — content the user cannot reach), or 'page' (none —
     * it widens the page).
     */
    const clipping = (el) => {
      let node = el.parentElement ?? el.getRootNode()?.host ?? null;

      while (node && node !== document.documentElement) {
        const { overflowX } = getComputedStyle(node);

        if (overflowX === 'auto' || overflowX === 'scroll') return 'scroll';

        if (overflowX === 'hidden' || overflowX === 'clip') return 'cut';

        node = node.parentElement ?? node.getRootNode()?.host ?? null;
      }

      return 'page';
    };

    /**
     * Does `el` show any text? Walks its composed subtree (light children,
     * shadow roots, slotted content) for a non-blank text node whose parent
     * renders a box. A box without rendered text — an inactive carousel panel
     * whose content is `display: none`, a decorative swatch — cannot be "cut
     * off" in any way a reader would notice.
     */
    const hasVisibleText = (el) => {
      const stack = [el];

      while (stack.length) {
        const node = stack.pop();

        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            if (
              child.textContent.trim() &&
              node instanceof Element &&
              node.getClientRects().length > 0
            )
              return true;
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            stack.push(child);

            if (child.shadowRoot) stack.push(child.shadowRoot);
          }
        }

        if (node instanceof Element && node.shadowRoot)
          stack.push(node.shadowRoot);
      }

      return false;
    };

    const describe = (el) => {
      const root = el.getRootNode();

      const host =
        root instanceof ShadowRoot ? `<${root.host.localName}> ▸ ` : '';

      const tag = el.localName;

      const id = el.id ? `#${el.id}` : '';

      const cls =
        typeof el.className === 'string' && el.className
          ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
          : '';

      const part = el.getAttribute?.('part')
        ? `[part=${el.getAttribute('part')}]`
        : '';

      return `${host}${tag}${id}${part}${cls}`;
    };

    const offenders = [];

    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        const rect = el.getBoundingClientRect();

        // Only readable content that is partly on screen and cut at the edge
        // counts: an element entirely past the edge is an off-canvas drawer or
        // a hidden state, and a box without rendered text cannot be cut.
        if (
          rect.width > 0 &&
          rect.left < viewport &&
          rect.right > viewport + tolerance &&
          getComputedStyle(el).visibility !== 'hidden' &&
          hasVisibleText(el)
        ) {
          const treatment = clipping(el);

          if (treatment !== 'scroll') {
            offenders.push({
              right: Math.round(rect.right),
              treatment,
              what: describe(el),
            });
          }
        }

        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };

    walk(document);
    offenders.sort((a, b) => b.right - a.right);

    return { offenders: offenders.slice(0, 8), scrollWidth, viewport };
  }, TOLERANCE);

  if (SHOTS) {
    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({
      fullPage: false,
      path: join(
        SHOTS,
        `${route === '/' ? 'index' : route.slice(1).replace(/\//g, '__')}.png`,
      ),
    });
  }

  if (AXE_ROUTES.has(route)) {
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });

    for (const mode of ['light', 'dark']) {
      const violations = await page.evaluate(
        async ({ mode, tags }) => {
          document.documentElement.setAttribute('data-theme', mode);
          await new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          );

          // Shiki's token colours (utils/highlight.ts themes) are the
          // site's choice for every code block, not the landing page's; their
          // contrast is a site-wide question, left out of this pass.
          const context = { exclude: [['.shiki']] };

          const { violations } = await window.axe.run(context, {
            resultTypes: ['violations'],
            runOnly: { type: 'tag', values: tags },
          });

          return violations.flatMap((violation) =>
            violation.nodes.map(
              (node) => `${violation.id} ${JSON.stringify(node.target)}`,
            ),
          );
        },
        { mode, tags: AXE_TAGS },
      );

      if (violations.length) {
        failures.push({ route });
        console.log(`✖ ${route}  axe (${mode})`);

        for (const line of violations) console.log(`    ${line}`);
      }
    }
  }

  const pageOverflow = result.scrollWidth > result.viewport + TOLERANCE;

  if (pageOverflow || result.offenders.length) {
    failures.push({ route, ...result });
    console.log(
      `✖ ${route}  ${
        pageOverflow
          ? `scrollWidth ${result.scrollWidth} > ${result.viewport}`
          : 'content cut off at the viewport edge'
      }`,
    );

    for (const o of result.offenders)
      console.log(
        `    ${String(o.right).padStart(5)}  ${o.treatment.padEnd(6)} ${o.what}`,
      );
  } else {
    console.log(`✔ ${route}`);
  }
}

await browser.close();
close();

console.log(
  `\nviewport-smoke: ${list.length - new Set(failures.map((f) => f.route)).size}/${list.length} routes pass at ${WIDTH}×${HEIGHT}`,
);

process.exit(failures.length ? 1 : 0);
