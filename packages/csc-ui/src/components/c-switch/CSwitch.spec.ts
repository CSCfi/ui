/**
 * Behaviour spec for c-switch's state (decisions #34, ADR-0075): `value` is the
 * state and `checked` its boolean view. Setting either updates the other
 * without a value event; a `checked` attribute seeds the switch only when no
 * `value` is bound; and the `''` a plain Vue `v-model` writes for a `null`
 * model reads as unchecked.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents, settle } from '../../test/harness';

type Host = { checked: boolean; value: unknown } & HTMLElement;

const EVENTS = ['change', 'input', 'update:value'];

const isChecked = (host: HTMLElement) => host.matches(':state(checked)');

describe('value and checked', () => {
  it('a checked attribute seeds the switch when no value is bound', async () => {
    const m = await mount<Host>('c-switch', {
      attrs: { checked: true, 'false-value': 'no', 'true-value': 'yes' },
    });

    expect(isChecked(m.host)).toBe(true);
    expect(m.host.value).toBe('yes');
  });

  it('a bound value wins over a checked attribute', async () => {
    const m = await mount<Host>('c-switch', {
      attrs: { checked: true },
      props: { value: false },
    });

    expect(isChecked(m.host)).toBe(false);
    expect(m.host.checked).toBe(false);
  });

  it('setting checked sets value, and setting value sets checked, without events', async () => {
    const m = await mount<Host>('c-switch', {
      attrs: { 'false-value': 'no', 'true-value': 'yes' },
    });

    const events = recordEvents(m.host, EVENTS);

    m.host.checked = true;
    await settle();

    expect(m.host.value).toBe('yes');
    expect(isChecked(m.host)).toBe(true);

    m.host.value = 'no';
    await settle();

    expect(m.host.checked).toBe(false);
    expect(isChecked(m.host)).toBe(false);
    expect(events.records).toEqual([]);
  });

  it('a toggle updates both views', async () => {
    const m = await mount<Host>('c-switch', { props: { label: 'Enabled' } });

    await userEvent.click(m.part('root'));
    await settle();

    expect(m.host.value).toBe(true);
    expect(m.host.checked).toBe(true);
  });

  it('the later of two writes in one tick wins, and the views settle', async () => {
    // React sets `checked` only after the element has mounted.
    const m = await mount<Host>('c-switch');

    m.host.value = false;
    m.host.checked = true;
    await settle();

    expect(m.host.checked).toBe(true);
    expect(m.host.value).toBe(true);
    expect(isChecked(m.host)).toBe(true);
  });

  it('a checked attribute reads back as true', async () => {
    const m = await mount<Host>('c-switch', { attrs: { checked: true } });

    expect(m.host.checked).toBe(true);
    expect(m.host.value).toBe(true);
  });

  it("reads '' as unchecked", async () => {
    const m = await mount<Host>('c-switch', { props: { value: true } });

    m.host.value = '';
    await settle();

    expect(isChecked(m.host)).toBe(false);
    expect(m.host.checked).toBe(false);
  });
});
