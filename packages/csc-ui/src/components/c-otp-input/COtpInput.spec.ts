/**
 * Behaviour spec for c-otp-input's value events (CONTEXT.md "Value events",
 * "Commit"; ADR-0075): the value is the digits entered so far everywhere —
 * the `value` property, `update:value` and `change` — and typing commits on
 * Enter or when focus leaves the digits.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { chromiumOnly, mount, recordEvents, settle } from '../../test/harness';

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

describe('digits', () => {
  const paste = (input: HTMLInputElement, text: string): void => {
    const data = new DataTransfer();

    data.setData('text', text);
    input.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: data,
      }),
    );
  };

  it('a cleared middle digit ends the value there', async () => {
    const m = await mountOtp({ value: '1234' });

    digits(m)[1]!.focus();
    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(digits(m).map((d) => d.value)).toEqual(['1', '', '3', '4']);
    expect(m.host.value).toBe('1');

    await userEvent.keyboard('2');
    await settle();

    expect(m.host.value).toBe('1234');
  });

  it('takes a typed digit only', async () => {
    const m = await mountOtp();

    await userEvent.type(digits(m)[0]!, ' ');
    await settle();

    expect(digits(m)[0]!.value).toBe('');
  });

  chromiumOnly(
    'dispatches synthetic paste events, whose clipboardData Firefox hands to listeners empty',
  )('takes a pasted code of digits only', async () => {
    const m = await mountOtp();

    for (const text of ['1e34', '0x1F', '-123', '1.52']) {
      paste(digits(m)[0]!, text);
      await settle();

      expect(
        digits(m)
          .map((d) => d.value)
          .join(''),
        text,
      ).toBe('');
    }

    // A code copied with spaces or a line break around it still fills.
    paste(digits(m)[0]!, ' 12 34\n');
    await settle();

    expect(m.host.value).toBe('1234');
  });

  it('lays out a box per digit when length changes', async () => {
    const m = await mountOtp({ length: 6 });

    (m.host as { length?: number } & HTMLElement).length = 4;
    await settle();

    const boxes = digits(m).map((d) => d.getBoundingClientRect());

    const row = m.part('digits').getBoundingClientRect();

    expect(boxes).toHaveLength(4);
    // No empty columns left over from the six digits.
    expect(row.right).toBeCloseTo(boxes.at(-1)!.right, 0);
  });

  it('hide-details hides the hint', async () => {
    const m = await mountOtp({ hideDetails: true, hint: 'Check your SMS' });

    /** Text in a shadow tree and the shadow trees inside it. */
    const deepText = (root: ShadowRoot): string =>
      [...root.querySelectorAll('*')].reduce(
        (text, el) => text + (el.shadowRoot ? deepText(el.shadowRoot) : ''),
        root.textContent ?? '',
      );

    expect(deepText(m.host.shadowRoot!)).not.toContain('Check your SMS');
  });

  it('leaves a class of your own on the element', async () => {
    const m = await mount<OtpHost>('c-otp-input', {
      attrs: { class: 'error', length: 4 },
    });

    (m.host as { invalid?: boolean } & HTMLElement).invalid = true;
    await settle();
    (m.host as { invalid?: boolean } & HTMLElement).invalid = false;
    await settle();

    expect(m.host.classList.contains('error')).toBe(true);
  });
});
