/**
 * og:image renderer (plan `_plan/csc-ui-landing-page.md`): writes
 * `public/og-image.png`, the 1200×630 preview a shared link to the site
 * unfurls with. Re-run after the landing page's pitch, the logo or the
 * component count changes, and commit the PNG:
 *
 *   pnpm og-image
 *
 * Needs a built csc-ui (the manifest and tokens). Renders in the pinned
 * Playwright Chromium with the library's own tokens.css, the c-csc-logo paths
 * and the site's self-hosted Noto Sans, so the image matches the page.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

const OUT = resolve(here, '../public/og-image.png');

const tokens = readFileSync(
  require.resolve('@cscfi/csc-ui/css/tokens.css'),
  'utf8',
);

const font = readFileSync(
  require.resolve('@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2'),
).toString('base64');

// Standalone components, counted as the docs' navComponents are.
const manifest = JSON.parse(
  readFileSync(require.resolve('@cscfi/csc-ui/custom-elements.json'), 'utf8'),
);

const declarations = manifest.modules
  .flatMap((module) => module.declarations)
  .filter((declaration) => declaration.customElement && declaration.tagName);

const children = new Set(
  declarations.flatMap((declaration) => declaration.csc?.subcomponents ?? []),
);

const count = declarations.filter(
  (declaration) => !children.has(declaration.tagName),
).length;

// The logo's three paths, in source order: wordmark, teal mark, magenta mark.
const [wordmark, teal, magenta] = [
  ...readFileSync(
    resolve(here, '../../csc-ui/src/components/c-csc-logo/CCscLogo.vue'),
    'utf8',
  ).matchAll(/\bd="([^"]+)"/g),
].map((match) => match[1]);

const html = `<!doctype html>
<html data-theme="light">
<head>
<style>
${tokens}
@font-face {
  font-family: 'Noto Sans Variable';
  font-weight: 100 900;
  src: url(data:font/woff2;base64,${font}) format('woff2-variations');
}
html, body { margin: 0; }
body {
  width: 1200px;
  height: 630px;
  box-sizing: border-box;
  padding: 72px 88px;
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  color: var(--c-on-surface);
  font-family: 'Noto Sans Variable', sans-serif;
  position: relative;
  overflow: hidden;
}
.backdrop {
  position: absolute;
  right: -180px;
  bottom: -240px;
  width: 520px;
  height: 440px;
  border-radius: 64px;
  background: var(--c-primary-subtle);
  transform: rotate(-8deg);
}
svg, p, h1 { position: relative; }
svg { width: 168px; }
.eyebrow {
  margin: 56px 0 0;
  color: var(--c-primary);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1 {
  margin: 16px 0 0;
  max-width: 900px;
  font-size: 68px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
p.sub {
  margin: 28px 0 0;
  max-width: 820px;
  color: var(--c-on-surface-muted);
  font-size: 28px;
  line-height: 1.45;
}
</style>
</head>
<body>
  <div class="backdrop"></div>
  <svg viewBox="0 0 233.61 149.04" aria-hidden="true">
    <path fill="var(--c-logo-wordmark)" d="${wordmark}"/>
    <path fill="var(--c-logo-teal)" d="${teal}"/>
    <path fill="var(--c-logo-magenta)" d="${magenta}"/>
  </svg>
  <p class="eyebrow">CSC Design System</p>
  <h1>Build CSC services that look and work as one.</h1>
  <p class="sub">${count} accessible web components in light and dark, for Vue, React, Angular or plain TypeScript.</p>
</body>
</html>`;

const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 630, width: 1200 },
  });

  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT });

  console.log(`og-image: wrote ${OUT} (${count} components)`);
} finally {
  await browser.close();
}
