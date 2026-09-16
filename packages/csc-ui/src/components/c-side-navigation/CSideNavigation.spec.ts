/**
 * Behaviour spec for c-side-navigation's drawer (CONTEXT.md "Side
 * navigation", "Drawer", "Bottom slot"). The item list is the drawer's scroll
 * container and contains its overscroll — a wheel that reached its end used
 * to chain to the document, and Chromium then latched the rest of the gesture
 * there, leaving the drawer stuck — while the bottom slot stays at the
 * drawer's bottom edge. Covers the standalone `autoheight` host state (the
 * docs shell) and the mobile drawer; the pinning inside c-main is c-main's
 * spec.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

const ITEMS = Array.from(
  { length: 40 },
  (_, i) => `<c-side-navigation-item>Item ${i}</c-side-navigation-item>`,
).join('');

/** A plain button: slotted csc-ui hosts are boxless, this one has a rect to measure. */
const BOTTOM =
  '<button slot="bottom" style="display: block; height: 40px">Sign out</button>';

/** The drawer's inset (`p-6` on the nav, `pb-6` on the bottom region). */
const DRAWER_INSET = 24;

describe('c-side-navigation', () => {
  it('autoheight: fits the visible viewport under the toolbar; the item list scrolls and contains its overscroll', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { class: 'autoheight' },
      html: ITEMS + BOTTOM,
    });

    await settle();

    expect(m.host.getBoundingClientRect().height).toBe(window.innerHeight - 60);

    const list = m.part('nav');

    expect(list.scrollHeight, 'the fixture overflows').toBeGreaterThan(
      list.clientHeight,
    );
    expect(getComputedStyle(list).overscrollBehaviorY).toBe('contain');
    // The host itself never overflows: the list shrinks and scrolls instead.
    expect(m.host.scrollHeight).toBe(m.host.clientHeight);

    const button = m.host.querySelector('[slot="bottom"]') as HTMLElement;

    expect(button.getBoundingClientRect().bottom).toBeCloseTo(
      m.host.getBoundingClientRect().bottom - DRAWER_INSET,
      0,
    );
  });

  it('mobile: the item list scrolls and the bottom slot sits at the panel’s bottom edge', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { 'menu-visible': true, mobile: true },
      html: ITEMS + BOTTOM,
    });

    await settle();

    const list = m.part('nav');

    expect(list.scrollHeight, 'the fixture overflows').toBeGreaterThan(
      list.clientHeight,
    );

    const button = m.host.querySelector('[slot="bottom"]') as HTMLElement;

    expect(button.getBoundingClientRect().bottom).toBeCloseTo(
      window.innerHeight - DRAWER_INSET,
      0,
    );
  });
});
