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

const resolve = (mode) => {
  const map = { ...inv, ...mode };

  const out = {};

  for (const [role, s] of Object.entries(map)) {
    if (role.startsWith('_')) continue;

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
// non-text UI (3:1): outlines, focus ring, primary fill/icon on surface
add(
  'border-strong',
  'surface',
  UI,
  'border-strong / surface (control outline)',
);
add('ring', 'surface', UI, 'ring / surface (focus)');
add('primary', 'surface', UI, 'primary / surface (icon/fill)');

// --- run ------------------------------------------------------------------
const modes = { dark: resolve(dark), light: resolve(light) };

let failures = 0;

let textFailures = 0;

for (const [name, res] of Object.entries(modes)) {
  console.log(`\n=== ${name.toUpperCase()} ===`);

  for (const { bg, fg, label, min } of pairs) {
    if (!res[fg] || !res[bg]) {
      console.log(`  ?  ${label} — missing role (${fg} or ${bg})`);
      continue;
    }

    const r = ratio(res[fg], res[bg]);

    const ok = r >= min;

    if (!ok) {
      failures++;

      if (min === TEXT) textFailures++;
    }

    const mark = ok ? '✓' : '✗';
    console.log(
      `  ${mark} ${r.toFixed(2)}:1 (need ${min})  ${label}${
        ok ? '' : `   [${res[fg]} on ${res[bg]}]`
      }`,
    );
  }
}

console.log(
  `\n${failures} pair(s) below threshold (${textFailures} text pairs below AA 4.5).`,
);

if (process.argv.includes('--strict') && textFailures > 0) process.exit(1);
