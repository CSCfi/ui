/**
 * The narrow-viewport predicate (CONTEXT.md "Narrow viewport", ADR-0050):
 * one media query, followed live, released with its scope.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { effectScope } from 'vue';

import {
  isNarrowViewport,
  NARROW_VIEWPORT_QUERY,
  useNarrowViewport,
} from './useNarrowViewport';

// The browser project's desktop viewport (vitest.browser.shared.ts).
const DESKTOP = { height: 800, width: 1280 };

const PHONE = { height: 740, width: 360 };

afterEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

describe('isNarrowViewport', () => {
  it('reads the shared media query once', async () => {
    expect(NARROW_VIEWPORT_QUERY).toBe('(max-width: 760px)');
    expect(isNarrowViewport()).toBe(false);

    await page.viewport(PHONE.width, PHONE.height);

    expect(isNarrowViewport()).toBe(true);
  });
});

describe('useNarrowViewport', () => {
  it('follows the viewport across the threshold in both directions', async () => {
    const scope = effectScope();

    const narrow = scope.run(() => useNarrowViewport())!;

    expect(narrow.value).toBe(false);

    await page.viewport(PHONE.width, PHONE.height);
    await expect.poll(() => narrow.value).toBe(true);

    await page.viewport(DESKTOP.width, DESKTOP.height);
    await expect.poll(() => narrow.value).toBe(false);

    scope.stop();
  });

  it('stops following once its scope is disposed', async () => {
    const scope = effectScope();

    const narrow = scope.run(() => useNarrowViewport())!;

    scope.stop();

    await page.viewport(PHONE.width, PHONE.height);
    // Give a live listener every chance to fire before asserting it did not.
    await expect.poll(() => isNarrowViewport()).toBe(true);

    expect(narrow.value).toBe(false);
  });
});
