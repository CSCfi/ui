/**
 * Behaviour spec for c-checkbox's state (decisions #34, ADR-0075): `value` is the
 * state and `checked` its boolean view. Setting either updates the other
 * without a value event; a `checked` attribute seeds the checkbox only when no
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
  it('a checked attribute seeds the checkbox when no value is bound', async () => {
    const m = await mount<Host>('c-checkbox', {
      attrs: { checked: true, 'false-value': 'no', 'true-value': 'yes' },
    });

    expect(isChecked(m.host)).toBe(true);
    expect(m.host.value).toBe('yes');
  });

  it('a bound value wins over a checked attribute', async () => {
    const m = await mount<Host>('c-checkbox', {
      attrs: { checked: true },
      props: { value: false },
    });

    expect(isChecked(m.host)).toBe(false);
    expect(m.host.checked).toBe(false);
  });

  it('setting checked sets value, and setting value sets checked, without events', async () => {
    const m = await mount<Host>('c-checkbox', {
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
    const m = await mount<Host>('c-checkbox', { props: { label: 'Accept' } });

    await userEvent.click(m.part('label'));
    await settle();

    expect(m.host.value).toBe(true);
    expect(m.host.checked).toBe(true);
  });

  it('the later of two writes in one tick wins, and the views settle', async () => {
    // React sets `checked` only after the element has mounted.
    const m = await mount<Host>('c-checkbox');

    m.host.value = false;
    m.host.checked = true;
    await settle();

    expect(m.host.checked).toBe(true);
    expect(m.host.value).toBe(true);
    expect(isChecked(m.host)).toBe(true);
  });

  it('a checked attribute reads back as true', async () => {
    const m = await mount<Host>('c-checkbox', { attrs: { checked: true } });

    expect(m.host.checked).toBe(true);
    expect(m.host.value).toBe(true);
  });

  it("reads '' as unchecked", async () => {
    const m = await mount<Host>('c-checkbox', { props: { value: true } });

    m.host.value = '';
    await settle();

    expect(isChecked(m.host)).toBe(false);
    expect(m.host.checked).toBe(false);
  });
});

describe('3.x attribute names (R1)', () => {
  it('name reaches the inner input', async () => {
    const m = await mount<Host>('c-checkbox', { attrs: { name: 'terms' } });

    expect(m.shadow<HTMLInputElement>('input').name).toBe('terms');
  });
});
