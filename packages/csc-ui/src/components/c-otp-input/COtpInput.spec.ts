/**
 * Behaviour spec for c-otp-input's value events (CONTEXT.md "Value events",
 * "Commit"; ADR-0075): the value is the digits entered so far everywhere —
 * the `value` property, `update:value` and `change` — and typing commits on
 * Enter or when focus leaves the digits.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { mount, recordEvents, settle } from '../../test/harness';

type OtpHost = { value: string } & HTMLElement;

const EVENTS = ['change', 'completion', 'update:value'];

const mountOtp = (props: Record<string, unknown> = {}) =>
  mount<OtpHost>('c-otp-input', { props: { length: 4, ...props } });

const digits = (m: Mounted): HTMLInputElement[] =>
  m.shadowAll<HTMLInputElement>('input[part~="input"]');

describe('value events', () => {
  it('reports the digits entered so far, then the complete code', async () => {
    const m = await mountOtp();

    const events = recordEvents(m.host, EVENTS);

    await userEvent.type(digits(m)[0], '12');
    await settle();

    // The digits are read a frame after the keystroke (focus moves on), so
    // fast typing may report once.
    const updates = events.of('update:value');

    expect(m.host.value).toBe('12');
    expect(updates.at(-1)?.detail).toBe('12');
    expect(updates.every((r) => r.targetValue === r.detail)).toBe(true);

    await userEvent.keyboard('34');
    await settle();

    expect(m.host.value).toBe('1234');
    expect(events.of('completion').map((r) => r.detail)).toEqual(['1234']);
    expect(events.of('change')).toHaveLength(0);
  });

  it('commits on Enter and when focus leaves the digits, once per change', async () => {
    const m = await mountOtp();

    const events = recordEvents(m.host, EVENTS);

    await userEvent.type(digits(m)[0], '12');
    await settle();

    // Moving between the digits is not leaving them.
    digits(m)[0].focus();
    await settle();

    expect(events.of('change')).toHaveLength(0);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['12']);

    digits(m)[0].blur();
    await settle();

    expect(events.of('change')).toHaveLength(1);

    await userEvent.type(digits(m)[2], '3');
    digits(m)[3].blur();
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual(['12', '123']);
  });

  it('fills and clears the digits from a set value without emitting', async () => {
    const m = await mountOtp({ value: '42' });

    const events = recordEvents(m.host, EVENTS);

    expect(digits(m).map((d) => d.value)).toEqual(['4', '2', '', '']);

    m.host.value = '';
    await settle();

    expect(digits(m).map((d) => d.value)).toEqual(['', '', '', '']);
    expect(events.records).toEqual([]);
  });
});

describe('3.x attribute names (R1)', () => {
  it('keeps the id set on the host', async () => {
    const m = await mount<OtpHost>('c-otp-input', {
      attrs: { id: 'code', length: 4 },
    });

    expect(m.host.id).toBe('code');
  });

  it('autofocus focuses the first digit', async () => {
    const m = await mount<OtpHost>('c-otp-input', {
      attrs: { autofocus: true, length: 4 },
    });
    await settle();

    expect(m.host.shadowRoot!.activeElement).toBe(digits(m)[0]);
  });
});
