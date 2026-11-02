/**
 * Behaviour spec for what every registered element shares (defineElement):
 * a native `input` from a component's own shadow tree stops at its shadow
 * root, so only the component's value events reach the page (ADR-0075), while
 * the page's own inputs slotted into a component reach it as before; the
 * members a component exposes on its element follow the instance mounted now.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents, settle } from '../test/harness';

it('a native input from a component’s shadow tree does not reach the page', async () => {
  const m = await mount('c-text-field', { props: { label: 'Name' } });

  const page = recordEvents(document.body, ['input']);

  await userEvent.type(m.shadow('input'), 'a');
  await settle();

  // The component's own, which carries the new value on the host.
  expect(page.records.map((r) => r.composed)).toEqual([false]);
});

it('the page’s own input slotted into a component still reaches the page', async () => {
  const m = await mount('c-card', { html: '<input aria-label="Note" />' });

  const page = recordEvents(document.body, ['input']);

  await userEvent.type(m.host.querySelector('input')!, 'a');
  await settle();

  expect(page.records.map((r) => r.composed)).toEqual([true]);
});

// An element taken off the page and put back (KeepAlive, a moved list item)
// mounts a new component instance; its methods and read-only properties must
// reach that one, not the unmounted first (and no "already exists" warning).
it('exposed members reach the instance mounted now after the element comes back', async () => {
  const m = await mount<
    { unmaskedValue?: string; value?: string } & HTMLElement
  >('c-text-field', { props: { label: 'Code', mask: '###' } });

  const parent = m.host.parentNode!;

  m.host.remove();
  await settle(100);
  parent.append(m.host);
  await settle(100);

  m.host.value = '123';
  await settle();

  expect(m.host.unmaskedValue).toBe('123');
});
