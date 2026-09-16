/**
 * Behaviour spec for c-side-navigation-title. Seeded from the report that the
 * first section title in a navigation carried its section-separating top
 * margin on top of the nav padding.
 */
import { describe, expect, it } from 'vitest';

import { mount, setThemeMode } from '../../test/harness';

const TITLE_MARGIN = '24px'; // `mt-6`

const titleRoot = (title: Element): HTMLElement =>
  title.shadowRoot!.querySelector('[part~="root"]') as HTMLElement;

const underline = (title: Element): HTMLElement =>
  title
    .shadowRoot!.querySelector('c-divider')!
    .shadowRoot!.querySelector('[part~="root"]') as HTMLElement;

interface Ink {
  alpha: number;
  rgb: [number, number, number];
}

/** Chromium serialises `color-mix()` results as `color(srgb r g b / a)`. */
const parseInk = (value: string): Ink => {
  const srgb =
    /^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(value);

  if (srgb) {
    return {
      alpha: srgb[4] === undefined ? 1 : Number(srgb[4]),
      rgb: [srgb[1], srgb[2], srgb[3]].map((c) =>
        Math.round(Number(c) * 255),
      ) as Ink['rgb'],
    };
  }

  const rgb = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(value);

  if (rgb) {
    return {
      alpha: rgb[4] === undefined ? 1 : Number(rgb[4]),
      rgb: [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])],
    };
  }

  throw new Error(`unparsed colour: ${value}`);
};

describe('c-side-navigation-title', () => {
  it('drops its top margin when it is the first child of the navigation', async () => {
    const m = await mount('c-side-navigation', {
      html: '<c-side-navigation-title>Guides</c-side-navigation-title><c-side-navigation-item>One</c-side-navigation-item><c-side-navigation-title>Components</c-side-navigation-title>',
    });

    const [first, second] = Array.from(
      m.host.querySelectorAll('c-side-navigation-title'),
    );

    expect(getComputedStyle(titleRoot(first)).marginTop).toBe('0px');
    expect(getComputedStyle(titleRoot(second)).marginTop).toBe(TITLE_MARGIN);
  });

  it('paints its underline with a translucent on-nav ink that reads on the nav surface', async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      const nav = await mount('c-side-navigation', {
        html: '<c-side-navigation-title>Guides</c-side-navigation-title>',
      });

      const pageDivider = await mount('c-divider');

      const ink = parseInk(
        getComputedStyle(
          underline(nav.host.querySelector('c-side-navigation-title')!),
        ).backgroundColor,
      );

      const pageInk = parseInk(
        getComputedStyle(pageDivider.part('root')).backgroundColor,
      );

      // Visible but not a solid rule, and not the page's divider ink.
      expect(ink.alpha, `${mode}: alpha`).toBeGreaterThanOrEqual(0.3);
      expect(ink.alpha, `${mode}: alpha`).toBeLessThan(1);
      expect(ink, `${mode}: ink`).not.toEqual(pageInk);

      if (mode === 'light') expect(ink.rgb).toEqual([255, 255, 255]);

      nav.unmount();
      pageDivider.unmount();
    }
  });

  it('keeps the top margin when an item precedes it', async () => {
    const m = await mount('c-side-navigation', {
      html: '<c-side-navigation-item>One</c-side-navigation-item><c-side-navigation-title>More</c-side-navigation-title>',
    });

    const title = m.host.querySelector('c-side-navigation-title')!;

    expect(getComputedStyle(titleRoot(title)).marginTop).toBe(TITLE_MARGIN);
  });
});
