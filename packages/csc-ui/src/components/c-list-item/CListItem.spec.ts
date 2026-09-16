/**
 * Behaviour spec for c-list-item. The active row is the `primary-subtle`
 * tint with its paired `on-primary-subtle` ink and a 1px inset `primary`
 * ring; the hover step carries the full `on-surface` ink. `primary` on the
 * tint (3.7:1) and the muted ink on the hover step (3.5:1) both fell short
 * of AA.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { mount, setThemeMode, settled } from '../../test/harness';

const ITEMS = ['Profile', 'Notifications', 'Settings']
  .map(
    (label, i) =>
      `<c-list-item ripple${i === 0 ? ' active' : ''}><c-list-item-title>${label}</c-list-item-title></c-list-item>`,
  )
  .join('');

const tokenColor = (token: string): string => {
  const probe = document.createElement('div');

  probe.style.backgroundColor = `var(${token})`;
  document.body.append(probe);

  const value = getComputedStyle(probe).backgroundColor;

  probe.remove();

  return value;
};

const items = (m: Mounted): HTMLElement[] =>
  Array.from(m.host.querySelectorAll('c-list-item'));

const rootOf = (item: HTMLElement): HTMLElement =>
  item.shadowRoot!.querySelector('[part~="root"]')!;

describe('c-list-item', () => {
  for (const mode of ['light', 'dark'] as const) {
    it(`paints the active row in the tint's paired ink with an inset ring, and hover in on-surface (${mode})`, async () => {
      setThemeMode(mode);

      const m = await mount('c-list', {
        attrs: { bordered: true },
        html: ITEMS,
      });

      await settled();

      const [active, idle] = items(m);

      expect(getComputedStyle(active).backgroundColor).toBe(
        tokenColor('--c-primary-subtle'),
      );
      expect(getComputedStyle(rootOf(active)).color).toBe(
        tokenColor('--c-on-primary-subtle'),
      );
      expect(
        getComputedStyle(
          active
            .querySelector('c-list-item-title')!
            .shadowRoot!.querySelector('[part~="root"]')!,
        ).color,
      ).toBe(tokenColor('--c-on-primary-subtle'));
      expect(getComputedStyle(active).boxShadow).toContain(
        tokenColor('--c-primary'),
      );

      await userEvent.hover(idle);
      await settled();

      expect(getComputedStyle(idle).backgroundColor).toBe(
        tokenColor('--c-primary-subtle-hover'),
      );
      expect(getComputedStyle(rootOf(idle)).color).toBe(
        tokenColor('--c-on-surface'),
      );

      setThemeMode('light');
    });
  }
});
