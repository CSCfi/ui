/**
 * Behaviour spec for c-number-field (CONTEXT.md "Number field", "Group
 * separator", "Out of range"; ADR-0060).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { resetDefaults } from '../../shared/appDefaults';
import {
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type NumberHost = { outOfRange: boolean; value: null | number } & HTMLElement;

const EVENTS = ['change', 'update:value'];

const mountField = (props: Record<string, unknown> = {}) =>
  mount<NumberHost>('c-number-field', {
    attrs: { style: 'width: 320px' },
    props: { label: 'Amount', ...props },
  });

const input = (m: Mounted): HTMLInputElement => m.shadow('input');

/** The shown text, with the non-breaking group space read as a space. */
const shown = (m: Mounted): string => input(m).value.replaceAll(' ', ' ');

afterEach(() => {
  resetDefaults();
  document.documentElement.removeAttribute('lang');
});

describe('typing', () => {
  it('groups as it goes and emits the number live', async () => {
    document.documentElement.lang = 'fi';

    const m = await mountField({ decimals: 2 });

    const events = recordEvents(m.host, EVENTS);

    await userEvent.type(input(m), '1234567,8');
    await settle();

    expect(shown(m)).toBe('1 234 567,8');
    expect(m.host.value).toBe(1234567.8);

    const changes = events.of('change');

    expect(changes.at(-1)?.detail).toBe(1234567.8);
    // The host value is current whenever an event fires.
    expect(changes.every((r) => r.targetValue === r.detail)).toBe(true);
    // Typing "," changed only the text: one change per digit, eight digits.
    expect(changes).toHaveLength(8);
  });

  it('follows the page language, and the separator props win', async () => {
    document.documentElement.lang = 'en';

    const en = await mountField({ decimals: 1 });

    await userEvent.type(input(en), '1234567.8');

    expect(shown(en)).toBe('1,234,567.8');

    const own = await mountField({
      decimals: 1,
      decimalSeparator: ',',
      groupSeparator: "'",
    });

    await userEvent.type(input(own), '1234567,8');

    expect(shown(own)).toBe("1'234'567,8");
  });

  it('reads a lone minus as no number', async () => {
    const m = await mountField();

    const events = recordEvents(m.host, EVENTS);

    await userEvent.type(input(m), '-');
    await settle();

    expect(shown(m)).toBe('-');
    expect(events.records).toHaveLength(0);

    await userEvent.type(input(m), '12');
    await settle();

    expect(m.host.value).toBe(-12);
  });

  it('Backspace over a group separator deletes the digit before it', async () => {
    const m = await mountField();

    await userEvent.type(input(m), '1234');
    input(m).setSelectionRange(2, 2);
    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(shown(m)).toBe('234');
    expect(m.host.value).toBe(234);
  });
});

describe('programmatic value and blur', () => {
  it('formats a set value without emitting', async () => {
    const m = await mountField({ decimals: 2, value: 1234.567 });

    const events = recordEvents(m.host, EVENTS);

    expect(shown(m)).toBe('1 234,57');

    m.host.value = 9876543;
    await settle();

    expect(shown(m)).toBe('9 876 543');
    expect(events.records).toHaveLength(0);
  });

  it('tidies the text on blur without emitting', async () => {
    const m = await mountField({ decimals: 2 });

    const events = recordEvents(m.host, EVENTS);

    await userEvent.type(input(m), '12,');
    input(m).blur();
    await settle();

    expect(shown(m)).toBe('12');
    expect(events.of('change')).toHaveLength(2);

    const fixed = await mountField({
      decimals: 2,
      fixedDecimals: true,
      value: 12.5,
    });

    expect(shown(fixed)).toBe('12,50');
    expect(fixed.host.value).toBe(12.5);
  });
});

describe('range', () => {
  it('keeps an out-of-range number and reports it', async () => {
    const m = await mountField({ max: 100, min: 1 });

    await userEvent.type(input(m), '150');
    await settle();

    expect(m.host.value).toBe(150);
    expect(m.host.outOfRange).toBe(true);
    expect(m.host.matches(':state(out-of-range)')).toBe(true);

    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(m.host.outOfRange).toBe(false);
  });

  it('ignores the minus key and asks for a numeric keyboard at min 0', async () => {
    const m = await mountField({ min: 0 });

    await userEvent.type(input(m), '-5');

    expect(shown(m)).toBe('5');
    expect(input(m).inputMode).toBe('numeric');

    const decimals = await mountField({ decimals: 2, min: 0 });

    const signed = await mountField();

    expect(input(decimals).inputMode).toBe('decimal');
    expect(input(signed).hasAttribute('inputmode')).toBe(false);
  });
});

describe('visual', () => {
  it('empty, filled and out of range', async () => {
    const empty = await mountField();

    await matchScreenshotInBothModes(empty.stage, 'empty');

    const filled = await mountField({
      decimals: 2,
      fixedDecimals: true,
      value: 1234567.5,
    });

    await matchScreenshotInBothModes(filled.stage, 'filled');

    const over = await mountField({
      errorMessage: 'Enter 1 to 100',
      max: 100,
      valid: false,
      value: 150,
    });

    await matchScreenshotInBothModes(over.stage, 'out-of-range');
  });
});
