/**
 * The calendar-date helpers behind c-date-picker (ADR-0057): ISO parts,
 * arithmetic, the month grid, ISO weeks, the numeric format pattern and its
 * lenient parser, and the disabling rules — and their month counterparts
 * for `type="month"` (ADR-0063).
 */
import { describe, expect, it } from 'vitest';

import { conformMask } from '../../shared/inputMask';
import {
  addDays,
  addMonths,
  compileDateMask,
  dayOfWeek,
  formatDate,
  formatMonth,
  fromIso,
  isDisabledDate,
  isDisabledMonth,
  isIsoMonth,
  isMonthDisabledEverywhere,
  isoWeek,
  isValidMonthPattern,
  isValidPattern,
  monthMatrix,
  monthPattern,
  parseDate,
  parseMonth,
  rowWeek,
  toMonth,
} from './dates';

describe('ISO parts', () => {
  it.each([
    ['2026-09-28', { d: 28, m: 9, y: 2026 }],
    ['2024-02-29', { d: 29, m: 2, y: 2024 }],
    ['2026-02-29', null],
    ['2026-13-01', null],
    ['2026-9-28', null],
    ['', null],
    [null, null],
  ])('%s → %j', (iso, parts) => {
    expect(fromIso(iso)).toEqual(parts);
  });
});

describe('arithmetic', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-09-28', 7)).toBe('2026-10-05');
  });

  it('adds months, clamping the day', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
    expect(addMonths('2026-09-28', 12)).toBe('2027-09-28');
  });

  it('reads the weekday like Date.getDay()', () => {
    expect(dayOfWeek('2026-09-28')).toBe(1);
    expect(dayOfWeek('2023-01-01')).toBe(0);
  });

  it.each([
    ['2026-01-01', 1],
    ['2026-09-28', 40],
    ['2027-01-01', 53],
    ['2024-12-30', 1],
    ['2021-01-03', 53],
  ])('ISO week of %s is %i', (iso, week) => {
    expect(isoWeek(iso)).toBe(week);
  });
});

describe('monthMatrix', () => {
  it('starts the week on the given day', () => {
    const monday = monthMatrix('2026-09', 1);

    // 1 September 2026 is a Tuesday.
    expect(monday[0]).toEqual([
      null,
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
    ]);

    const sunday = monthMatrix('2026-09', 0);

    expect(sunday[0].slice(0, 3)).toEqual([null, null, '2026-09-01']);
    expect(sunday.flat().filter(Boolean)).toHaveLength(30);
  });

  it.each([
    // February 2027 starts on a Monday: exactly four weeks.
    ['2027-02', 1, 4],
    ['2026-09', 1, 5],
    // August 2026 starts on a Saturday and has 31 days.
    ['2026-08', 1, 6],
    ['2026-08', 6, 5],
  ])(
    '%s from weekday %i spans %i rows, none of them empty',
    (month, first, rows) => {
      const matrix = monthMatrix(month, first);

      expect(matrix).toHaveLength(rows);
      expect(matrix.every((row) => row.some(Boolean))).toBe(true);
    },
  );
});

describe('rowWeek', () => {
  const numbers = (month: string, firstDayOfWeek: number) =>
    monthMatrix(month, firstDayOfWeek)
      .map((row) => rowWeek(row, firstDayOfWeek))
      .filter((n) => n !== '');

  it('numbers Monday-start rows by their ISO week', () => {
    expect(numbers('2026-09', 1)).toEqual([36, 37, 38, 39, 40]);
  });

  it('numbers other starts by the week of the row’s Thursday, never twice', () => {
    // Sunday start: the row Sun 30 Aug – Sat 5 Sep is mostly ISO week 36.
    expect(numbers('2026-09', 0)).toEqual([36, 37, 38, 39, 40]);
    // Saturday start: the row Sat 31 Oct – Fri 6 Nov has its Thursday in week 45.
    expect(numbers('2026-11', 6)).toEqual([45, 46, 47, 48, 49]);
  });

  it.each([0, 1, 3, 6])(
    'a week split across months keeps one number (first day %i)',
    (firstDayOfWeek) => {
      for (let m = 1; m < 12; m++) {
        const month = `2026-${String(m).padStart(2, '0')}`;

        const next = `2026-${String(m + 1).padStart(2, '0')}`;

        // The last row holding a day of the month (no `findLast`: the lib is ES2022).
        const last = [...monthMatrix(month, firstDayOfWeek)]
          .reverse()
          .find((r) => r.some(Boolean))!;

        const first = monthMatrix(next, firstDayOfWeek)[0];

        // Only a row the months share is split.
        if (last.every(Boolean)) continue;

        expect(rowWeek(last, firstDayOfWeek), month).toBe(
          rowWeek(first, firstDayOfWeek),
        );
      }
    },
  );
});

describe('format pattern', () => {
  it.each([
    ['dd.MM.yyyy', '01.09.2026'],
    ['d.M.yyyy', '1.9.2026'],
    ['yyyy-MM-dd', '2026-09-01'],
    ['M/d/yyyy', '9/1/2026'],
  ])('%s formats 2026-09-01 as %s', (pattern, text) => {
    expect(formatDate('2026-09-01', pattern)).toBe(text);
  });

  it('needs one day, month and year token', () => {
    expect(isValidPattern('dd.MM.yyyy')).toBe(true);
    expect(isValidPattern('dd.MM')).toBe(false);
    expect(isValidPattern('dd.dd.yyyy')).toBe(false);
  });
});

describe('parseDate', () => {
  it.each([
    ['01.09.2026', 'dd.MM.yyyy', '2026-09-01'],
    ['1.9.2026', 'dd.MM.yyyy', '2026-09-01'],
    [' 1/9/2026 ', 'dd.MM.yyyy', '2026-09-01'],
    ['1 9 2026', 'dd.MM.yyyy', '2026-09-01'],
    ['1-9-2026', 'dd.MM.yyyy', '2026-09-01'],
    ['01092026', 'dd.MM.yyyy', '2026-09-01'],
    ['2026-09-01', 'yyyy-MM-dd', '2026-09-01'],
    ['9/1/2026', 'M/d/yyyy', '2026-09-01'],
    ['29.02.2024', 'dd.MM.yyyy', '2024-02-29'],
  ])('%s under %s → %s', (text, pattern, iso) => {
    expect(parseDate(text, pattern)).toBe(iso);
  });

  it.each([
    ['31.02.2026'],
    ['29.02.2026'],
    ['1.9.26'],
    ['1.9'],
    ['1.13.2026'],
    ['123.1.2026'],
    ['1,9,2026'],
    ['tomorrow'],
    ['1992026'],
    [''],
  ])('rejects %s', (text) => {
    expect(parseDate(text, 'dd.MM.yyyy')).toBeNull();
  });

  it('cannot read separator-free text under one-digit tokens', () => {
    expect(parseDate('192026', 'd.M.yyyy')).toBeNull();
  });
});

describe('isDisabledDate', () => {
  const rules = {
    isDateDisabled: (iso: string) => [0, 6].includes(dayOfWeek(iso)),
    list: ['2026-12-24', { end: '2026-07-31', start: '2026-07-01' }],
    max: '2026-12-31',
    min: '2026-01-01',
  };

  it.each([
    ['2025-12-31', true],
    ['2027-01-01', true],
    ['2026-12-24', true],
    ['2026-07-15', true],
    ['2026-09-26', true],
    ['2026-09-28', false],
    ['2026-08-03', false],
  ])('%s → %s', (iso, disabled) => {
    expect(isDisabledDate(iso, rules)).toBe(disabled);
  });
});

describe('months', () => {
  it.each([
    ['2026-03', true],
    ['2026-12', true],
    ['2026-13', false],
    ['2026-00', false],
    ['2026-3', false],
    ['2026-03-01', false],
    [null, false],
  ])('%s is an ISO month: %s', (month, ok) => {
    expect(isIsoMonth(month)).toBe(ok);
  });

  it('reads a month or a date by its month', () => {
    expect(toMonth('2026-03')).toBe('2026-03');
    expect(toMonth('2026-03-15')).toBe('2026-03');
    expect(toMonth('2026-02-30')).toBeNull();
    expect(toMonth('')).toBeNull();
  });

  it.each([
    ['dd.MM.yyyy', 'MM.yyyy'],
    ['yyyy-MM-dd', 'yyyy-MM'],
    ['MM/dd/yyyy', 'MM/yyyy'],
    ['d. M. yyyy', 'M. yyyy'],
    ['MM.yyyy', 'MM.yyyy'],
    ['yyyy/M', 'yyyy/M'],
    ['nonsense', 'MM.yyyy'],
    ['dd.yyyy', 'MM.yyyy'],
  ])('the month pattern of %s is %s', (pattern, month) => {
    expect(monthPattern(pattern)).toBe(month);
    expect(isValidMonthPattern(monthPattern(pattern))).toBe(true);
  });

  it('formats a month by the pattern', () => {
    expect(formatMonth('2026-03', 'MM.yyyy')).toBe('03.2026');
    expect(formatMonth('2026-03', 'yyyy-M')).toBe('2026-3');
    expect(formatMonth('2026-13', 'MM.yyyy')).toBe('');
  });

  it.each([
    ['03.2026', '2026-03'],
    ['3.2026', '2026-03'],
    ['3/2026', '2026-03'],
    ['3 2026', '2026-03'],
    ['032026', '2026-03'],
    ['13.2026', null],
    ['0.2026', null],
    ['3.26', null],
    ['1.3.2026', null],
    ['', null],
  ])('%s under MM.yyyy → %s', (text, month) => {
    expect(parseMonth(text, 'MM.yyyy')).toBe(month);
  });

  it('reads by the pattern order', () => {
    expect(parseMonth('2026-3', 'yyyy-MM')).toBe('2026-03');
    expect(parseMonth('3.2026', 'yyyy-MM')).toBeNull();
  });

  it('typing follows a month pattern', () => {
    const typed = (pattern: string, text: string) =>
      conformMask(compileDateMask(pattern), text).text;

    expect(typed('MM.yyyy', '032026')).toBe('03.2026');
    expect(typed('MM.yyyy', '32026')).toBe('3.2026');
    expect(typed('yyyy-MM', '20263')).toBe('2026-3');
  });

  it('keeps parsing dates as before', () => {
    expect(parseDate('01012031', 'ddMMyyyy')).toBe('2031-01-01');
    expect(parseDate('1.9.2026', 'dd.MM.yyyy')).toBe('2026-09-01');
    expect(parseDate('09.2026', 'dd.MM.yyyy')).toBeNull();
  });
});

describe('isDisabledMonth', () => {
  it('bounds count by their months', () => {
    const rules = { max: '2026-10-05', min: '2026-03-15' };

    expect(isDisabledMonth('2026-02', rules)).toBe(true);
    expect(isDisabledMonth('2026-03', rules)).toBe(false);
    expect(isDisabledMonth('2026-10', rules)).toBe(false);
    expect(isDisabledMonth('2026-11', rules)).toBe(true);
    expect(isDisabledMonth('2026-03', { min: '2026-03' })).toBe(false);
  });

  it('is out only when every day is', () => {
    const rules = {
      isDateDisabled: (iso: string) => [0, 6].includes(dayOfWeek(iso)),
      list: [{ end: '2026-07-31', start: '2026-07-01' }, '2026-08-03'],
    };

    expect(isDisabledMonth('2026-07', rules)).toBe(true);
    expect(isDisabledMonth('2026-08', rules)).toBe(false);
    expect(isDisabledMonth('2026-09', rules)).toBe(false);
  });

  it('stops at the first enabled day', () => {
    let calls = 0;

    isDisabledMonth('2026-09', {
      isDateDisabled: () => {
        calls++;

        return false;
      },
    });

    expect(calls).toBe(1);
  });
});

describe('isMonthDisabledEverywhere', () => {
  it('bounds inside one year rule out the months outside them', () => {
    const rules = { max: '2031-10', min: '2031-03' };

    const out = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) =>
      isMonthDisabledEverywhere(m, [2031, 2031], rules),
    );

    expect(out).toEqual([1, 2, 11, 12]);
  });

  it('a month disabled in one year is still open when another takes it', () => {
    const rules = { list: [{ end: '2031-07-31', start: '2031-07-01' }] };

    expect(isMonthDisabledEverywhere(7, [2031, 2032], rules)).toBe(false);
    expect(isMonthDisabledEverywhere(7, [2031, 2031], rules)).toBe(true);
  });
});
