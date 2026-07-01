// Shared, framework-agnostic color-ramp core.
//
// Imported by BOTH the build-time generator (scripts/generate-ramps.mjs) and the
// runtime theming API (src/theme/applyTheme.ts). Because both entry points run
// this exact code, a consumer-supplied brand seed produces a ramp byte-for-byte
// identical to the library's baked-in ones. See ADR-0011.
//
// Each ramp is derived from a single brand seed in a perceptual space (OKLCH).
// The seed is anchored at step 500 — so 500 reproduces the brand color exactly
// and 600–950 give progressively darker shades below it. Lightness follows a
// perceptual curve; chroma follows a bell curve peaking in the mids (the "pop"
// lever), then is gamut-mapped back into sRGB with culori's clampChroma.
import { clampChroma, converter, formatHex } from 'culori';

// Brand seeds — the single source of truth per family. Each lands on step 500.
export const DEFAULT_SEEDS = {
  accent: '#00c7b2',
  error: '#dd0c0c',
  info: '#0082bb',
  link: '#002f5f',
  primary: '#006778',
  secondary: '#830051',
  success: '#51a808',
  warning: '#ff5800',
};

// The chromatic families a consumer may re-seed (order = DEFAULT_SEEDS order).
export const FAMILIES = Object.keys(DEFAULT_SEEDS);

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const ANCHOR = 500; // step locked to the brand seed

// Chroma multiplier relative to the seed's chroma. MUST be 1.0 at the anchor so
// the anchor step reproduces the brand color exactly; bell-tapers to the ends.
const C_FACTOR = {
  100: 0.35,
  200: 0.55,
  300: 0.78,
  400: 0.92,
  50: 0.2,
  500: 1.0,
  600: 0.98,
  700: 0.94,
  800: 0.86,
  900: 0.68,
  950: 0.55,
};

const L_LIGHT_END = 0.985; // target lightness at step 50

const L_DARK_END = 0.2; // target lightness at step 950

const oklch = converter('oklch');

const toHex = (c) =>
  `${formatHex(clampChroma({ ...c, mode: 'oklch' }, 'oklch'))}ff`;

/**
 * Generate a full 50–950 perceptual ramp from a single step-500 seed.
 *
 * @param {string} seedHex any CSS color string culori can parse
 * @returns {Record<string, string>} `{ '50': '#rrggbbff', … '950': … }`
 * @throws if the color cannot be parsed
 */
export function ramp(seedHex) {
  const b = oklch(seedHex);

  if (!b) throw new Error(`Unparseable color: ${JSON.stringify(seedHex)}`);

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

    out[String(s)] = toHex({ c: bc * C_FACTOR[s], h: bh, l: L, mode: 'oklch' });
  }

  return out;
}

const rgbTriple = (hex) =>
  `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ` +
  `${parseInt(hex.slice(5, 7), 16)}`;

/**
 * The `--c-<family>-*` custom-property map for one family from a seed: every
 * step plus the `--c-<family>-rgb` compositing triple (derived from step 500),
 * ordered to mirror the style-dictionary output (`-rgb` right after `-500`).
 *
 * @param {string} family
 * @param {string} seedHex
 * @returns {Record<string, string>}
 */
export function familyVars(family, seedHex) {
  const r = ramp(seedHex);

  const vars = {};

  for (const s of STEPS) {
    vars[`--c-${family}-${s}`] = r[String(s)];

    if (s === ANCHOR) vars[`--c-${family}-rgb`] = rgbTriple(r['500']);
  }

  return vars;
}
