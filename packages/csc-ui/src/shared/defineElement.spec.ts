/**
 * Behaviour spec for what every registered element shares (defineElement):
 * a native `input` from a component's own shadow tree stops at its shadow
 * root, so only the component's value events reach the page (ADR-0075), while
 * the page's own inputs slotted into a component reach it as before.
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
