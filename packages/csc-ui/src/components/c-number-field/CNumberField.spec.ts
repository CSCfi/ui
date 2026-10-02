/**
 * Behaviour spec for c-number-field (CONTEXT.md "Number field", "Group
 * separator", "Out of range", "Step", "Step buttons"; ADR-0060, ADR-0064).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { resetDefaults } from '../../shared/appDefaults';
import {
  deepActiveElement,
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

  it('ignores the minus key at min 0', async () => {
    const m = await mountField({ min: 0 });

    await userEvent.type(input(m), '-5');

    expect(shown(m)).toBe('5');
  });

  it('always asks for a numeric keyboard, decimal with decimals', async () => {
    const unsigned = await mountField({ min: 0 });

    const signed = await mountField();

    const decimals = await mountField({ decimals: 2 });

    expect(input(unsigned).inputMode).toBe('numeric');
    expect(input(signed).inputMode).toBe('numeric');
    expect(input(decimals).inputMode).toBe('decimal');
  });
});

describe('stepping', () => {
  const up = (m: Mounted) => m.part('step-up') as HTMLButtonElement;

  const down = (m: Mounted) => m.part('step-down') as HTMLButtonElement;

  const press = (button: HTMLElement, type: string) =>
    button.dispatchEvent(
      new PointerEvent(type, { bubbles: true, button: 0, composed: true }),
    );

  it('a button press steps once, snapped to the grid, and emits', async () => {
    const m = await mountField({ step: 5, value: 12 });

    const events = recordEvents(m.host, EVENTS);

    await userEvent.click(up(m));
    await settle();

    expect(m.host.value).toBe(15);
    expect(shown(m)).toBe('15');
    expect(events.of('change').map((r) => r.detail)).toEqual([15]);

    await userEvent.click(down(m));
    await userEvent.click(down(m));
    await settle();

    expect(m.host.value).toBe(5);
    expect(events.of('change')).toHaveLength(3);
  });

  it('a press does not focus the input, and a focused input keeps focus', async () => {
    const m = await mountField();

    await userEvent.click(up(m));
    await settle();

    expect(m.host.value).toBe(1);
    expect(deepActiveElement()).not.toBe(input(m));

    input(m).focus();
    await userEvent.click(up(m));
    await settle();

    expect(m.host.value).toBe(2);
    expect(deepActiveElement()).toBe(input(m));
  });

  it("a click with no press before it (a screen reader's) steps", async () => {
    const m = await mountField({ value: 3 });

    up(m).click();
    await settle();

    expect(m.host.value).toBe(4);
  });

  it('counts an empty field from 0, then clamps into range', async () => {
    const signed = await mountField({ step: 5 });

    down(signed).click();
    await settle();

    expect(signed.host.value).toBe(-5);
    expect(shown(signed)).toBe('-5');

    const ranged = await mountField({ min: 10 });

    up(ranged).click();
    await settle();

    expect(ranged.host.value).toBe(10);
  });

  it('lands on a bound and disables the button there', async () => {
    const m = await mountField({ max: 50, min: 1, step: 5, value: 49 });

    expect(up(m).disabled).toBe(false);

    up(m).click();
    await settle();

    expect(m.host.value).toBe(50);
    expect(up(m).disabled).toBe(true);
    expect(down(m).disabled).toBe(false);
    expect(m.host.outOfRange).toBe(false);
  });

  it('steps a typed out-of-range number to the nearest bound', async () => {
    const m = await mountField({ max: 50, min: 1 });

    await userEvent.type(input(m), '70');
    await settle();

    expect(m.host.outOfRange).toBe(true);
    expect(up(m).disabled).toBe(true);

    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(m.host.value).toBe(50);
    expect(m.host.outOfRange).toBe(false);
  });

  it('the arrow keys step once and the page keys ten times', async () => {
    const m = await mountField({ step: 2 });

    const events = recordEvents(m.host, EVENTS);

    input(m).focus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await settle();

    expect(m.host.value).toBe(4);

    await userEvent.keyboard('{PageUp}');
    await settle();

    expect(m.host.value).toBe(24);

    await userEvent.keyboard('{PageDown}{ArrowDown}');
    await settle();

    expect(m.host.value).toBe(2);
    expect(events.of('change')).toHaveLength(5);
  });

  it('rounds a stepped number to decimals', async () => {
    const m = await mountField({ decimals: 1, step: 0.1, value: 0.2 });

    up(m).click();
    await settle();

    expect(m.host.value).toBe(0.3);
    expect(shown(m)).toBe('0,3');
  });

  it('holding a button repeats until a bound', async () => {
    const m = await mountField({ max: 4 });

    const events = recordEvents(m.host, EVENTS);

    press(up(m), 'pointerdown');
    await settle(1000);
    press(up(m), 'pointerup');
    await settle();

    expect(m.host.value).toBe(4);
    expect(events.of('change').map((r) => r.detail)).toEqual([1, 2, 3, 4]);
  });

  it('a release stops the repeat', async () => {
    const m = await mountField();

    press(up(m), 'pointerdown');
    press(up(m), 'pointerup');
    await settle(600);

    expect(m.host.value).toBe(1);
  });

  it('does nothing while disabled or readonly', async () => {
    for (const flag of ['disabled', 'readonly']) {
      const m = await mountField({ [flag]: true, value: 3 });

      expect(up(m).disabled).toBe(true);
      expect(down(m).disabled).toBe(true);

      input(m).dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }),
      );
      await settle();

      expect(m.host.value).toBe(3);
    }
  });

  it('is a spinbutton, with labelled step buttons', async () => {
    const m = await mountField({ max: 100, min: -5, value: 1234 });

    expect(input(m).getAttribute('role')).toBe('spinbutton');
    expect(input(m).getAttribute('aria-valuenow')).toBe('1234');
    expect(input(m).getAttribute('aria-valuemin')).toBe('-5');
    expect(input(m).getAttribute('aria-valuemax')).toBe('100');
    expect(input(m).getAttribute('aria-valuetext')).toBe(input(m).value);
    expect(up(m).tabIndex).toBe(-1);
    expect(up(m).getAttribute('aria-label')).toBe('Increase');
    expect(down(m).getAttribute('aria-label')).toBe('Decrease');

    const own = await mountField({ texts: { increase: 'Lisää' } });

    expect(up(own).getAttribute('aria-label')).toBe('Lisää');
    expect(down(own).getAttribute('aria-label')).toBe('Decrease');
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

    const small = await mountField({ max: 10, size: 'small', value: 10 });

    await matchScreenshotInBothModes(small.stage, 'small');
  });
});
