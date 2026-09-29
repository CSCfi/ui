/**
 * Calendar-date helpers for `c-date-picker` (ADR-0057). Pure functions over
 * ISO `YYYY-MM-DD` strings: no local `Date` is ever constructed, so no
 * timezone can shift a day. Arithmetic goes through `Date.UTC`.
 */

import type { CDatePickerDisabledDate } from './CDatePicker.vue';

/** A calendar date split into its parts; `m` is 1–12. */
export interface CDatePickerYmd {
  d: number;
  m: number;
  y: number;
}

const DAY_MS = 86_400_000;

const pad = (n: number, width: number): string =>
  String(n).padStart(width, '0');

export const daysInMonth = (y: number, m: number): number =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

export const toIso = ({ d, m, y }: CDatePickerYmd): string =>
  `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`;

/** The parts of a well-formed, real ISO calendar date; `null` otherwise. */
export const fromIso = (iso: unknown): CDatePickerYmd | null => {
  if (typeof iso !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  if (!match) return null;

  const [y, m, d] = match.slice(1).map(Number);

  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;

  return { d, m, y };
};

export const isIso = (iso: unknown): iso is string => fromIso(iso) !== null;

const toUtc = (iso: string): number => {
  const { d, m, y } = fromIso(iso)!;

  return Date.UTC(y, m - 1, d);
};

const fromUtc = (ms: number): string => {
  const date = new Date(ms);

  return toIso({
    d: date.getUTCDate(),
    m: date.getUTCMonth() + 1,
    y: date.getUTCFullYear(),
  });
};

/** 0 = Sunday … 6 = Saturday, like `Date.getDay()`. */
export const dayOfWeek = (iso: string): number =>
  new Date(toUtc(iso)).getUTCDay();

export const addDays = (iso: string, days: number): string =>
  fromUtc(toUtc(iso) + days * DAY_MS);

/** Move by whole months, clamping the day to the target month's length. */
export const addMonths = (iso: string, months: number): string => {
  const { d, m, y } = fromIso(iso)!;

  const index = y * 12 + (m - 1) + months;

  const ty = Math.floor(index / 12);

  const tm = index - ty * 12 + 1;

  return toIso({ d: Math.min(d, daysInMonth(ty, tm)), m: tm, y: ty });
};

/** The ISO 8601 week number (weeks start on Monday; week 1 holds the year's first Thursday). */
export const isoWeek = (iso: string): number => {
  const thursday = addDays(iso, 3 - ((dayOfWeek(iso) + 6) % 7));

  const { y } = fromIso(thursday)!;

  return Math.floor((toUtc(thursday) - Date.UTC(y, 0, 1)) / (7 * DAY_MS)) + 1;
};

/**
 * The ISO week number of one grid row: the week of the row's Thursday,
 * which holds most of the row's days under any week start. It depends on
 * the row's dates alone, so a week split across two months carries the
 * same number in both. `''` for a row with no dates.
 */
export const rowWeek = (
  row: readonly (null | string)[],
  firstDayOfWeek: number,
): '' | number => {
  const column = row.findIndex(Boolean);

  if (column < 0) return '';

  const rowStart = addDays(row[column]!, -column);

  return isoWeek(addDays(rowStart, (4 - firstDayOfWeek + 7) % 7));
};

/** `YYYY-MM` of a date. */
export const monthOf = (iso: string): string => iso.slice(0, 7);

/** The first day of the month `YYYY-MM`. */
export const firstOfMonth = (month: string): string => `${month}-01`;

/** Today in the browser's local calendar, as ISO. */
export const todayIso = (): string => {
  const now = new Date();

  return toIso({
    d: now.getDate(),
    m: now.getMonth() + 1,
    y: now.getFullYear(),
  });
};

/**
 * The weeks of a month as rows of seven days starting on `firstDayOfWeek`
 * (0 = Sunday). Days of the neighbouring months are `null`. As many rows as
 * the month spans — four to six — so the calendar is as tall as its month.
 */
export const monthMatrix = (
  month: string,
  firstDayOfWeek: number,
): (null | string)[][] => {
  const first = firstOfMonth(month);

  const { m, y } = fromIso(first)!;

  const lead = (dayOfWeek(first) - firstDayOfWeek + 7) % 7;

  const total = daysInMonth(y, m);

  const rows: (null | string)[][] = [];

  for (let r = 0; r * 7 - lead < total; r++) {
    const row: (null | string)[] = [];

    for (let c = 0; c < 7; c++) {
      const day = r * 7 + c - lead + 1;

      row.push(day >= 1 && day <= total ? toIso({ d: day, m, y }) : null);
    }

    rows.push(row);
  }

  return rows;
};

// ---- format / parse ------------------------------------------------------

type Piece = { literal: string } | { token: Token };

type Token = 'd' | 'dd' | 'M' | 'MM' | 'yyyy';

const TOKEN = /yyyy|dd|d|MM|M/g;

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

/** The field order of a pattern, e.g. `['d', 'm', 'y']` for `dd.MM.yyyy`. */
const fieldOrder = (pieces: Piece[]): ('d' | 'm' | 'y')[] =>
  pieces.flatMap((p) =>
    'token' in p
      ? [p.token === 'yyyy' ? 'y' : p.token.startsWith('d') ? 'd' : 'm']
      : [],
  );

/**
 * Whether `pattern` is usable: exactly one day, one month and one year
 * token. Anything else falls back to the built-in pattern.
 */
export const isValidPattern = (pattern: string): boolean => {
  const order = fieldOrder(tokenize(pattern));

  return (
    order.length === 3 &&
    order.includes('d') &&
    order.includes('m') &&
    order.includes('y')
  );
};

export const formatDate = (iso: string, pattern: string): string => {
  const ymd = fromIso(iso);

  if (!ymd) return '';

  return tokenize(pattern)
    .map((p) => {
      if ('literal' in p) return p.literal;

      switch (p.token) {
        case 'd':
          return String(ymd.d);
        case 'dd':
          return pad(ymd.d, 2);
        case 'M':
          return String(ymd.m);
        case 'MM':
          return pad(ymd.m, 2);
        case 'yyyy':
          return pad(ymd.y, 4);
      }
    })
    .join('');
};

/**
 * Read typed text against a pattern (ADR-0057). Lenient: a day or month
 * takes one or two digits whatever its token, and any run of `.`, `/`, `-`
 * or spaces separates the fields; the year must have four digits. Returns
 * the ISO date, or `null` when the text names no real date. Text with no
 * separators at all is read by the pattern's digit widths (`ddMMyyyy`).
 */
export const parseDate = (text: string, pattern: string): null | string => {
  const trimmed = text.trim();

  if (!trimmed || !/^[\d./\-\s]+$/.test(trimmed)) return null;

  const pieces = tokenize(pattern);

  const order = fieldOrder(pieces);

  let parts = trimmed.split(/[./\-\s]+/).filter(Boolean);

  if (parts.length === 1) {
    // Separator-free text: only readable when every field has a fixed width.
    const widths = pieces.flatMap((p) =>
      'token' in p ? [p.token.length === 1 ? 0 : p.token.length] : [],
    );

    const total = widths.reduce((a, b) => a + b, 0);

    if (widths.includes(0) || trimmed.length !== total) return null;

    let at = 0;

    parts = widths.map((w) => {
      const part = trimmed.slice(at, at + w);

      at += w;

      return part;
    });
  }

  if (parts.length !== 3) return null;

  const fields: Partial<Record<'d' | 'm' | 'y', string>> = {};

  order.forEach((field, i) => {
    fields[field] = parts[i];
  });

  const { d = '', m = '', y = '' } = fields;

  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y))
    return null;

  const iso = toIso({ d: Number(d), m: Number(m), y: Number(y) });

  return isIso(iso) ? iso : null;
};

// ---- disabling -----------------------------------------------------------

export interface CDatePickerDisabling {
  isDateDisabled?: (iso: string) => boolean;
  list?: readonly CDatePickerDisabledDate[];
  max?: null | string;
  min?: null | string;
}

/** Outside `min` / `max`: unreachable, not merely unpickable. */
export const isOutOfRange = (
  iso: string,
  { max, min }: CDatePickerDisabling,
): boolean => (!!min && iso < min) || (!!max && iso > max);

/** Disabled when `min`/`max`, the list or the predicate says so (ADR-0057). */
export const isDisabledDate = (
  iso: string,
  rules: CDatePickerDisabling,
): boolean => {
  if (isOutOfRange(iso, rules)) return true;

  for (const entry of rules.list ?? []) {
    if (typeof entry === 'string') {
      if (entry === iso) return true;
    } else if (entry && iso >= entry.start && iso <= entry.end) {
      return true;
    }
  }

  return rules.isDateDisabled?.(iso) === true;
};

// ---- names (Intl fallback) -------------------------------------------------

/** The name texts `Intl` can supply for a language. */
export interface CDatePickerIntlNames {
  date: (iso: string) => string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
}

const intlCache = new Map<string, CDatePickerIntlNames | null>();

/**
 * Month and weekday names for `lang` from `Intl.DateTimeFormat` — the
 * fallback under `texts` (ADR-0057). Weekday arrays are indexed like
 * `Date.getDay()` (0 = Sunday). `null` without a language or without `Intl`.
 */
export const intlNames = (lang: string): CDatePickerIntlNames | null => {
  if (!lang || typeof Intl === 'undefined') return null;

  if (intlCache.has(lang)) return intlCache.get(lang)!;

  let names: CDatePickerIntlNames | null = null;

  try {
    const fmt = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(lang, { ...options, timeZone: 'UTC' });

    const monthLong = fmt({ month: 'long' });

    const monthShort = fmt({ month: 'short' });

    const dayLong = fmt({ weekday: 'long' });

    const dayShort = fmt({ weekday: 'short' });

    const full = fmt({
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    });

    // 2023-01-01 was a Sunday.
    const sunday = Date.UTC(2023, 0, 1);

    names = {
      date: (iso) => full.format(toUtc(iso)),
      months: Array.from({ length: 12 }, (_, i) =>
        monthLong.format(Date.UTC(2023, i, 1)),
      ),
      monthsShort: Array.from({ length: 12 }, (_, i) =>
        monthShort.format(Date.UTC(2023, i, 1)),
      ),
      weekdays: Array.from({ length: 7 }, (_, i) =>
        dayLong.format(sunday + i * DAY_MS),
      ),
      weekdaysShort: Array.from({ length: 7 }, (_, i) =>
        dayShort.format(sunday + i * DAY_MS),
      ),
    };
  } catch {
    names = null;
  }

  intlCache.set(lang, names);

  return names;
};
