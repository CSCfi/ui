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

    // The drawer is sized in `dvh`, the visible viewport — not `vh`, which on
    // a phone is the viewport with the browser chrome collapsed and left the
    // drawer's tail behind the address bar. Headless Chromium has no dynamic
    // chrome, so the unit is read from the declaration that sizes the root.
    const root = m.part('root');

    // Tailwind nests its utilities in `@layer` blocks: walk grouped rules.
    const flatten = (rules: CSSRuleList): CSSRule[] =>
      Array.from(rules).flatMap((rule) =>
        rule instanceof CSSGroupingRule ? flatten(rule.cssRules) : [rule],
      );

    const heights = Array.from(m.host.shadowRoot!.adoptedStyleSheets)
      .flatMap((sheet) => flatten(sheet.cssRules))
      .filter(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && root.matches(rule.selectorText),
      )
      .map((rule) => rule.style.height)
      .filter(Boolean);

    expect(heights, 'the drawer height declaration').toContain('100dvh');
    expect(heights).not.toContain('100vh');
  });

  // A stable scrollbar gutter on the page (the ADR-0014 advice) leaves a
  // drawer that is only slid off-screen showing in the gutter — a 15px strip
  // at the right edge of a phone. The closed drawer is invisible instead.
  it('mobile: the closed drawer shows nothing, even beside a stable scrollbar gutter', async () => {
    const root = document.documentElement;

    const gutter = root.style.scrollbarGutter;

    root.style.scrollbarGutter = 'stable';

    try {
      const m = await mount('c-side-navigation', {
        attrs: { mobile: true },
        html: ITEMS,
      });

      await settle(300);

      const drawer = m.part('root');

      expect(getComputedStyle(drawer).visibility).toBe('hidden');
      // The slide is Tailwind's `translate` property, not `transform`: it has
      // to stay in the transition list, or the drawer jumps instead.
      expect(getComputedStyle(drawer).transitionProperty).toContain(
        'translate',
      );

      (m.host as { menuVisible?: boolean } & HTMLElement).menuVisible = true;
      await settle(300);

      expect(getComputedStyle(drawer).visibility).toBe('visible');
      expect(drawer.getBoundingClientRect().right).toBeLessThanOrEqual(
        window.innerWidth,
      );
    } finally {
      root.style.scrollbarGutter = gutter;
    }
  });
});
