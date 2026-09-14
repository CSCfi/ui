/**
 * The page lock (ADR-0014, ADR-0050) on real DOM: inert everything outside
 * the active holder except toasts, lock scroll, hand the page back in order.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { isPageLockedBy, lockPage, unlockPage } from './pageLock';

interface Fixture {
  host: HTMLDivElement;
  inner: HTMLDivElement;
  innerSibling: HTMLDivElement;
  nestedToasts: HTMLElement;
  sibling: HTMLButtonElement;
  toasts: HTMLElement;
  wrapper: HTMLDivElement;
  wrapperText: HTMLParagraphElement;
}

/**
 * body
 * ├── sibling <button>
 * ├── toasts <c-toasts>
 * └── wrapper
 *     ├── wrapperText <p>
 *     ├── nestedToasts <c-toasts>
 *     └── host
 *         ├── innerSibling
 *         └── inner
 */
const build = (): Fixture => {
  const sibling = document.createElement('button');

  const toasts = document.createElement('c-toasts');

  const wrapper = document.createElement('div');

  const wrapperText = document.createElement('p');

  const nestedToasts = document.createElement('c-toasts');

  const host = document.createElement('div');

  const innerSibling = document.createElement('div');

  const inner = document.createElement('div');

  host.append(innerSibling, inner);
  wrapper.append(wrapperText, nestedToasts, host);
  document.body.append(sibling, toasts, wrapper);

  return {
    host,
    inner,
    innerSibling,
    nestedToasts,
    sibling,
    toasts,
    wrapper,
    wrapperText,
  };
};

const locked: HTMLElement[] = [];

const lock = (host: HTMLElement): void => {
  locked.push(host);
  lockPage(host);
};

afterEach(() => {
  for (const host of locked) unlockPage(host);

  locked.length = 0;
});

describe('lockPage', () => {
  it('inerts everything outside the holder, descends past toasts, locks scroll', () => {
    const f = build();

    lock(f.host);

    expect(f.sibling.inert).toBe(true);
    expect(f.toasts.inert).toBe(false);
    // The wrapper holds a toaster, so its other children go inert instead.
    expect(f.wrapper.inert).toBe(false);
    expect(f.wrapperText.inert).toBe(true);
    expect(f.nestedToasts.inert).toBe(false);
    expect(f.host.inert).toBe(false);
    expect(f.inner.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(isPageLockedBy(f.host)).toBe(true);

    unlockPage(f.host);

    expect(f.sibling.inert).toBe(false);
    expect(f.wrapperText.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
    expect(isPageLockedBy(f.host)).toBe(false);
  });

  it('a holder inside a holder takes over; releasing it hands the page back to the outer one', () => {
    const f = build();

    lock(f.host);
    lock(f.inner);

    expect(f.innerSibling.inert, 'the outer holder’s other content').toBe(true);
    expect(f.sibling.inert).toBe(true);
    expect(f.inner.inert).toBe(false);

    unlockPage(f.inner);

    expect(f.innerSibling.inert).toBe(false);
    expect(f.sibling.inert, 'the outer lock still holds').toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    unlockPage(f.host);

    expect(f.sibling.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('releasing the outer holder first keeps the inner one active', () => {
    const f = build();

    lock(f.host);
    lock(f.inner);
    unlockPage(f.host);

    expect(f.innerSibling.inert).toBe(true);
    expect(f.sibling.inert).toBe(true);

    unlockPage(f.inner);

    expect(f.innerSibling.inert).toBe(false);
    expect(f.sibling.inert).toBe(false);
  });

  it('never touches consumer-set inert, restores a prior overflow, and ignores unknown hosts', () => {
    const f = build();

    f.sibling.inert = true;
    document.documentElement.style.overflow = 'scroll';

    lock(f.host);
    lock(f.host); // idempotent

    unlockPage(f.inner); // never locked: no-op
    expect(document.documentElement.style.overflow).toBe('hidden');

    unlockPage(f.host);
    unlockPage(f.host); // idempotent

    expect(f.sibling.inert, 'consumer-set inert survives').toBe(true);
    expect(document.documentElement.style.overflow).toBe('scroll');

    document.documentElement.style.overflow = '';
  });
});
