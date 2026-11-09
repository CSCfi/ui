/**
 * Text on a role's tint takes the tint's ink, `on-<role>-subtle` (ADR-0081).
 * Primary text on the primary tint read 3.72:1 in dark mode, and on a hover
 * wash of primary about 3.8:1. `scripts/check-tint-ink.mjs` keeps the pattern
 * out of every SFC; this spec reads the states as the page paints them.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from './harness';

import { rasterise } from './conformance/paint';
import {
  contrastRatio,
  mount,
  parkPointer,
  roleInMode,
  setThemeMode,
  settle,
  settled,
} from './harness';

/** The ground a translucent wash paints over the surface, as the eye sees it. */
const ground = (wash: string, surface: string): string => {
  const [r, g, b, a] = rasterise(wash);

  const under = rasterise(surface);

  const t = a! / 255;

  const mix = (c: number, i: number) => Math.round(c * t + under[i]! * (1 - t));

  return `rgb(${mix(r!, 0)} ${mix(g!, 1)} ${mix(b!, 2)})`;
};

interface Case {
  attrs?: Record<string, boolean | string>;

  /** Puts the element into its tinted state and returns it. */
  enter(m: Mounted): Promise<HTMLElement>;
  html?: string;
  tag: string;
}

const hovered =
  (part: string) =>
  async (m: Mounted): Promise<HTMLElement> => {
    const element = m.part(part);

    await userEvent.hover(element);
    await settled();

    return element;
  };

const CASES: Record<string, Case> = {
  'c-accordion-item hovered header': {
    attrs: { heading: 'Billing' },
    enter: hovered('header'),
    tag: 'c-accordion-item',
  },
  'c-autocomplete active option': {
    attrs: { label: 'Cluster' },
    async enter(m) {
      await userEvent.click(m.shadow('c-input'));
      await settle();
      await userEvent.keyboard('{ArrowDown}');
      await settle();

      return m.shadow('li[part~="option"][data-active]');
    },
    html: '<c-option value="puhti">Puhti</c-option><c-option value="mahti">Mahti</c-option>',
    tag: 'c-autocomplete',
  },
  'c-breadcrumb-item hovered link': {
    async enter(m) {
      // Only a crumb before the current (last) one is a link.
      const element = m.host
        .querySelector('c-breadcrumb-item')!
        .shadowRoot!.querySelector<HTMLElement>('[part~="content"]')!;

      await userEvent.hover(element);
      await settled();

      return element;
    },
    html: '<c-breadcrumb-item href="#projects">Projects</c-breadcrumb-item><c-breadcrumb-item>Billing</c-breadcrumb-item>',
    tag: 'c-breadcrumb',
  },
  'c-menu-item hovered': {
    enter: hovered('root'),
    html: 'Duplicate',
    tag: 'c-menu-item',
  },
};

for (const [name, c] of Object.entries(CASES)) {
  it(`${name} reads at AA in both modes`, async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      const m = await mount(c.tag, { attrs: c.attrs, html: c.html });

      const element = await c.enter(m);

      const { backgroundColor, color } = getComputedStyle(element);

      expect(
        contrastRatio(
          color,
          ground(backgroundColor, roleInMode(mode, '--c-surface')),
        ),
        mode,
      ).toBeGreaterThanOrEqual(4.5);

      await parkPointer();
      document.body.replaceChildren();
    }
  });
}
