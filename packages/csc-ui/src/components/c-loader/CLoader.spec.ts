/**
 * Behaviour spec for c-loader: `hide` (ADR-0076; its 3.x name) and
 * `content-delay`, in milliseconds — the 3.x `contentdelay` was seconds.
 */
import { expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

it('delays the message by content-delay milliseconds', async () => {
  const m = await mount('c-loader', {
    attrs: { 'content-delay': 1500 },
    html: 'Loading resources',
  });

  expect(m.part('content').style.animationDelay).toBe('1500ms');
});

it('shows unless hide is set', async () => {
  const m = await mount('c-loader');
  await settle();

  expect(getComputedStyle(m.part('root')).opacity).not.toBe('0');

  m.host.setAttribute('hide', '');
  await settle(400);

  expect(getComputedStyle(m.part('root')).visibility).toBe('hidden');
});
