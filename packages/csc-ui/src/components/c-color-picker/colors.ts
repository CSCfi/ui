/**
 * Colour helpers for `c-color-picker` (ADR-0069). A colour is four bytes —
 * 8-bit sRGB and 8-bit alpha — and each **notation** spells them at the
 * fewest decimals that read back to the same bytes. Text outside sRGB is
 * gamut-mapped by clamping chroma at the same OKLCH lightness and hue, as the
 * ramp core does for seeds (ADR-0011).
 */
import { clampChroma, type Color, converter, parse } from 'culori';

/** One editable channel of the **channel editor**. */
export type ColorChannel = 'a' | 'b' | 'c' | 'g' | 'h' | 'l' | 'r';

/** The CSS syntax a colour is spelled in (CONTEXT.md "Notation"). */
export type ColorNotation = 'hex' | 'oklch' | 'rgb';

/** The panel's position: hue 0–360, saturation and brightness 0–100, unrounded. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** A colour as the picker holds it: 8-bit sRGB channels and 8-bit alpha. */
export interface Rgba {
  a: number;
  b: number;
  g: number;
  r: number;
}

const toRgb = converter('rgb');

const toOklch = converter('oklch');

const toHsvMode = converter('hsv');

const BARE_HEX = /^(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

const toByte = (unit: number): number => Math.round(clamp(unit, 0, 1) * 255);

// A channel culori reports; an absent (`none`) or undefined hue is `undefined`.
const read = (color: Color, key: string): number | undefined => {
  const v = color[key];

  return typeof v === 'number' && !Number.isNaN(v) ? v : undefined;
};

const unit = (c: Rgba): Color => ({
  b: c.b / 255,
  g: c.g / 255,
  mode: 'rgb',
  r: c.r / 255,
});

// Whether every channel rounds onto a byte: in the 8-bit model that is in
// gamut, so a spelling a rounding hair outside sRGB is not chroma-clamped.
const roundsToBytes = (rgb: Color): boolean =>
  (['r', 'g', 'b'] as const).every((key) => {
    const v = read(rgb, key) ?? 0;

    return v >= -0.5 / 255 && v < 1 + 0.5 / 255;
  });

/** A parsed colour as bytes: mapped into sRGB, opaque unless `alpha`. */
const toBytes = (color: Color, alpha: boolean): null | Rgba => {
  const direct = toRgb(color);

  const rgb =
    direct && roundsToBytes(direct)
      ? direct
      : toRgb(clampChroma(color, 'oklch'));

  if (!rgb) return null;

  return {
    a: alpha ? toByte(rgb.alpha ?? 1) : 255,
    b: toByte(read(rgb, 'b') ?? 0),
    g: toByte(read(rgb, 'g') ?? 0),
    r: toByte(read(rgb, 'r') ?? 0),
  };
};

/**
 * Text as a colour — any CSS colour culori parses, or a hex without its `#`
 * — gamut-mapped into sRGB; `null` when it names none. Without `alpha` the
 * colour comes back opaque.
 */
export const readColor = (text: string, alpha: boolean): null | Rgba => {
  const trimmed = text.trim();

  if (!trimmed) return null;

  const parsed = parse(BARE_HEX.test(trimmed) ? `#${trimmed}` : trimmed);

  return parsed ? toBytes(parsed, alpha) : null;
};

/** Whether a value is a string naming a colour. */
export const isColor = (value: unknown): value is string =>
  typeof value === 'string' && readColor(value, true) !== null;

export const sameColor = (a: null | Rgba, b: null | Rgba): boolean =>
  !!a && !!b && a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;

// ---- spelling -------------------------------------------------------------

// `n` at `dp` decimals with trailing zeros trimmed (`0.6200` → `0.62`).
const fixed = (n: number, dp: number): string => {
  const text = n.toFixed(dp);

  const trimmed = dp ? text.replace(/\.?0+$/, '') : text;

  return trimmed === '-0' ? '0' : trimmed;
};

// The fewest decimals (0–3) whose alpha reads back as the same byte.
const alphaText = (a: number): string => {
  for (let dp = 0; dp < 3; dp++) {
    const text = fixed(a / 255, dp);

    if (toByte(Number(text)) === a) return text;
  }

  return fixed(a / 255, 3);
};

const alphaSuffix = (c: Rgba): string =>
  c.a < 255 ? ` / ${alphaText(c.a)}` : '';

const hex2 = (n: number): string => n.toString(16).padStart(2, '0');

/** The L, C and H texts of a colour's `oklch()` spelling. */
export interface OklchParts {
  c: string;
  h: string;
  l: string;
}

const OKLCH_PRECISION = [
  { c: 4, h: 2, l: 4 },
  { c: 5, h: 3, l: 5 },
  { c: 6, h: 4, l: 6 },
];

/**
 * The fewest decimals per channel — L and C up to four, H up to two — whose
 * `oklch()` reads back to the same sRGB bytes (ADR-0069). A colour with no
 * chroma spells its hue `0`.
 */
export const oklchParts = (c: Rgba): OklchParts => {
  const exact = toOklch(unit(c))!;

  const value = {
    c: read(exact, 'c') ?? 0,
    h: read(exact, 'h') ?? 0,
    l: read(exact, 'l') ?? 0,
  };

  const opaque = { ...c, a: 255 };

  const fits = (p: OklchParts) =>
    sameColor(readColor(`oklch(${p.l} ${p.c} ${p.h})`, false), opaque);

  const spell = (dp: { c: number; h: number; l: number }): OklchParts => {
    const chroma = fixed(value.c, dp.c);

    return {
      c: chroma,
      h: Number(chroma) === 0 ? '0' : fixed(value.h, dp.h),
      l: fixed(value.l, dp.l),
    };
  };

  const base =
    OKLCH_PRECISION.find((dp) => fits(spell(dp))) ?? OKLCH_PRECISION[2];

  const dp = { ...base };

  // Fewer decimals channel by channel — hue first, as it matters least.
  for (const key of ['h', 'c', 'l'] as const) {
    for (let d = 0; d < base[key]; d++) {
      if (fits(spell({ ...dp, [key]: d }))) {
        dp[key] = d;
        break;
      }
    }
  }

  return spell(dp);
};

/** A colour in a notation: `#rrggbb[aa]`, `rgb(R G B[ / a])`, `oklch(L C H[ / a])`. */
export const spell = (c: Rgba, notation: ColorNotation): string => {
  if (notation === 'rgb') return `rgb(${c.r} ${c.g} ${c.b}${alphaSuffix(c)})`;

  if (notation === 'oklch') {
    const p = oklchParts(c);

    return `oklch(${p.l} ${p.c} ${p.h}${alphaSuffix(c)})`;
  }

  return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 255 ? hex2(c.a) : ''}`;
};

/** A CSS colour to paint with: the hex spelling, alpha included. */
export const toCss = (c: Rgba): string => spell(c, 'hex');

// ---- the panel position ---------------------------------------------------

/** A panel position as bytes, with the given alpha byte. */
export const fromHsv = (hsv: Hsv, a: number): Rgba => {
  const rgb = toRgb({ h: hsv.h, mode: 'hsv', s: hsv.s / 100, v: hsv.v / 100 })!;

  return {
    a,
    b: toByte(read(rgb, 'b') ?? 0),
    g: toByte(read(rgb, 'g') ?? 0),
    r: toByte(read(rgb, 'r') ?? 0),
  };
};

/**
 * The panel position of a colour. A position that already lands on the same
 * bytes is kept, so a step the bytes cannot show leaves the thumb where it
 * went; a grey keeps the previous hue, black the previous saturation too.
 */
export const toHsv = (c: Rgba, prev: Hsv | null = null): Hsv => {
  if (prev && sameColor(fromHsv(prev, c.a), c)) return prev;

  const hsv = toHsvMode(unit(c))!;

  const v = (read(hsv, 'v') ?? 0) * 100;

  const s = (read(hsv, 's') ?? 0) * 100;

  const h = read(hsv, 'h');

  return {
    h: h === undefined || s === 0 ? (prev?.h ?? 0) : h,
    s: v === 0 && prev ? prev.s : s,
    v,
  };
};

// ---- the channel editor ---------------------------------------------------

/** Each channel's range and nudge step; Shift nudges ten steps. */
export const CHANNEL_RANGE: Record<
  ColorChannel,
  { max: number; min: number; step: number }
> = {
  a: { max: 100, min: 0, step: 1 },
  b: { max: 255, min: 0, step: 1 },
  c: { max: 0.4, min: 0, step: 0.01 },
  g: { max: 255, min: 0, step: 1 },
  h: { max: 360, min: 0, step: 1 },
  l: { max: 1, min: 0, step: 0.01 },
  r: { max: 255, min: 0, step: 1 },
};

/** The channels a notation's editor shows, alpha aside. */
export const NOTATION_CHANNELS: Record<
  Exclude<ColorNotation, 'hex'>,
  ColorChannel[]
> = {
  oklch: ['l', 'c', 'h'],
  rgb: ['r', 'g', 'b'],
};

/** A channel's text in the editor — what the value spells for it. */
export const channelText = (c: Rgba, key: ColorChannel): string => {
  if (key === 'a') return String(Math.round((c.a / 255) * 100));

  if (key === 'l' || key === 'c' || key === 'h') return oklchParts(c)[key];

  return String(c[key]);
};

/** The colour with one channel set, clamped to its range (and mapped into sRGB). */
export const withChannel = (c: Rgba, key: ColorChannel, n: number): Rgba => {
  const { max, min } = CHANNEL_RANGE[key];

  const v = clamp(n, min, max);

  if (key === 'a') return { ...c, a: Math.round((v / 100) * 255) };

  if (key === 'r' || key === 'g' || key === 'b')
    return { ...c, [key]: Math.round(v) };

  const p = { ...oklchParts(c), [key]: String(v) };

  const next = readColor(`oklch(${p.l} ${p.c} ${p.h})`, false)!;

  return { ...next, a: c.a };
};

/** A typed channel text read into the colour; `null` when it is no number. */
export const readChannel = (
  c: Rgba,
  key: ColorChannel,
  text: string,
): null | Rgba => {
  const trimmed = text.trim().replace(',', '.').replace(/%$/, '');

  const n = trimmed === '' ? Number.NaN : Number(trimmed);

  return Number.isFinite(n) ? withChannel(c, key, n) : null;
};

/** The colour one nudge (or ten, `big`) away along a channel. */
export const nudgeChannel = (
  c: Rgba,
  key: ColorChannel,
  direction: -1 | 1,
  big = false,
): Rgba => {
  const { step } = CHANNEL_RANGE[key];

  const n = Number(channelText(c, key)) + direction * step * (big ? 10 : 1);

  return withChannel(c, key, Math.round(n * 1e4) / 1e4);
};
