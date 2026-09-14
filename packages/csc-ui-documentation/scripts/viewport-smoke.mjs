/**
 * Viewport smoke (plan `_plan/fullscreen-panel-and-mobile-docs.md`, part B):
 * every prerendered route of the docs site must fit a 360px-wide phone
 * viewport without page-level horizontal scroll. Wide content (code, tables,
 * wide examples) scrolls inside its own container; nothing widens the page.
 *
 * Usage (after `pnpm generate`):
 *   node scripts/viewport-smoke.mjs [--width 360] [--height 740] [--only <route>]
 *
 * Serves `.output/public` on a local port, opens each `index.html` route in
 * the pinned Playwright Chromium at the phone viewport, waits for the custom
 * elements to upgrade, and fails the run when a route's scroll width exceeds
 * the viewport — naming the widest offending elements, with their light-DOM
 * path and the shadow host they sit in, so the fix is targeted.
 */
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = fileURLToPath(new URL('.', import.meta.url));

const PUBLIC = resolve(here, '../.output/public');

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

const MIME = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(PUBLIC)) {
  console.error(
    `viewport-smoke: ${relative(process.cwd(), PUBLIC)} is missing — run \`pnpm generate\` first`,
  );
  process.exit(2);
}

/** Every prerendered route: a directory holding an index.html, as a URL path. */
const routes = (dir = PUBLIC, found = []) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      if (entry !== '_nuxt') routes(path, found);
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

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  let file = join(PUBLIC, decodeURIComponent(url.pathname));

  if (existsSync(file) && statSync(file).isDirectory())
    file = join(file, 'index.html');

  if (!existsSync(file)) {
    res.writeHead(404);
    res.end();

    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));

const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
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

  // Hydration + custom-element upgrade: every c-* tag on the page defined,
  // then two frames for the upgraded elements to lay out.
  await page.evaluate(async () => {
    const tags = new Set(
      Array.from(document.querySelectorAll('*'))
        .map((el) => el.localName)
        .filter((name) => name.startsWith('c-')),
    );

    await Promise.all(
      Array.from(tags).map((tag) => customElements.whenDefined(tag)),
    );
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });

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
server.close();

console.log(
  `\nviewport-smoke: ${list.length - failures.length}/${list.length} routes fit ${WIDTH}×${HEIGHT}`,
);

process.exit(failures.length ? 1 : 0);
