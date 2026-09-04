// WCAG contrast audit of the semantic-token pairs.
// Resolves each role to a hex per mode (light/dark) from the palette + semantic
// maps, then checks foreground/background pairs against AA thresholds.
// Informational by default; `--strict` exits 1 if any text pair is below AA.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

const read = (p) => JSON.parse(fs.readFileSync(path.resolve(dir, p), 'utf8'));

// --- palette: stepKey ("primary-600", "white") -> hex ---------------------
const base = read('../tokens/theme/base.json');

const palette = {};
(function walk(o, p) {
  if (o && typeof o === 'object') {
    if (typeof o.value === 'string') palette[p] = o.value;
    else for (const k in o) walk(o[k], p ? `${p}.${k}` : k);
  }
})(base.theme, '');

// keys come as "primary.600" / "white"; normalise to "primary-600" / "white"
const step = (k) => palette[k.replace(/-/g, '.')] ?? palette[k];

const light = read('../tokens/semantic/light.json');

const dark = read('../tokens/semantic/dark.json');

const inv = read('../tokens/semantic/invariant.json');

// Translucent ink authored as a color-mix over transparent (the divider role,
// ADR-0036): captures the referenced palette step and its percentage.
const COLOR_MIX =
  /^color-mix\(in srgb, var\(--c-([a-z0-9-]+)\) (\d+(?:\.\d+)?)%, transparent\)$/;

const resolve = (mode) => {
  const map = { ...inv, ...mode };

  const out = {};

  for (const [role, s] of Object.entries(map)) {
    if (role.startsWith('_')) continue;

    // translucent ink resolves to { alpha, hex } and is composited over its
    // paired background before the ratio is computed
    const mix = s.match(COLOR_MIX);

    if (mix) {
      const hex = step(mix[1]);

      if (hex) out[role] = { alpha: Number(mix[2]) / 100, hex };
      continue;
    }

    // literal hex passes through (fixed brand marks, e.g. the logo roles)
    const hex = s.startsWith('#') ? s : step(s);

    if (hex) out[role] = hex;
  }

  return out;
};

// --- contrast math --------------------------------------------------------
const srgb = (hex) => {
  const h = hex.replace('#', '').slice(0, 6);

  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const lum = (hex) => {
  const [r, g, b] = srgb(hex).map(lin);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [la, lb] = [lum(a), lum(b)].sort((x, y) => y - x);

  return (la + 0.05) / (lb + 0.05);
};

// flatten a translucent ink onto an opaque background: a·fg + (1−a)·bg
const composite = (ink, bgHex) => {
  const fg = srgb(ink.hex);

  const bg = srgb(bgHex);

  return `#${fg
    .map((c, i) =>
      Math.round((ink.alpha * c + (1 - ink.alpha) * bg[i]) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

// --- pairs ----------------------------------------------------------------
const ROLES = [
  'primary',
  'secondary',
  'accent',
  'success',
  'info',
  'warning',
  'error',
  'link',
];

const TEXT = 4.5; // AA normal text

const UI = 3.0; // AA large text / non-text UI

// Regression floor for translucent hairlines (ADR-0036): a hairline is
// decorative and cannot meet 3:1 by design — the reference light-mode divider
// reads ~1.3:1. This floor only guards against the vanishing-line failure
// (border ≡ surface-overlay shipped at 1.00:1). Gated under --strict.
const HAIRLINE = 1.25;

const pairs = [];

const add = (fg, bg, min, label) => pairs.push({ bg, fg, label, min });

// surface ladder + foreground text
for (const bg of [
  'surface',
  'surface-raised',
  'surface-overlay',
  'surface-muted',
]) {
  add('on-surface', bg, TEXT, `on-surface / ${bg}`);
  add('on-surface-muted', bg, TEXT, `on-surface-muted / ${bg}`);
}

// solid role + its on-color
for (const r of ROLES) {
  add(`on-${r}`, r, TEXT, `on-${r} / ${r}`);
  add(`on-${r}-subtle`, `${r}-subtle`, TEXT, `on-${r}-subtle / ${r}-subtle`);
}

// nav chrome
add('on-nav', 'nav-surface', TEXT, 'on-nav / nav-surface');
add('on-nav', 'nav-surface-hover', TEXT, 'on-nav / nav-surface-hover');
add('on-nav-active', 'nav-active', TEXT, 'on-nav-active / nav-active');
// inverse family (mode-invariant; values identical both modes)
add('inverse-on', 'inverse-primary', TEXT, 'inverse-on / inverse-primary');
add(
  'inverse-primary',
  'inverse-surface',
  TEXT,
  'inverse-primary / inverse-surface',
);
// inverted-surface tier (ADR-0032; mode-aware contrast flip). Neutral inks are
// text (4.5); the status badge pairs are icon glyphs and badge-vs-ground
// adjacency, so non-text UI (3.0) applies.
add(
  'on-surface-inverted',
  'surface-inverted',
  TEXT,
  'on-surface-inverted / surface-inverted',
);
add(
  'on-surface-inverted-muted',
  'surface-inverted',
  TEXT,
  'on-surface-inverted-muted / surface-inverted',
);

// Each status accent ink is the coloured icon on the inverted ground; its
// halo is an alpha wash of the same role, so the ink is audited against the
// ground it effectively sits on. Icons are non-text UI (3.0).
for (const r of ['success', 'info', 'warning', 'error']) {
  add(
    `${r}-inverted`,
    'surface-inverted',
    UI,
    `${r}-inverted / surface-inverted (status icon)`,
  );
}

// non-text UI (3:1): outlines, focus ring, primary fill/icon on surface
add(
  'border-strong',
  'surface',
  UI,
  'border-strong / surface (control outline)',
);
add('ring', 'surface', UI, 'ring / surface (focus)');
add('primary', 'surface', UI, 'primary / surface (icon/fill)');
// the unselected button-group / tab-buttons label is `primary` text sitting on
// the opaque `surface-sunken` track fill (ADR-0042) — real text, AA applies
add(
  'primary',
  'surface-sunken',
  TEXT,
  'primary / surface-sunken (button-group label on track)',
);

// hairline divider on every surface-ladder rung (composited, ADR-0036),
// including the canvas rung: the button-group track frame sits there
// (ADR-0042)
for (const bg of [
  'surface',
  'surface-raised',
  'surface-overlay',
  'surface-muted',
  'surface-sunken',
]) {
  add('divider', bg, HAIRLINE, `divider / ${bg} (hairline)`);
}

// --- run ------------------------------------------------------------------
const modes = { dark: resolve(dark), light: resolve(light) };

let failures = 0;

let textFailures = 0;

let hairlineFailures = 0;

for (const [name, res] of Object.entries(modes)) {
  console.log(`\n=== ${name.toUpperCase()} ===`);

  for (const { bg, fg, label, min } of pairs) {
    const bgHex = res[bg];

    // a background must be opaque; a translucent one cannot be a pair's ground
    let fgHex = res[fg];

    if (!fgHex || !bgHex || typeof bgHex === 'object') {
      console.log(`  ?  ${label} — missing role (${fg} or ${bg})`);
      continue;
    }

    if (typeof fgHex === 'object') fgHex = composite(fgHex, bgHex);

    const r = ratio(fgHex, bgHex);

    const ok = r >= min;

    if (!ok) {
      failures++;

      if (min === TEXT) textFailures++;

      if (min === HAIRLINE) hairlineFailures++;
    }

    const mark = ok ? '✓' : '✗';
    console.log(
      `  ${mark} ${r.toFixed(2)}:1 (need ${min})  ${label}${
        ok ? '' : `   [${fgHex} on ${bgHex}]`
      }`,
    );
  }
}

console.log(
  `\n${failures} pair(s) below threshold (${textFailures} text pairs below AA 4.5, ${hairlineFailures} hairlines below the visibility floor).`,
);

if (
  process.argv.includes('--strict') &&
  (textFailures > 0 || hairlineFailures > 0)
)
  process.exit(1);
