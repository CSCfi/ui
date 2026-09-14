import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
/**
 * Reproduces the hazard `monotonicClock.ts` closes: a wall clock that steps
 * backwards between a mount and a click makes Vue drop the click for every
 * listener above the first one on the path. The first `it` documents the
 * failure with the raw stepping clock; the second shows the shim closing it.
 * If the first one ever starts passing, Vue stopped using `Date.now()` for the
 * event stamp and the shim in `setup.browser.ts` can go.
 */
import { createApp, h } from 'vue';

import { settle } from './harness';
import { monotonicClock } from './monotonicClock';

const harnessNow = Date.now;

afterEach(() => {
  Date.now = harnessNow;
});

/**
 * Mount a Vue tree with a listener on the inner button and one on its parent,
 * with `Date.now` running from `source`; then step the source back by
 * `stepMs`, click the button and report which listeners ran.
 */
const clickAcrossStep = async (
  source: (real: () => number) => () => number,
  stepMs: number,
) => {
  const real = harnessNow.bind(Date);

  let step = 0;

  Date.now = source(() => real() - step);

  const ran = { inner: 0, outer: 0 };

  const root = document.createElement('div');

  document.body.append(root);

  const app = createApp({
    render: () =>
      h('div', { onClick: () => ran.outer++ }, [
        h('button', { onClick: () => ran.inner++, type: 'button' }, 'Go'),
      ]),
  });

  app.mount(root);
  await settle();

  step = stepMs;

  await userEvent.click(root.querySelector('button')!);
  await settle();

  app.unmount();

  return ran;
};

describe('a wall clock stepping backwards between mount and click', () => {
  it('makes Vue drop the click for every listener after the first (the hazard)', async () => {
    expect(await clickAcrossStep((real) => real, 5000)).toEqual({
      inner: 1,
      outer: 0,
    });
  });

  it('is harmless under the harness shim', async () => {
    expect(await clickAcrossStep(monotonicClock, 5000)).toEqual({
      inner: 1,
      outer: 1,
    });
  });
});
