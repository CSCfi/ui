/**
 * Time-of-day helpers for `c-time-picker` (ADR-0061). Pure functions over
 * ISO `HH:mm` strings on a 24-hour clock — no seconds, no date, no zone.
 * Arithmetic works in minutes since midnight.
 */

import type { MaskSlot } from '../../shared/inputMask';

/** The two period texts of a 12-hour format, as shown. */
export interface CTimePickerPeriods {
  am: string;
  pm: string;
}

/** `min` / `max` in minutes since midnight; `null` where unbounded. */
export interface CTimePickerBounds {
  max: null | number;
  min: null | number;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const isTime = (value: unknown): value is string =>
  typeof value === 'string' && TIME.test(value);

export const toMinutes = (time: string): number => {
  const [, h, m] = TIME.exec(time)!;

  return Number(h) * 60 + Number(m);
};

export const fromMinutes = (minutes: number): string =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** The current local time, as ISO. */
export const nowTime = (): string => {
  const now = new Date();

  return fromMinutes(now.getHours() * 60 + now.getMinutes());
};

// ---- the format pattern ---------------------------------------------------

type Token = 'a' | 'h' | 'H' | 'hh' | 'HH' | 'mm';

type Piece = { literal: string } | { token: Token };

const TOKEN = /HH|H|hh|h|mm|a/g;

const tokenize = (pattern: string): Piece[] => {
  const pieces: Piece[] = [];

  let last = 0;

  for (const match of pattern.matchAll(TOKEN)) {
    if (match.index > last)
      pieces.push({ literal: pattern.slice(last, match.index) });

    pieces.push({ token: match[0] as Token });
    last = match.index + match[0].length;
  }

  if (last < pattern.length) pieces.push({ literal: pattern.slice(last) });

  return pieces;
};

const isHour = (token: Token) => token.toLowerCase().startsWith('h');

/**
 * Whether `pattern` is usable: one hour token then `mm`, a literal between
 * them, and the period `a` exactly when the hour is 12-hour (`h`, `hh`) —
 * before or after the time. No other letters. Anything else falls back to
 * the built-in pattern.
 */
export const isValidPattern = (pattern: string): boolean => {
  const pieces = tokenize(pattern);

  const tokens = pieces.flatMap((p) => ('token' in p ? [p.token] : []));

  if (pieces.some((p) => 'literal' in p && /\p{L}/u.test(p.literal)))
    return false;

  const hours = tokens.filter(isHour);

  if (hours.length !== 1 || tokens.filter((t) => t === 'mm').length !== 1)
    return false;

  const twelve = isTwelveHour(pattern);

  const periods = tokens.filter((t) => t === 'a').length;

  if (periods !== (twelve ? 1 : 0)) return false;

  const clock = tokens.filter((t) => t !== 'a');

  if (clock[0] !== hours[0]) return false;

  // The hour and the minutes need a literal between them.
  const hourAt = pieces.findIndex((p) => 'token' in p && isHour(p.token));

  return 'literal' in (pieces[hourAt + 1] ?? {});
};

const hourToken = (pattern: string): Token | undefined =>
  tokenize(pattern)
    .flatMap((p) => ('token' in p && isHour(p.token) ? [p.token] : []))
    .at(0);

/** Whether a valid pattern shows a 12-hour clock with a period. */
export const isTwelveHour = (pattern: string): boolean => {
  const token = hourToken(pattern);

  return token === 'h' || token === 'hh';
};

/** Whether a valid pattern pads the hour to two digits. */
export const padsHour = (pattern: string): boolean =>
  hourToken(pattern)?.length === 2;

/** The hour as its column row shows it under `pattern`: `0`–`23`, or `12`, `1`–`11`. */
export const hourLabel = (hour24: number, pattern: string): string => {
  const hour = isTwelveHour(pattern) ? hour24 % 12 || 12 : hour24;

  return padsHour(pattern) ? pad(hour) : String(hour);
};

export const formatTime = (
  time: string,
  pattern: string,
  periods: CTimePickerPeriods,
): string => {
  if (!isTime(time)) return '';

  const minutes = toMinutes(time);

  const h = Math.floor(minutes / 60);

  const m = minutes % 60;

  return tokenize(pattern)
    .map((p) => {
      if ('literal' in p) return p.literal;

      switch (p.token) {
        case 'a':
          return h < 12 ? periods.am : periods.pm;
        case 'h':
          return String(h % 12 || 12);
        case 'H':
          return String(h);
        case 'hh':
          return pad(h % 12 || 12);
        case 'HH':
          return pad(h);
        case 'mm':
          return pad(m);
      }
    })
    .join('');
};

const lettersOf = (text: string) =>
  text.toLocaleLowerCase().replace(/[^\p{L}]/gu, '');

/**
 * Which period a typed run of letters names: the resolved texts first (by
 * their letters, so `ip` names `ip.`), then English `am` / `pm`. `null`
 * when it names neither or both.
 */
const readPeriod = (
  run: string,
  periods: CTimePickerPeriods,
): 'am' | 'pm' | null => {
  const typed = run.toLocaleLowerCase();

  for (const names of [
    { am: lettersOf(periods.am), pm: lettersOf(periods.pm) },
    { am: 'am', pm: 'pm' },
  ]) {
    const am = !!names.am && names.am.startsWith(typed);

    const pm = !!names.pm && names.pm.startsWith(typed);

    if (am !== pm) return am ? 'am' : 'pm';
  }

  return null;
};

/**
 * Read typed text as a time (ADR-0061). Lenient: any run of `.`, `:` or
 * spaces separates the hour from the minutes; a bare hour reads as on the
 * hour (`9` → `09:00`); three or four digits split as hour and minutes
 * (`930` → `09:30`); a minute of one digit is that minute (`9.3` →
 * `09:03`). A period — the resolved AM/PM texts or English `a` / `p` —
 * makes the hour 12-hour whatever the pattern; a 12-hour pattern also
 * takes a 24-hour time, and reads an hour without a period as AM. Returns
 * the ISO time, or `null`.
 */
export const parseTime = (
  text: string,
  pattern: string,
  periods: CTimePickerPeriods,
): null | string => {
  const trimmed = text.trim();

  if (!trimmed) return null;

  const [run, ...more] = trimmed.match(/\p{L}+/gu) ?? [];

  if (more.length) return null;

  const period = run === undefined ? null : readPeriod(run, periods);

  if (run !== undefined && !period) return null;

  const clock = trimmed.replace(/\p{L}+/gu, ' ').trim();

  if (!/^[\d.:\s]+$/.test(clock)) return null;

  let parts = clock.split(/[.:\s]+/).filter(Boolean);

  if (parts.length === 1) {
    const [digits] = parts;

    if (digits.length <= 2) parts = [digits, '0'];
    else if (digits.length <= 4)
      parts = [digits.slice(0, -2), digits.slice(-2)];
    else return null;
  }

  if (parts.length !== 2) return null;

  const [hText, mText] = parts;

  if (!/^\d{1,2}$/.test(hText) || !/^\d{1,2}$/.test(mText)) return null;

  let h = Number(hText);

  const m = Number(mText);

  if (m > 59) return null;

  if (period) {
    if (h < 1 || h > 12) return null;

    h = (h % 12) + (period === 'pm' ? 12 : 0);
  } else if (isTwelveHour(pattern)) {
    // No period: a 12-hour hour reads as AM, a 24-hour one as itself.
    if (h > 23) return null;

    if (h === 12) h = 0;
  } else if (h > 23) {
    return null;
  }

  return fromMinutes(h * 60 + m);
};

const SEPARATORS = '.: ';

const isDigit = (ch: string) => ch >= '0' && ch <= '9';

/**
 * The input mask typing follows under a pattern (ADR-0061, ADR-0059): the
 * hour and the minutes take one or two digits, closing early on a typed
 * separator or on a first digit no two-digit value starts with (an hour
 * 3–9, 2–9 on a 12-hour clock; a minute 6–9); the period is a word slot
 * over the resolved AM/PM texts, so `p` shows the whole PM text. A
 * separator of the pattern also accepts any of `. : space` typed in its
 * place and shows as the pattern's own.
 */
export const compileTimeMask = (
  pattern: string,
  periods: CTimePickerPeriods,
): MaskSlot[] => {
  const highestHour = isTwelveHour(pattern) ? '1' : '2';

  return tokenize(pattern).flatMap((p): MaskSlot[] => {
    if ('literal' in p) {
      return Array.from(p.literal, (text) => ({
        aliases: SEPARATORS.includes(text) ? SEPARATORS : undefined,
        kind: 'literal',
        text,
      }));
    }

    if (p.token === 'a')
      return [{ kind: 'word', words: [periods.am, periods.pm] }];

    const highest = p.token === 'mm' ? '5' : highestHour;

    return [
      {
        accepts: isDigit,
        closesAfter: (value) => value.length === 1 && value > highest,
        kind: 'token',
        max: 2,
        min: 1,
      },
    ];
  });
};

// ---- bounds ------------------------------------------------------------------

/**
 * `min` / `max` read as minutes. A bound that is not an ISO time is
 * unbounded; `min` after `max` is invalid — `null` — not an overnight wrap.
 */
export const readBounds = (
  min: unknown,
  max: unknown,
): CTimePickerBounds | null => {
  const bounds = {
    max: isTime(max) ? toMinutes(max) : null,
    min: isTime(min) ? toMinutes(min) : null,
  };

  if (bounds.min !== null && bounds.max !== null && bounds.min > bounds.max)
    return null;

  return bounds;
};

export const inBounds = (minutes: number, b: CTimePickerBounds): boolean =>
  (b.min === null || minutes >= b.min) && (b.max === null || minutes <= b.max);

export const clampToBounds = (
  minutes: number,
  b: CTimePickerBounds,
): number => {
  if (b.min !== null && minutes < b.min) return b.min;

  if (b.max !== null && minutes > b.max) return b.max;

  return minutes;
};

/** Whether no minute of the hour (0–23) is inside the bounds. */
export const hourDisabled = (hour: number, b: CTimePickerBounds): boolean =>
  (b.min !== null && hour * 60 + 59 < b.min) ||
  (b.max !== null && hour * 60 > b.max);

/** Whether no minute of the half day is inside the bounds. */
export const periodDisabled = (
  period: 'am' | 'pm',
  b: CTimePickerBounds,
): boolean => {
  const from = period === 'am' ? 0 : 720;

  return (
    (b.min !== null && from + 719 < b.min) || (b.max !== null && from > b.max)
  );
};

// ---- column rows -----------------------------------------------------------

/** The hour column's hours (0–23) in row order: `0…23`, or `1…11, 12` of one half day. */
export const hourRows = (twelve: boolean, pm = false): number[] =>
  twelve
    ? Array.from({ length: 12 }, (_, i) => ((i + 1) % 12) + (pm ? 12 : 0))
    : Array.from({ length: 24 }, (_, i) => i);

/**
 * The minute column's minutes: every `step` from 0, plus `current` sorted in
 * when it is off the step (ADR-0061: a step shapes the column, never the
 * value). A step that is not a positive integer is 1.
 */
export const minuteRows = (step: number, current: null | number): number[] => {
  const s = Number.isInteger(step) && step > 0 && step < 60 ? step : 1;

  const rows = Array.from({ length: Math.ceil(60 / s) }, (_, i) => i * s);

  if (current !== null && !rows.includes(current)) {
    rows.push(current);
    rows.sort((a, b) => a - b);
  }

  return rows;
};

/** The minute row nearest `minute` on the step, never past the last row. */
export const roundToStep = (minute: number, step: number): number => {
  const rows = minuteRows(step, null);

  return rows.reduce((best, row) =>
    Math.abs(row - minute) < Math.abs(best - minute) ? row : best,
  );
};

// ---- names (Intl fallback) -------------------------------------------------

const intlCache = new Map<string, CTimePickerPeriods | null>();

/**
 * The AM/PM texts for `lang` from `Intl.DateTimeFormat`'s `dayPeriod` — the
 * fallback under `texts` (ADR-0061). `null` without a language or `Intl`.
 */
export const intlPeriods = (lang: string): CTimePickerPeriods | null => {
  if (!lang || typeof Intl === 'undefined') return null;

  if (intlCache.has(lang)) return intlCache.get(lang)!;

  let periods: CTimePickerPeriods | null = null;

  try {
    const fmt = new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    });

    const periodAt = (hour: number) =>
      fmt
        .formatToParts(Date.UTC(2023, 0, 1, hour))
        .find((part) => part.type === 'dayPeriod')?.value;

    const am = periodAt(9);

    const pm = periodAt(15);

    periods = am && pm && am !== pm ? { am, pm } : null;
  } catch {
    periods = null;
  }

  intlCache.set(lang, periods);

  return periods;
};
