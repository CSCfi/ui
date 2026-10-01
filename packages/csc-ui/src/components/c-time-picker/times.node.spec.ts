/**
 * The time-of-day helpers behind c-time-picker (ADR-0061): the ISO value,
 * the format pattern and its lenient parser, the typing mask, the bounds,
 * and the column rows.
 */
import { describe, expect, it } from 'vitest';

import { conformMask } from '../../shared/inputMask';
import {
  clampToBounds,
  compileTimeMask,
  formatTime,
  fromMinutes,
  hourDisabled,
  hourLabel,
  hourRows,
  inBounds,
  isTime,
  isTwelveHour,
  isValidPattern,
  minuteRows,
  parseTime,
  periodDisabled,
  readBounds,
  roundToStep,
  toMinutes,
} from './times';

const EN = { am: 'AM', pm: 'PM' };

const FI = { am: 'ap.', pm: 'ip.' };

describe('ISO times', () => {
  it.each([
    ['00:00', true],
    ['23:59', true],
    ['24:00', false],
    ['9:30', false],
    ['09:60', false],
    ['09:30:00', false],
    ['', false],
    [null, false],
  ])('%s → %s', (value, ok) => {
    expect(isTime(value)).toBe(ok);
  });

  it('converts to and from minutes', () => {
    expect(toMinutes('14:05')).toBe(845);
    expect(fromMinutes(845)).toBe('14:05');
    expect(fromMinutes(0)).toBe('00:00');
  });
});

describe('patterns', () => {
  it.each([
    ['HH.mm', true],
    ['H:mm', true],
    ['h:mm a', true],
    ['hh.mm a', true],
    ['a h:mm', true],
    ['HHmm', false],
    ['HH.mm a', false],
    ['h:mm', false],
    ['mm.HH', false],
    ['HH.mm.ss', false],
    ['HH', false],
    ['', false],
  ])('%s is valid: %s', (pattern, ok) => {
    expect(isValidPattern(pattern)).toBe(ok);
  });

  it('knows the hour cycle', () => {
    expect(isTwelveHour('h:mm a')).toBe(true);
    expect(isTwelveHour('HH.mm')).toBe(false);
  });
});

describe('formatTime', () => {
  it.each([
    ['14:05', 'HH.mm', '14.05'],
    ['09:05', 'H:mm', '9:05'],
    ['00:30', 'h:mm a', '12:30 AM'],
    ['12:30', 'h:mm a', '12:30 PM'],
    ['23:59', 'hh.mm a', '11.59 PM'],
    ['09:00', 'a h:mm', 'AM 9:00'],
  ])('%s under %s → %s', (time, pattern, text) => {
    expect(formatTime(time, pattern, EN)).toBe(text);
  });

  it('shows the resolved period texts', () => {
    expect(formatTime('15:00', 'h.mm a', FI)).toBe('3.00 ip.');
  });

  it('labels hour rows by the pattern', () => {
    expect(hourLabel(0, 'h:mm a')).toBe('12');
    expect(hourLabel(13, 'hh:mm a')).toBe('01');
    expect(hourLabel(9, 'HH.mm')).toBe('09');
    expect(hourLabel(9, 'H.mm')).toBe('9');
  });
});

describe('parseTime', () => {
  it.each([
    ['14.05', '14:05'],
    ['14:05', '14:05'],
    ['14 05', '14:05'],
    ['9', '09:00'],
    ['930', '09:30'],
    ['0930', '09:30'],
    ['9.3', '09:03'],
    [' 7.45 ', '07:45'],
    ['2 pm', '14:00'],
    ['24.00', null],
    ['12.60', null],
    ['12345', null],
    ['1.2.3', null],
    ['abc', null],
    ['', null],
  ])('%s under HH.mm → %s', (text, time) => {
    expect(parseTime(text, 'HH.mm', EN)).toBe(time);
  });

  it.each([
    ['2:05 PM', '14:05'],
    ['2:05 p', '14:05'],
    ['2:05pm', '14:05'],
    ['12:00 AM', '00:00'],
    ['12:00 PM', '12:00'],
    ['14:00', '14:00'],
    ['9:30', '09:30'],
    ['12:30', '00:30'],
    ['13:00 PM', null],
    ['0:30 AM', null],
    ['2:05 x', null],
    ['2 am pm', null],
  ])('%s under h:mm a → %s', (text, time) => {
    expect(parseTime(text, 'h:mm a', EN)).toBe(time);
  });

  it('reads localised periods by their letters, then English', () => {
    expect(parseTime('3.00 ip.', 'h.mm a', FI)).toBe('15:00');
    expect(parseTime('3.00 ip', 'h.mm a', FI)).toBe('15:00');
    expect(parseTime('3.00 i', 'h.mm a', FI)).toBe('15:00');
    expect(parseTime('3.00 pm', 'h.mm a', FI)).toBe('15:00');
  });
});

describe('typing mask', () => {
  const typed = (pattern: string, text: string, periods = EN) =>
    conformMask(compileTimeMask(pattern, periods), text).text;

  it('closes an hour early on a digit no two-digit hour starts with', () => {
    expect(typed('HH.mm', '930')).toBe('9.30');
    expect(typed('HH.mm', '2')).toBe('2');
    expect(typed('HH.mm', '2359')).toBe('23.59');
    expect(typed('h:mm a', '230')).toBe('2:30');
    expect(typed('h:mm a', '1230')).toBe('12:30');
  });

  it('closes a minute early on a first digit past five', () => {
    expect(typed('HH.mm', '147')).toBe('14.7');
  });

  it('shows any separator typed as the pattern’s own', () => {
    expect(typed('HH.mm', '9:3')).toBe('9.3');
    expect(typed('HH.mm', '9 3')).toBe('9.3');
  });

  it('fills the period from a letter', () => {
    expect(typed('h:mm a', '930p')).toBe('9:30 PM');
    expect(typed('h.mm a', '930i', FI)).toBe('9.30 ip.');
  });
});

describe('bounds', () => {
  it('reads bounds as minutes; min after max is invalid', () => {
    expect(readBounds('09:30', '17:00')).toEqual({ max: 1020, min: 570 });
    expect(readBounds('', '17:00')).toEqual({ max: 1020, min: null });
    expect(readBounds('22:00', '06:00')).toBeNull();
  });

  it('clamps into the bounds', () => {
    const b = readBounds('09:30', '17:00')!;

    expect(clampToBounds(toMinutes('09:15'), b)).toBe(570);
    expect(clampToBounds(toMinutes('17:45'), b)).toBe(1020);
    expect(clampToBounds(toMinutes('12:00'), b)).toBe(720);
    expect(inBounds(569, b)).toBe(false);
    expect(inBounds(570, b)).toBe(true);
  });

  it('disables an hour or a half day only when all of it is out', () => {
    const b = readBounds('09:30', '17:00')!;

    expect(hourDisabled(8, b)).toBe(true);
    expect(hourDisabled(9, b)).toBe(false);
    expect(hourDisabled(17, b)).toBe(false);
    expect(hourDisabled(18, b)).toBe(true);
    expect(periodDisabled('am', b)).toBe(false);
    expect(periodDisabled('am', readBounds('13:00', '')!)).toBe(true);
    expect(periodDisabled('pm', readBounds('', '11:59')!)).toBe(true);
  });
});

describe('column rows', () => {
  it('orders a 12-hour column 12, 1…11 of its half day', () => {
    expect(hourRows(false)).toHaveLength(24);
    expect(hourRows(true)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(hourRows(true, true)[0]).toBe(12);
  });

  it('thins minutes by the step and sorts an off-step minute in', () => {
    expect(minuteRows(1, null)).toHaveLength(60);
    expect(minuteRows(15, null)).toEqual([0, 15, 30, 45]);
    expect(minuteRows(15, 7)).toEqual([0, 7, 15, 30, 45]);
    expect(minuteRows(0, null)).toHaveLength(60);
    expect(minuteRows(7, null).at(-1)).toBe(56);
  });

  it('rounds to the nearest row', () => {
    expect(roundToStep(7, 5)).toBe(5);
    expect(roundToStep(8, 5)).toBe(10);
    expect(roundToStep(58, 5)).toBe(55);
    expect(roundToStep(58, 1)).toBe(58);
  });
});
