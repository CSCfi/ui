/**
 * Behaviour spec for the side navigation's sub-items (CONTEXT.md "Wash",
 * ADR-0052). Inside the active parent's `nav-active` pill, hover and active
 * are translucent washes of that pill's own ink, `on-nav-active` — never
 * page roles: the `surface-raised` slab the active sub-item used to paint
 * is the page colour in dark mode, a hole punched into the drawer.
 */
import { describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import {
  matchScreenshotInBothModes,
  mount,
  setThemeMode,
  settled,
} from '../../test/harness';

const NAV = `
  <c-side-navigation-title>My project</c-side-navigation-title>
  <c-side-navigation-item>Dashboard</c-side-navigation-item>
  <c-side-navigation-item active>
    Projects
    <c-sub-navigation-item active>Active projects</c-sub-navigation-item>
    <c-sub-navigation-item>Archived projects</c-sub-navigation-item>
  </c-side-navigation-item>
  <c-side-navigation-item>Service description</c-side-navigation-item>
`;

/** `color-mix(in oklab, <token> <pct>%, transparent)` as the browser serialises it. */
const wash = (token: string, pct: number): string => {
  const probe = document.createElement('div');

  probe.style.backgroundColor = `color-mix(in oklab, var(${token}) ${pct}%, transparent)`;
  document.body.append(probe);

  const value = getComputedStyle(probe).backgroundColor;

  probe.remove();

  return value;
};

const tokenColor = (token: string): string => {
  const probe = document.createElement('div');

  probe.style.color = `var(${token})`;
  document.body.append(probe);

  const value = getComputedStyle(probe).color;

  probe.remove();

  return value;
};

const mountNav = async (): Promise<Mounted> => {
  const m = await mount('c-side-navigation', { html: NAV });

  m.stage.style.cssText = 'display:block;padding:0;width:300px';
  await settled();

  return m;
};

const subItems = (m: Mounted): HTMLElement[] =>
  Array.from(m.host.querySelectorAll('c-sub-navigation-item')).map(
    (el) => el.shadowRoot!.querySelector('[part~="root"]')!,
  );

describe('c-sub-navigation-item', () => {
  for (const mode of ['light', 'dark'] as const) {
    it(`paints the active sub-item as a wash of on-nav-active, in that ink (${mode})`, async () => {
      setThemeMode(mode);

      const m = await mountNav();

      const [active, idle] = subItems(m);

      const activeStyle = getComputedStyle(active);

      expect(activeStyle.backgroundColor).toBe(wash('--c-on-nav-active', 18));
      expect(activeStyle.color).toBe(tokenColor('--c-on-nav-active'));
      expect(getComputedStyle(active, '::before').backgroundColor).toBe(
        tokenColor('--c-on-nav-active'),
      );
      expect(getComputedStyle(idle).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(idle).color).toBe(
        tokenColor('--c-on-nav-active'),
      );

      setThemeMode('light');
    });
  }

  it('visual: expanded parent with an active sub-item', async () => {
    const m = await mountNav();

    await matchScreenshotInBothModes(m.stage, 'sub-items');
  });
});
