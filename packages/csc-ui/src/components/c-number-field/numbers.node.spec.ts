/**
 * The number core behind c-number-field (CONTEXT.md "Number field", "Group
 * separator"; ADR-0060): separators from Intl, grouping as digits are typed,
 * the caret, decimals, the sign, reading and formatting.
 */
import { describe, expect, it } from 'vitest';

import type { CNumberFieldFormat } from './numbers';

import {
  conformNumber,
  formatNumber,
  numberSeparators,
  readNumber,
} from './numbers';

const NBSP = ' ';

const FI: CNumberFieldFormat = {
  allowNegative: true,
  decimal: ',',
  decimals: 2,
  group: NBSP,
};

const EN: CNumberFieldFormat = { ...FI, decimal: '.', group: ',' };

const INT: CNumberFieldFormat = { ...FI, decimals: 0 };

/** Conform with the caret at the end; spaces in expectations read as the group separator. */
const shown = (text: string, format = FI) =>
  conformNumber(text, text.length, format).text.replaceAll(NBSP, ' ');

describe('separators', () => {
  it('come from Intl for the page language', () => {
    expect(numberSeparators('fi')).toEqual({ decimal: ',', group: NBSP });
    expect(numberSeparators('en')).toEqual({ decimal: '.', group: ',' });
    expect(numberSeparators('de').group).toBe('.');
  });

  it('fall back without a language', () => {
    expect(numberSeparators('')).toEqual({ decimal: ',', group: NBSP });
    expect(numberSeparators('not a tag!')).toEqual({
      decimal: ',',
      group: NBSP,
    });
  });
});

describe('grouping', () => {
  it('groups the integer digits in threes as they are typed', () => {
    expect(shown('123')).toBe('123');
    expect(shown('1234')).toBe('1 234');
    expect(shown('1234567,89')).toBe('1 234 567,89');
    expect(shown('1234567.8', EN)).toBe('1,234,567.8');
  });

  it('regroups after a deletion', () => {
    expect(shown('1 23')).toBe('123');
  });

  it('ignores typed spaces and group separators, and other characters', () => {
    expect(shown('1 2 3 4')).toBe('1 234');
    expect(shown('1,234', EN)).toBe('1,234');
    expect(shown('12a3€')).toBe('123');
  });

  it('drops leading zeros but keeps a lone one', () => {
    expect(shown('007')).toBe('7');
    expect(shown('00')).toBe('0');
    expect(shown('0,5')).toBe('0,5');
  });

  it('caps the integer part at 15 digits', () => {
    expect(conformNumber('1234567890123456', 16, INT).value).toBe(
      123456789012345,
    );
  });
});

describe('caret', () => {
  it('stays after the typed character when a separator is inserted', () => {
    // "123|" + "4" → "1 234|"
    expect(conformNumber('1234', 4, FI).caret).toBe(5);
    // "1|23" + "9" → "19|23" → "1 9|23"
    expect(conformNumber('1923', 2, FI)).toMatchObject({
      caret: 3,
      text: `1${NBSP}923`,
    });
  });

  it('follows removed leading zeros', () => {
    expect(conformNumber('05', 2, INT).caret).toBe(1);
  });

  it('marks group separators as inserted', () => {
    expect(conformNumber('1234', 4, FI).tokenAt).toEqual([
      true,
      false,
      true,
      true,
      true,
    ]);
  });
});

describe('decimals', () => {
  it('ignores the decimal key in an integer field', () => {
    expect(shown('12,5', INT)).toBe('125');
  });

  it('caps the fraction digits and keeps one decimal separator', () => {
    expect(shown('1,2345')).toBe('1,23');
    expect(shown('1,2,3')).toBe('1,23');
  });

  it('reads either key as the decimal unless it is the group separator', () => {
    expect(shown('1.5')).toBe('1,5');
    expect(shown('1,5', EN)).toBe('15');
    expect(shown('1,5', { ...FI, decimal: ',', group: '.' })).toBe('1,5');
  });

  it('reads a pasted number grouped the other way', () => {
    expect(readNumber('1,234.56', FI)).toBe(1234.56);
    expect(readNumber('1.234,56', FI)).toBe(1234.56);
    expect(readNumber('1 234,56', FI)).toBe(1234.56);
    expect(readNumber('1234.56', FI)).toBe(1234.56);
  });

  it('keeps a trailing decimal separator while typing', () => {
    expect(shown('12,')).toBe('12,');
    expect(readNumber('12,', FI)).toBe(12);
  });
});

describe('sign', () => {
  it('keeps a leading minus only', () => {
    expect(shown('-12')).toBe('-12');
    expect(shown('−12')).toBe('-12');
    expect(shown('1-2')).toBe('12');
    expect(shown('--1')).toBe('-1');
  });

  it('drops the minus when negatives are not allowed', () => {
    expect(shown('-12', { ...FI, allowNegative: false })).toBe('12');
  });
});

describe('reading', () => {
  it('reads what the text holds', () => {
    expect(readNumber('', FI)).toBeNull();
    expect(readNumber('-', FI)).toBeNull();
    expect(readNumber(',', FI)).toBeNull();
    expect(readNumber(',5', FI)).toBe(0.5);
    expect(Object.is(readNumber('-0', FI), 0)).toBe(true);
    expect(readNumber('-1 234,5', FI)).toBe(-1234.5);
  });
});

describe('formatting', () => {
  const format = (value: null | number, fixed = false, f = FI) =>
    formatNumber(value, f, fixed).replaceAll(NBSP, ' ');

  it('groups, rounds to decimals and trims zeros unless fixed', () => {
    expect(format(1234567.891)).toBe('1 234 567,89');
    expect(format(12.5)).toBe('12,5');
    expect(format(12.5, true)).toBe('12,50');
    expect(format(12, true)).toBe('12,00');
    expect(format(12.7, false, INT)).toBe('13');
    expect(format(-1234.5, false, EN)).toBe('-1,234.5');
  });

  it('shows nothing for no number', () => {
    expect(format(null)).toBe('');
    expect(format(Number.NaN)).toBe('');
    expect(format(Number.POSITIVE_INFINITY)).toBe('');
    expect(format(-0.001)).toBe('0');
  });
});
