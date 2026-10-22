/**
 * The number core behind `c-number-field` (ADR-0060): the page language's
 * separators, conforming typed text to grouped digits with its caret, and
 * reading and formatting the number. Pure — no DOM, no component state.
 */

import type { ConformResult } from '../../shared/inputMask';

export interface CNumberFieldConform extends ConformResult {
  /** The number the text reads as; `null` when it holds no digit. */
  value: null | number;
}

export interface CNumberFieldFormat extends CNumberFieldSeparators {
  /** Whether a leading minus is kept (`false` when `min` ≥ 0). */
  allowNegative: boolean;

  /** The most fraction digits; `0` for an integer field. */
  decimals: number;
}

export interface CNumberFieldSeparators {
  decimal: string;
  group: string;
}

/** A non-breaking space and a comma: what a page without `lang` gets. */
const FALLBACK: CNumberFieldSeparators = { decimal: ',', group: ' ' };

/** More integer digits than this stop being exact as a JS number. */
export const MAX_INTEGER_DIGITS = 15;

const cache = new Map<string, CNumberFieldSeparators>();

/**
 * The group and decimal separators `Intl.NumberFormat` uses for `lang`
 * (`fi` → non-breaking space and `,`; `en` → `,` and `.`), else the fallback.
 */
export const numberSeparators = (lang: string): CNumberFieldSeparators => {
  if (!lang || typeof Intl === 'undefined') return FALLBACK;

  const cached = cache.get(lang);

  if (cached) return cached;

  let found = FALLBACK;

  try {
    const parts = new Intl.NumberFormat(lang).formatToParts(1234567.5);

    found = {
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? ',',
      group: parts.find((p) => p.type === 'group')?.value ?? ' ',
    };
  } catch {
    // An unknown language tag keeps the fallback.
  }

  cache.set(lang, found);

  return found;
};

const isDigit = (ch: string) => ch >= '0' && ch <= '9';

const isMinus = (ch: string) => ch === '-' || ch === '−';

/**
 * The index of the character read as the decimal separator, or `-1`. The
 * decimal separator itself, and `.` or `,` unless it is the group separator,
 * count as one. When both `.` and `,` appear, a pasted `1,234.56` or
 * `1.234,56` reads the last as the decimal when the other only ever precedes
 * a run of exactly three digits; otherwise the first wins.
 */
const decimalIndex = (text: string, format: CNumberFieldFormat): number => {
  const candidates: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (
      ch === format.decimal ||
      ((ch === '.' || ch === ',') && ch !== format.group)
    )
      candidates.push(i);
  }

  if (candidates.length === 0) return -1;

  const last = candidates.at(-1)!;

  const lastChar = text[last];

  const others = candidates.filter((i) => text[i] !== lastChar);

  if (
    others.length > 0 &&
    candidates.filter((i) => text[i] === lastChar).length === 1 &&
    others.every((i) => /^\d{3}(?!\d)/.test(text.slice(i + 1)))
  )
    return last;

  return candidates[0];
};

const group = (digits: string, separator: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

/**
 * Conform typed text to the number format: keep a leading minus, digits
 * and one decimal separator (up to `decimals` fraction digits and
 * `MAX_INTEGER_DIGITS` integer digits, leading zeros dropped), and regroup
 * the integer digits in threes. The caret keeps its place among the typed
 * characters; group separators are inserted ones (`tokenAt` false).
 */
export const conformNumber = (
  text: string,
  caret: number,
  format: CNumberFieldFormat,
): CNumberFieldConform => {
  const decimalAt = format.decimals > 0 ? decimalIndex(text, format) : -1;

  let negative = false;

  let int = '';

  let frac = '';

  let hasDecimal = false;

  // Typed characters kept before the caret, counted on the unstripped int.
  let before = 0;

  // Integer digits kept before the caret, so stripped leading zeros can be
  // subtracted below.
  let intBefore = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    let kept = false;

    if (isMinus(ch)) {
      if (
        format.allowNegative &&
        !negative &&
        int === '' &&
        !hasDecimal &&
        frac === ''
      ) {
        negative = kept = true;
      }
    } else if (i === decimalAt) {
      hasDecimal = kept = true;
    } else if (isDigit(ch)) {
      if (hasDecimal) {
        if (frac.length < format.decimals) {
          frac += ch;
          kept = true;
        }
      } else if (int.replace(/^0+(?=\d)/, '').length < MAX_INTEGER_DIGITS) {
        int += ch;
        kept = true;

        if (i < caret) intBefore++;
      }
    }

    if (kept && i < caret) before++;
  }

  // Leading zeros go ("007" → "7", "00" → "0"); the ones before the caret
  // take the caret with them.
  const stripped = int.replace(/^0+(?=\d)/, '');

  before -= Math.min(int.length - stripped.length, intBefore);
  int = stripped;

  const grouped = group(int, format.group);

  const out =
    (negative ? '-' : '') + grouped + (hasDecimal ? format.decimal : '') + frac;

  const tokenAt: boolean[] = [];

  for (let i = 0; i < out.length; i++) {
    const inGroup =
      i >= (negative ? 1 : 0) &&
      i < (negative ? 1 : 0) + grouped.length &&
      !isDigit(out[i]);

    tokenAt.push(!inGroup);
  }

  // Place the caret after the `before`-th typed character.
  let mapped = 0;

  for (let seen = 0; mapped < out.length && seen < before; mapped++)
    if (tokenAt[mapped]) seen++;

  const digits = int + frac;

  const value =
    digits === ''
      ? null
      : Number(`${negative ? '-' : ''}${int || '0'}.${frac || '0'}`) || 0;

  return { caret: mapped, text: out, tokenAt, value };
};

/** The number `text` reads as under `format`; `null` when it holds no digit. */
export const readNumber = (
  text: string,
  format: CNumberFieldFormat,
): null | number => conformNumber(text, 0, format).value;

/**
 * Display a number: rounded to `decimals`, grouped, with trailing fraction
 * zeros kept only when `fixed`. A non-finite value or `null` shows as empty.
 */
export const formatNumber = (
  value: null | number | undefined,
  format: CNumberFieldFormat,
  fixed = false,
): string => {
  if (value === null || value === undefined || !Number.isFinite(value))
    return '';

  let text = value.toFixed(format.decimals);

  if (!fixed && text.includes('.')) text = text.replace(/\.?0+$/, '');

  const negative = text.startsWith('-') && Number(text) !== 0;

  const [int, frac] = text.replace('-', '').split('.');

  return (
    (negative ? '-' : '') +
    group(int, format.group) +
    (frac === undefined ? '' : format.decimal + frac)
  );
};

export interface CNumberFieldStepOptions {
  /** The most fraction digits; a stepped number is rounded to them. */
  decimals: number;
  max: null | number;
  min: null | number;

  /** The spacing of the grid, counted from `min` (or `0`); not a positive number reads as `1`. */
  step: number;
}

/** The largest integer part the field holds: `MAX_INTEGER_DIGITS` nines. */
const LIMIT = 10 ** MAX_INTEGER_DIGITS - 1;

/** Whether `x` is within float noise of a whole number. */
const nearInteger = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

/**
 * Move a number `count` points along its step grid (ADR-0064): to the next
 * point of `base + k·step` above it (`direction` 1) or below it (-1), where
 * `base` is `min`, or `0`. The result is rounded to `decimals` and held in
 * `min`–`max`: a move that would pass a bound lands on it, and a number at or
 * beyond the bound in `direction` stays put. An empty field counts from `0`.
 */
export const stepNumber = (
  current: null | number,
  direction: -1 | 1,
  options: CNumberFieldStepOptions,
  count = 1,
): null | number => {
  const step =
    Number.isFinite(options.step) && options.step > 0 ? options.step : 1;

  const min = Math.max(options.min ?? -LIMIT, -LIMIT);

  const max = Math.min(options.max ?? LIMIT, LIMIT);

  if (current !== null) {
    if (direction > 0 && current >= max) return current;

    if (direction < 0 && current <= min) return current;
  }

  const base = options.min ?? 0;

  const index = ((current ?? 0) - base) / step;

  const from = nearInteger(index) ? Math.round(index) : index;

  const k = direction > 0 ? Math.floor(from) + count : Math.ceil(from) - count;

  const rounded = Number(
    (base + k * step).toFixed(Math.max(0, Math.min(options.decimals, 100))),
  );

  return Math.min(max, Math.max(min, rounded)) + 0;
};
