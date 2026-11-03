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

it("sets the spinner's stroke with thickness, which wins over the deprecated width", async () => {
  const stroke = async (attrs: Record<string, number> = {}) =>
    getComputedStyle(
      (await mount('c-loader', { attrs })).deep('c-spinner', 'circle'),
    ).strokeWidth;

  expect(await stroke()).toBe('4px');
  expect(await stroke({ thickness: 6 })).toBe('6px');
  expect(await stroke({ width: 5 })).toBe('5px');
  expect(await stroke({ thickness: 6, width: 5 })).toBe('6px');
});
