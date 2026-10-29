/**
 * Behaviour spec for c-alert's close button (glossary Closeable): `closeable`
 * renders it, pressing it fires `close`, and the alert stays put — removing
 * it is the consumer's job. An unset `type` is the neutral look, as on
 * c-status, and only a status type shows an icon.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents, settle } from '../../test/harness';

it('closeable renders a close button that fires close', async () => {
  const m = await mount('c-alert', {
    attrs: { closeable: true },
    html: 'Maintenance on Saturday.',
  });

  const events = recordEvents(m.host, ['close']);

  await userEvent.click(m.part('close'));
  await settle();

  expect(events.records).toHaveLength(1);
  expect(m.host.isConnected).toBe(true);
});

it('renders no close button unless closeable', async () => {
  const m = await mount('c-alert', { html: 'Maintenance on Saturday.' });

  expect(m.host.shadowRoot!.querySelector('[part~="close"]')).toBeNull();
});

it('an unset or unknown type is the neutral look, announced politely', async () => {
  const neutral = await mount('c-alert', { html: 'Note' });

  const unknown = await mount('c-alert', {
    attrs: { type: 'default' },
    html: 'Note',
  });

  for (const m of [neutral, unknown]) {
    expect(m.host.getAttribute('role')).toBe('status');
    expect(m.part('root').className).toContain('border-l-primary');
  }
});

it('shows an icon for a status type and none for an unset or unknown type', async () => {
  for (const type of ['error', 'info', 'success', 'warning']) {
    const m = await mount('c-alert', { attrs: { type }, html: 'Note' });

    expect(
      m.part('icon').querySelector('path')!.getAttribute('d'),
      type,
    ).not.toBe('');
  }

  const neutral = await mount('c-alert', { html: 'Note' });

  const unknown = await mount('c-alert', {
    attrs: { type: 'default' },
    html: 'Note',
  });

  for (const m of [neutral, unknown]) {
    expect(m.host.shadowRoot!.querySelector('[part~="icon"]')).toBeNull();
  }
});
