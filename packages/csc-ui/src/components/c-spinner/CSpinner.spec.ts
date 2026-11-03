/**
 * Behaviour spec for c-spinner: `thickness` sets the stroke; the 3.x `width`
 * still does until 5.0 (ADR-0074).
 */
import { expect, it } from 'vitest';

import { mount } from '../../test/harness';

const stroke = async (attrs: Record<string, number> = {}) =>
  getComputedStyle((await mount('c-spinner', { attrs })).shadow('circle'))
    .strokeWidth;

it('sets the stroke with thickness, which wins over the deprecated width', async () => {
  expect(await stroke()).toBe('2px');
  expect(await stroke({ thickness: 6 })).toBe('6px');
  expect(await stroke({ width: 5 })).toBe('5px');
  expect(await stroke({ thickness: 6, width: 5 })).toBe('6px');
});
