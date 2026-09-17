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

  // iOS Safari pans an `overflow: hidden` document under a touch, so the
  // lock takes the body out of the scroll flow — without the page visibly
  // moving, and putting the offset back on release.
  it('takes a scrolled body out of flow at its scroll offset and restores the offset on release', async () => {
    const f = build();

    const tall = document.createElement('div');
    tall.style.height = '400vh';
    document.body.append(tall);

    try {
      window.scrollTo({ behavior: 'instant', top: 300 });
      await new Promise((r) => requestAnimationFrame(r));
      expect(window.scrollY).toBe(300);

      const anchor = tall.getBoundingClientRect().top;

      lock(f.host);

      const { body } = document;

      expect(body.style.position).toBe('fixed');
      expect(body.style.top).toBe('-300px');
      expect(body.style.width).toBe('100%');
      expect(tall.getBoundingClientRect().top, 'nothing visibly moves').toBe(
        anchor,
      );

      unlockPage(f.host);

      expect(body.style.position).toBe('');
      expect(body.style.top).toBe('');
      expect(body.style.width).toBe('');
      expect(window.scrollY).toBe(300);
    } finally {
      tall.remove();
      window.scrollTo({ behavior: 'instant', top: 0 });
    }
  });
});

// The iOS visual-viewport pan: while the lock is held, a single-finger drag
// that no scroll container in its path can consume is cancelled, so the
// browser cannot pan the visual viewport under a fullscreen panel; a drag in
// an overflowing list, and every drag once the lock is released, go through.
describe('touch-pan guard', () => {
  const touchMove = (target: Element, fingers = 1): TouchEvent => {
    const touches = Array.from(
      { length: fingers },
      (_, i) =>
        new Touch({ clientX: 10 + i * 40, clientY: 10, identifier: i, target }),
    );

    const event = new TouchEvent('touchmove', {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches,
    });

    target.dispatchEvent(event);

    return event;
  };

  const scroller = (overflowing: boolean): HTMLDivElement => {
    const list = document.createElement('div');

    list.style.cssText = 'height:40px;overflow-y:auto';
    list.innerHTML = overflowing
      ? '<div style="height:400px"></div>'
      : '<div style="height:10px"></div>';

    return list;
  };

  it('cancels a single-touch drag with nothing to scroll in its path, not one inside an overflowing list, and nothing once released', () => {
    const host = document.createElement('div');

    const still = document.createElement('p');

    still.textContent = 'surface';

    const shortList = scroller(false);

    const longList = scroller(true);

    host.append(still, shortList, longList);
    document.body.append(host);

    expect(touchMove(still).defaultPrevented, 'unlocked: untouched').toBe(
      false,
    );

    lock(host);

    expect(touchMove(still).defaultPrevented, 'no scroller in path').toBe(true);
    expect(
      touchMove(shortList.firstElementChild!).defaultPrevented,
      'a list with nothing to scroll',
    ).toBe(true);
    expect(
      touchMove(longList.firstElementChild!).defaultPrevented,
      'an overflowing list scrolls',
    ).toBe(false);
    expect(touchMove(still, 2).defaultPrevented, "pinch is the browser's").toBe(
      false,
    );

    unlockPage(host);

    expect(touchMove(still).defaultPrevented, 'released').toBe(false);

    host.remove();
  });
});
