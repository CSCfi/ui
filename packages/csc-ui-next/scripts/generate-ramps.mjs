// Generate the chromatic color ramps (steps 50–950) for tokens/theme/base.json.
//
// Each ramp is derived from a single brand seed in a perceptual space (OKLCH),
// rather than the previous linear sRGB blend toward white/black which
// desaturated the mid-steps ("muddy" ramps, worst in dark mode). The seed is
// anchored at step 500 — so 500 reproduces the brand color exactly and 600–950
// give progressively darker shades below it. Lightness follows a perceptual
// curve; chroma follows a bell curve peaking in the mids (the "pop" lever),
// then is gamut-mapped back into sRGB with culori's clampChroma.
//
// Neutral ladders (slate, tertiary) and white/black are intentionally NOT
// regenerated here — they are tuned by hand (slate is the dark-surface ladder).
//
// Usage:  node scripts/generate-ramps.mjs        (writes base.json)
//         node scripts/generate-ramps.mjs --check (prints, does not write)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { converter, formatHex, clampChroma } from 'culori';

const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(dir, '../tokens/theme/base.json');

// Brand seeds — the single source of truth per family. Each lands on step 500.
const SEEDS = {
  primary: '#006778',
  secondary: '#830051',
  accent: '#00c7b2',
  success: '#51a808',
  info: '#0082bb',
  warning: '#ff5800',
  error: '#dd0c0c',
  link: '#002f5f',
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const ANCHOR = 500; // step locked to the brand seed

// Chroma multiplier relative to the seed's chroma. MUST be 1.0 at the anchor so
// the anchor step reproduces the brand color exactly; bell-tapers to the ends.
const C_FACTOR = {
  50: 0.20, 100: 0.35, 200: 0.55, 300: 0.78, 400: 0.92, 500: 1.00,
  600: 0.98, 700: 0.94, 800: 0.86, 900: 0.68, 950: 0.55,
};
const L_LIGHT_END = 0.985; // target lightness at step 50
const L_DARK_END = 0.20; // target lightness at step 950

const oklch = converter('oklch');
const toHex = (c) => formatHex(clampChroma({ ...c, mode: 'oklch' }, 'oklch')) + 'ff';

function ramp(seedHex) {
  const b = oklch(seedHex);
  const bl = b.l;
  const bc = b.c || 0;
  const bh = b.h || 0;
  const idx = (s) => STEPS.indexOf(s);
  const iAnchor = idx(ANCHOR);
  const iLight = 0;
  const iDark = STEPS.length - 1;

  const out = {};
  for (const s of STEPS) {
    let L;
    if (s === ANCHOR) {
      L = bl;
    } else if (idx(s) < iAnchor) {
      const f = (iAnchor - idx(s)) / (iAnchor - iLight);
      L = bl + (L_LIGHT_END - bl) * f;
    } else {
      const f = (idx(s) - iAnchor) / (iDark - iAnchor);
      L = bl + (L_DARK_END - bl) * f;
    }
    out[String(s)] = { value: toHex({ mode: 'oklch', l: L, c: bc * C_FACTOR[s], h: bh }) };
  }
  return out;
}

const json = JSON.parse(fs.readFileSync(BASE, 'utf8'));
for (const [family, seed] of Object.entries(SEEDS)) {
  if (!json.theme[family]) throw new Error(`family "${family}" not found in base.json`);
  json.theme[family] = ramp(seed);
}

const out = JSON.stringify(json, null, 2) + '\n';
if (process.argv.includes('--check')) {
  for (const family of Object.keys(SEEDS)) {
    const r = json.theme[family];
    console.log(family.padEnd(10), STEPS.map((s) => r[String(s)].value.slice(0, 7)).join(' '));
  }
} else {
  fs.writeFileSync(BASE, out);
  console.log(`Wrote ${path.relative(process.cwd(), BASE)} — ${Object.keys(SEEDS).length} families, steps 50–950.`);
}
