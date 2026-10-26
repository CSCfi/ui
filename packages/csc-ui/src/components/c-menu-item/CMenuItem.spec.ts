/**
 * Behaviour spec for c-menu-item's kinds (decisions #22): a `command` is a
 * plain `menuitem`; a `radio` item is a `menuitemradio` whose `checked` sets
 * `aria-checked` and the check mark. A leading icon goes in the `icon` slot.
 */
import { expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

it('a command is a plain menuitem, with no checked state', async () => {
  const m = await mount('c-menu-item', {
    attrs: { checked: true },
    html: 'Copy',
  });

  expect(m.host.getAttribute('role')).toBe('menuitem');
  expect(m.host.hasAttribute('aria-checked')).toBe(false);
  expect(m.host.shadowRoot!.querySelector('[part~="check"]')).toBeNull();
});

it('a radio item is a menuitemradio that checked checks', async () => {
  const m = await mount<{ checked: boolean } & HTMLElement>('c-menu-item', {
    attrs: { type: 'radio' },
    html: 'Dark',
  });

  expect(m.host.getAttribute('role')).toBe('menuitemradio');
  expect(m.host.getAttribute('aria-checked')).toBe('false');

  m.host.checked = true;
  await settle();

  expect(m.host.getAttribute('aria-checked')).toBe('true');
  expect(m.host.shadowRoot!.querySelector('[part~="check"]')).not.toBeNull();
});

it('renders a slotted leading icon', async () => {
  const m = await mount('c-menu-item', {
    html: '<span slot="icon">★</span>Favourite',
  });

  const slot =
    m.host.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]')!;

  expect(slot.assignedElements()).toHaveLength(1);
  expect(getComputedStyle(slot.parentElement!).display).not.toBe('none');
});
