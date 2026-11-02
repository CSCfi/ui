/**
 * Behaviour spec for c-menu-item's kinds (decisions #22): a `command` is a
 * plain `menuitem`; a `radio` item is a `menuitemradio` whose `checked` sets
 * `aria-checked` and the check mark. A leading icon goes in the `icon` slot.
 * An open submenu stays beside its row.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

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

// The submenu is anchored to a row inside the menu's own top-layer panel.
// Safari's native anchor positioning left it the scroll distance above its
// row once the page scrolled, so it is placed by script in every browser.
it('keeps an open submenu beside its row when the page scrolls', async () => {
  const m = await mount('c-menu', {
    html: '<c-button slot="trigger">Open</c-button><c-menu-item value="p">Parent<c-menu-item slot="submenu" value="s">Sub</c-menu-item></c-menu-item>',
  });

  const tall = document.createElement('div');

  tall.style.height = '200vh';
  document.body.append(tall);

  try {
    await userEvent.click(
      m.host.querySelector('c-button')!.shadowRoot!.querySelector('button')!,
    );
    await settle();

    const parent = m.host.querySelector('c-menu-item')!;

    await userEvent.click(parent);
    await settle();

    const row = parent.shadowRoot!.querySelector('[part~="root"]')!;

    const panel = parent.shadowRoot!.querySelector<HTMLElement>(
      '[part~="submenu-panel"]',
    )!;

    expect(panel.matches(':popover-open')).toBe(true);

    window.scrollTo(0, 40);
    await settle();
    await settle();

    expect(window.scrollY).toBe(40);

    for (const a of document.getAnimations()) a.finish();

    expect(Math.round(panel.getBoundingClientRect().top)).toBe(
      Math.round(row.getBoundingClientRect().top),
    );
  } finally {
    tall.remove();
    window.scrollTo(0, 0);
  }
});
