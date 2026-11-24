/**
 * Component previews: the image on each card of the /components overview.
 * For every standalone component it opens the component's page in the
 * generated site, frames one live example's demo pane, and writes
 * `public/previews/<tag>-light.webp` and `<tag>-dark.webp`. Re-run after a
 * component's look changes, and commit the images:
 *
 *   pnpm generate && pnpm previews [--only <tag>]
 *
 * Renders in the pinned Playwright Chromium with the harness font pin, like
 * the viewport smoke; the site's own Noto Sans is self-hosted, so the text is
 * the site's. tests/component-previews.spec.ts fails when a standalone
 * component has no preview.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { requireGenerated, servePublic, settlePage } from './static-site.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

const OUT = resolve(here, '../public/previews');

const FONTS_CONF =
  process.env.FONTCONFIG_FILE ??
  resolve(here, '../../csc-ui/src/test/fonts.conf');

/**
 * The preview in CSS pixels, 8:5 as the card shows it; the image is twice
 * that, for high-density screens.
 */
const FRAME = { height: 275, width: 440 };

/**
 * How to frame a component whose `basic` example is not its best picture.
 * - `example`: the example to frame instead of `basic` (else the first).
 * - `attributes`: attributes set on the demo's elements first, by selector.
 * - `open`: the steps that open the overlay or the panel before the capture,
 *   each a click or a hover on the first element matching `selector` in the
 *   demo (CSS, piercing shadow roots: a c-* host is display: contents and has
 *   no box to press).
 * - `hide`: the demo's elements to hide once it is open, such as the buttons
 *   that raised a toast.
 * - `settle`: how long to wait once it is open, in ms (600 by default).
 * - `scale`: render the demo in a frame this many times larger, then shrink
 *   it to the preview, for a demo larger than the frame.
 * - `top`: start the demo at the frame's top edge (a panel opens below it).
 * - `viewport`: make the viewport the frame, for an overlay placed against
 *   the viewport (a modal centres in it). Otherwise the viewport stays a
 *   desktop's, wider than the narrow viewport, so a field's panel anchors
 *   under it instead of covering the screen.
 */
const click = (selector) => ({ action: 'click', selector });

const RECIPES = {
  'c-autocomplete': {
    open: [click('c-autocomplete input')],
    scale: 1.3,
    top: true,
  },
  'c-button': { example: 'variants', scale: 1.8 },
  'c-color-picker': {
    open: [click('c-icon-button[aria-label="Open colour picker"] button')],
    scale: 1.7,
    top: true,
  },
  'c-data-table': { scale: 1.8 },
  'c-date-picker': {
    open: [click('c-icon-button[aria-label="Open calendar"] button')],
    scale: 1.5,
    top: true,
  },
  'c-loader': { hide: 'c-button' },
  'c-login-buttons': { scale: 1.8 },
  'c-login-card': { scale: 2.2 },
  'c-main': { scale: 2.4 },
  'c-menu': {
    open: [click('[slot="trigger"] button')],
    scale: 1.2,
    top: true,
  },
  'c-modal': {
    open: [click('c-button button')],
    scale: 1.6,
    viewport: true,
  },
  'c-popover': {
    open: [click('[slot="trigger"] button')],
    scale: 1.2,
    top: true,
  },
  'c-select': { open: [click('c-select input')], scale: 1.2, top: true },
  'c-side-navigation': { scale: 1.6 },
  'c-table': { scale: 1.6 },
  'c-time-picker': {
    open: [click('c-icon-button[aria-label="Open time picker"] button')],
    scale: 1.4,
    settle: 2000,
    top: true,
  },
  // Contained: the stack sits in the frame, not against the viewport.
  'c-toasts': {
    attributes: { 'c-toasts': { contained: '' } },
    hide: 'c-button',
    open: [
      click('c-button:nth-of-type(1) button'),
      click('c-button:nth-of-type(2) button'),
    ],
    scale: 1.2,
  },
  'c-toolbar': { scale: 1.2 },
  'c-tooltip': {
    open: [{ action: 'hover', selector: '[slot="trigger"] button' }],
  },
  // The value input is clipped out of view: press the chevron.
  'c-tree-select': {
    open: [click('c-tree-select c-icon-button button')],
    scale: 1.3,
    top: true,
  },
};

const args = process.argv.slice(2);

const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

// Standalone components, as the docs' navComponents count them.
const manifest = JSON.parse(
  readFileSync(require.resolve('@cscfi/csc-ui/custom-elements.json'), 'utf8'),
);

const declarations = manifest.modules
  .flatMap((module) => module.declarations)
  .filter((declaration) => declaration.customElement && declaration.tagName);

const children = new Set(
  declarations.flatMap((declaration) => declaration.csc?.subcomponents ?? []),
);

const tags = ONLY
  ? [ONLY]
  : declarations
      .map((declaration) => declaration.tagName)
      .filter((tag) => !children.has(tag))
      .sort();

requireGenerated('component-previews');
mkdirSync(OUT, { recursive: true });

const { close, origin } = await servePublic();

const browser = await chromium.launch({
  env: { ...process.env, FONTCONFIG_FILE: FONTS_CONF },
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

const context = await browser.newContext({
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  viewport: { height: 900, width: 1280 },
});

const page = await context.newPage();

// Start the page's clock at one moment, so the date and time pickers open on
// the same month and hour on every run. It keeps running: Vue drops an event
// stamped no later than its listener was attached, so a frozen clock
// (`setFixedTime`) swallows the clicks that open the panels.
await page.clock.setSystemTime(new Date('2026-05-14T09:30:00'));

// Encodes a PNG screenshot as WebP at the frame size through a canvas, so
// the script needs no image library.
const encoder = await context.newPage();

const toWebp = (png) =>
  encoder.evaluate(
    async ({ data, height, width }) => {
      const image = new Image();

      image.src = `data:image/png;base64,${data}`;
      await image.decode();

      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, height);

      return canvas.toDataURL('image/webp', 0.85).split(',')[1];
    },
    {
      data: png.toString('base64'),
      height: FRAME.height * 2,
      width: FRAME.width * 2,
    },
  );

const failures = [];

for (const tag of tags) {
  const recipe = RECIPES[tag] ?? {};

  try {
    const scale = recipe.scale ?? 1;

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto(`${origin}/components/${tag}`, {
      waitUntil: 'networkidle',
    });

    const figure = recipe.example
      ? `#example-${tag}-${recipe.example}`
      : (await page.locator(`#example-${tag}-basic`).count())
        ? `#example-${tag}-basic`
        : `figure[id^="example-${tag}-"]`;

    const pane = page.locator(`${figure} .example-demo`).first();

    // The demos are client-only: wait for this one to mount and upgrade.
    await pane.locator('*').first().waitFor();
    await settlePage(page);

    // The demo's pane becomes the frame (times the recipe's scale), fixed at
    // the viewport's corner above the docs page, which the capture clips to.
    // The demo sits centred (or at the top), never wider than the frame,
    // without the value read-outs the examples print under it.
    const frame = {
      height: Math.round(FRAME.height * scale),
      width: Math.round(FRAME.width * scale),
    };

    if (recipe.viewport) await page.setViewportSize(frame);

    await pane.evaluate(
      (el, { attributes, frame, top }) => {
        for (const [selector, values] of Object.entries(attributes ?? {}))
          for (const target of el.querySelectorAll(selector))
            for (const [name, value] of Object.entries(values))
              target.setAttribute(name, value);

        Object.assign(el.style, {
          boxSizing: 'border-box',
          display: 'grid',
          // One frame-wide track, so the demo's max-width is the frame's.
          gridTemplateColumns: 'minmax(0, 1fr)',
          height: `${frame.height}px`,
          left: '0',
          margin: '0',
          overflow: 'hidden',
          padding: '24px',
          placeItems: top ? 'start center' : 'center',
          position: 'fixed',
          top: '0',
          width: `${frame.width}px`,
          zIndex: '2147483000',
        });

        const demo = el.firstElementChild;

        Object.assign(demo.style, {
          maxWidth: '100%',
          minWidth: 'min(100%, 20rem)',
          width: 'max-content',
        });

        for (const readout of demo.querySelectorAll(':scope > p, :scope > pre'))
          readout.style.display = 'none';

        if (demo.offsetHeight > el.clientHeight - 48)
          el.style.alignItems = 'start';
      },
      { attributes: recipe.attributes, frame, top: recipe.top },
    );
    await settlePage(page);

    // The cursor stays where the last capture left it, which would hover
    // whatever lies there now: park it in the viewport's far corner, outside
    // the frame (or at the frame's own corner, the viewport's), and again
    // after a click — only a hover step keeps it on its target.
    const parkCursor = () =>
      recipe.viewport
        ? page.mouse.move(frame.width - 1, frame.height - 1)
        : page.mouse.move(1279, 899);

    await parkCursor();

    for (const step of recipe.open ?? []) {
      const target = pane.locator(step.selector).first();

      await (step.action === 'hover' ? target.hover() : target.click());
    }

    if (!recipe.open?.some((step) => step.action === 'hover'))
      await parkCursor();

    await page.waitForTimeout(recipe.settle ?? 600);

    if (recipe.hide) {
      await pane.evaluate((el, selector) => {
        for (const target of el.querySelectorAll(selector))
          target.style.display = 'none';
      }, recipe.hide);
    }

    // Freeze every animation at one moment, so a preview is the same image
    // on every run: 2.5s is a whole spinner loop (its longest arc), and every
    // finite entrance has finished. `document.getAnimations()` leaves out the
    // shadow roots' animations (a spinner's arc, a toast's timer), so ask
    // every root.
    await page.evaluate(() => {
      const roots = [document];

      for (const root of roots) {
        for (const el of root.querySelectorAll('*'))
          if (el.shadowRoot) roots.push(el.shadowRoot);

        for (const animation of root.getAnimations()) {
          animation.pause();
          animation.currentTime = 2500;
        }
      }
    });

    for (const mode of ['light', 'dark']) {
      await page.evaluate((mode) => {
        document.documentElement.setAttribute('data-theme', mode);
      }, mode);
      await settlePage(page);
      await page.waitForTimeout(300);

      writeFileSync(
        join(OUT, `${tag}-${mode}.webp`),
        Buffer.from(
          await toWebp(
            await page.screenshot({ clip: { x: 0, y: 0, ...frame } }),
          ),
          'base64',
        ),
      );
    }

    console.log(`✔ ${tag}`);
  } catch (error) {
    failures.push(tag);
    console.log(`✖ ${tag}  ${error.message.split('\n')[0]}`);
  }
}

await browser.close();
close();

console.log(
  `\ncomponent-previews: ${tags.length - failures.length}/${tags.length} written to ${OUT}`,
);

process.exit(failures.length ? 1 : 0);
