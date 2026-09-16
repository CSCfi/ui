/**
 * Behaviour spec for the side navigation's sub-items (CONTEXT.md "Wash",
 * ADR-0052). Inside the active parent's `nav-active` pill the states are the
 * nav family's own: hover a translucent wash of the pill's ink,
 * `on-nav-active`; active the `nav-sub-active` fill (white in light mode, a
 * wash in dark) — never page roles: the `surface-raised` slab the active
 * sub-item used to paint is the page colour in dark mode, a hole punched
 * into the drawer.
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

/** A token's background colour as the browser serialises it. */
const tokenBackground = (token: string): string => {
  const probe = document.createElement('div');

  probe.style.backgroundColor = `var(${token})`;
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
    it(`paints the active sub-item in nav-sub-active with the on-nav-active ink (${mode})`, async () => {
      setThemeMode(mode);

      const m = await mountNav();

      const [active, idle] = subItems(m);

      const activeStyle = getComputedStyle(active);

      expect(activeStyle.backgroundColor).toBe(
        tokenBackground('--c-nav-sub-active'),
      );
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
