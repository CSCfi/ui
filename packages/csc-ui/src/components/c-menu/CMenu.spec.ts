/**
 * Behaviour spec for c-menu (CONTEXT.md "Menu", "Peek"; ADR-0008/0043).
 * Seeded from 8ef62d16: menus showed scrollbars, ended mid-boundary, and
 * measured their rows with a hard-coded height.
 */
import { mdiDotsVertical } from '@mdi/js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import {
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  roleInMode,
  setThemeMode,
  settle,
  settled,
} from '../../test/harness';

const TRIGGER = '<c-button slot="trigger">Open</c-button>';

const items = (n: number, from = 0): string =>
  Array.from(
    { length: n },
    (_, i) =>
      `<c-menu-item value="i${from + i}">Item ${from + i}</c-menu-item>`,
  ).join('');

const mountMenu = (html: string) =>
  mount('c-menu', { html: `${TRIGGER}${html}` });

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(
    m.host.querySelector('c-button')!.shadowRoot!.querySelector('button')!,
  );
  await settle();
  await settle();
};

const rect = (el: Element): DOMRect => el.getBoundingClientRect();

describe('peek', () => {
  // `max-h-[80vh]` → a 320px ceiling the 30-item menu overflows.
  beforeAll(() => page.viewport(1200, 400));
  afterAll(() => page.viewport(1280, 800));

  it('an overflowing menu hides its scrollbar and ends on a half-visible item row', async () => {
    const m = await mountMenu(items(30));

    await open(m);

    const list = m.part('list');

    const bottom = rect(list).bottom;

    expect(list.style.maxHeight).not.toBe('');
    expect(getComputedStyle(list).scrollbarWidth).toBe('none');
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

    const cut = Array.from(m.host.querySelectorAll('c-menu-item')).find(
      (item) => rect(item).top < bottom && bottom < rect(item).bottom,
    );

    expect(cut, 'list bottom falls inside an item row').toBeDefined();

    await matchScreenshotInBothModes(m.part('panel'), 'open-peek');
  });

  it('the cut never lands inside a label or divider', async () => {
    const mixed = Array.from(
      { length: 10 },
      (_, i) =>
        `<c-menu-label>Group ${i}</c-menu-label>${items(3, i * 3)}<c-divider></c-divider>`,
    ).join('');

    const m = await mountMenu(mixed);

    await open(m);

    const bottom = rect(m.part('list')).bottom;

    for (const el of m.host.querySelectorAll('c-menu-label, c-divider')) {
      const r = rect(el);

      expect(
        r.top < bottom && bottom < r.bottom,
        `${el.localName} cut at ${bottom}`,
      ).toBe(false);
    }
  });

  it('re-measures a frame after the row set changes while open', async () => {
    const m = await mountMenu(items(4));

    await open(m);

    const list = m.part('list');

    expect(list.style.maxHeight, 'four items need no cap').toBe('');

    m.host.insertAdjacentHTML('beforeend', items(30, 4));
    await settle();
    await settle();

    expect(list.style.maxHeight).not.toBe('');
    expect(parseFloat(list.style.maxHeight)).toBeLessThanOrEqual(320);
  });
});

// A submenu on touch (iOS Safari): one tap fires `pointerover` and then, once
// WebKit's click delay has passed, `click`. Hover-open on that `pointerover`
// opened the submenu, and the tap's own click then toggled it straight back
// shut — the submenu flashed and vanished. With the hover-open guarded, the
// toggle still read a tap as "close" whenever the submenu was open or
// recorded as open by the time the click arrived, and the submenu never
// showed at all; a click on a parent item now only ever opens.
describe('c-menu submenu on touch', () => {
  const SUBMENU =
    '<c-menu-item value="p">Parent<c-menu-item slot="submenu" value="s">Sub</c-menu-item></c-menu-item>';

  const submenuPanel = (parent: Element): HTMLElement =>
    parent.shadowRoot!.querySelector<HTMLElement>('[part~="submenu-panel"]')!;

  /**
   * The events a tap dispatches, on the row inside the item's shadow root
   * where a finger lands: `pointerover` and the press pair with
   * `pointerType: 'touch'`, then the compat `click`.
   */
  const tap = async (parent: Element): Promise<void> => {
    const row =
      parent.shadowRoot!.querySelector<HTMLElement>('[part~="root"]')!;

    const pointer = (type: string) =>
      row.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          composed: true,
          isPrimary: true,
          pointerType: 'touch',
        }),
      );

    pointer('pointerover');
    pointer('pointerdown');
    pointer('pointerup');
    // WebKit's click follows the release after its tap delay — past the
    // 120ms hover-open delay.
    await settle(250);
    row.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true }),
    );
    await settle();
  };

  it('a tap on the row opens the submenu, and a second tap keeps it open', async () => {
    const m = await mountMenu(SUBMENU);

    await open(m);

    const parent = m.host.querySelector('c-menu-item')!;

    const panel = submenuPanel(parent);

    await tap(parent);

    expect(panel.matches(':popover-open'), 'first tap opens').toBe(true);

    await tap(parent);

    expect(panel.matches(':popover-open'), 'second tap keeps it open').toBe(
      true,
    );
    expect(m.host.querySelector('c-menu-item')!.closest('c-menu')).toBe(m.host);
  });

  it('a tap opens the submenu even after a hover-open and after a stale open record', async () => {
    const m = await mountMenu(SUBMENU);

    await open(m);

    const parent = m.host.querySelector('c-menu-item')!;

    const panel = submenuPanel(parent);

    // A mouse hovers the row: the submenu hover-opens.
    parent.dispatchEvent(
      new PointerEvent('pointerover', {
        bubbles: true,
        composed: true,
        pointerType: 'mouse',
      }),
    );
    await settle(250);

    expect(panel.matches(':popover-open'), 'mouse hover-opens').toBe(true);

    await tap(parent);

    expect(panel.matches(':popover-open'), 'the tap does not close it').toBe(
      true,
    );

    // The panel goes away behind the controller's back (a consumer's
    // hidePopover, a browser-initiated close): the record must not turn the
    // next tap into a close.
    panel.hidePopover();
    await settle();

    await tap(parent);

    expect(
      panel.matches(':popover-open'),
      'a tap after an untracked close opens',
    ).toBe(true);
  });

  it('a tap opens the submenu: touch never hover-opens, so the click toggles it open', async () => {
    const m = await mountMenu(SUBMENU);

    await open(m);

    const parent = m.host.querySelector('c-menu-item')!;

    const panel = parent.shadowRoot!.querySelector('[part~="submenu-panel"]')!;

    parent.dispatchEvent(
      new PointerEvent('pointerover', {
        bubbles: true,
        composed: true,
        pointerType: 'touch',
      }),
    );
    // Past the hover-open delay (120ms), where the tap's click lands.
    await settle(250);

    expect(panel.matches(':popover-open'), 'no hover-open on touch').toBe(
      false,
    );

    parent.click();
    await settle();

    expect(panel.matches(':popover-open')).toBe(true);
  });

  it('the submenu flips to the left of its row when the right has no room', async () => {
    const m = await mountMenu(SUBMENU);

    m.stage.style.cssText += ';position:fixed;top:0;right:0';
    await open(m);

    const parent = m.host.querySelector('c-menu-item')!;

    parent.click();
    await settle();
    await settle();

    const panel = submenuPanel(parent);

    expect(panel.matches(':popover-open')).toBe(true);

    for (const a of document.getAnimations()) a.finish();

    const sub = rect(panel.querySelector('[part~="submenu-list"]')!);

    const row = rect(parent.shadowRoot!.querySelector('[part~="root"]')!);

    expect(sub.width).toBeGreaterThan(0);
    expect(sub.right, 'left of its row').toBeLessThanOrEqual(row.left);
    expect(sub.left, 'inside the viewport').toBeGreaterThanOrEqual(0);
  });

  // A phone: the menu spans most of the viewport, so neither side of the
  // row has room for the submenu. Pinned to the right it rendered entirely
  // off screen — "the submenu does not open".
  it('on a narrow viewport the submenu drops below its row and stays on screen', async () => {
    await page.viewport(360, 640);

    try {
      const m = await mountMenu(
        '<c-menu-item value="p">Export the current report as a document<c-menu-item slot="submenu" value="s">Portable document (PDF)</c-menu-item><c-menu-item slot="submenu" value="t">Word document (DOCX)</c-menu-item></c-menu-item>',
      );

      await open(m);

      const parent = m.host.querySelector('c-menu-item')!;

      await tap(parent);

      const panel = submenuPanel(parent);

      expect(panel.matches(':popover-open')).toBe(true);

      const sub = rect(panel.querySelector('[part~="submenu-list"]')!);

      const row = rect(parent);

      expect(sub.left, 'inside the viewport').toBeGreaterThanOrEqual(0);
      expect(sub.right, 'inside the viewport').toBeLessThanOrEqual(360);
      expect(sub.width).toBeGreaterThan(0);
      expect(sub.top, 'below its row').toBeGreaterThanOrEqual(row.bottom - 1);
    } finally {
      await page.viewport(1280, 800);
    }
  });
});

describe('ink', () => {
  // The `list` part paints `bg-surface-overlay` and projects into it. A
  // c-menu-item declares its own ink, so only content slotted BESIDE the items
  // was exposed to the ink resolved outside the scope (ADR-0053).
  it('re-inks content slotted beside its items when the menu pins its own mode', async () => {
    setThemeMode('dark');

    const m = await mount('c-menu', {
      attrs: { 'data-theme': 'light' },
      html: `${TRIGGER}<span>Recent projects</span>${items(2)}`,
    });

    await open(m);
    await settled();

    const note = m.host.querySelector('span')!;

    expect(getComputedStyle(note).color, 'slotted note').toBe(
      roleInMode('light'),
    );
    expect(getComputedStyle(note).color).not.toBe(roleInMode('dark'));
  });
});

// The menu-button pattern: closing the menu with a pick or Escape puts focus
// back on the trigger, ringed after a key. A csc-ui button's host renders no
// box of its own, so its button must take it, or focus falls to the page.
describe('focus return', () => {
  const TRIGGERS: Record<string, string> = {
    '<button>': '<button slot="trigger">Menu</button>',
    'c-button': '<c-button slot="trigger">Menu</c-button>',
    'c-icon-button': `<c-icon-button slot="trigger" aria-label="Menu" path="${mdiDotsVertical}"></c-icon-button>`,
  };

  const ITEMS =
    '<c-menu-item value="a">A</c-menu-item><c-menu-item value="b">B</c-menu-item>';

  /** What takes a trigger's focus: a native button, or a csc-ui host's own button. */
  const controlOf = (trigger: HTMLElement): HTMLElement =>
    trigger.shadowRoot?.querySelector<HTMLElement>('[part~="root"]') ?? trigger;

  const firstItem = (m: Mounted): HTMLElement =>
    m.host.querySelector('c-menu-item')!;

  const openFromKeyboard = async (
    m: Mounted,
    control: HTMLElement,
  ): Promise<void> => {
    control.focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement).toBe(firstItem(m));
  };

  const openFromPointer = async (
    m: Mounted,
    control: HTMLElement,
  ): Promise<void> => {
    await userEvent.click(control);
    await expect.poll(() => document.activeElement).toBe(firstItem(m));
  };

  /** Each way to close: the name, the gesture, and whether it is a key. */
  const CLOSES: [string, (m: Mounted) => Promise<void>, boolean][] = [
    ['an Enter pick', () => userEvent.keyboard('{Enter}'), true],
    ['a Space pick', () => userEvent.keyboard(' '), true],
    ['a click pick', (m) => userEvent.click(firstItem(m)), false],
    ['Escape', () => userEvent.keyboard('{Escape}'), true],
  ];

  /** Close the open menu, then where focus went and how it was asked. */
  const closeAndRead = async (
    m: Mounted,
    close: () => Promise<void>,
  ): Promise<{ options: FocusOptions | undefined }> => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');

    try {
      await close();
      await expect
        .poll(() => m.part('panel').matches(':popover-open'))
        .toBe(false);
      await settle();

      return { options: focus.mock.lastCall?.[0] };
    } finally {
      focus.mockRestore();
    }
  };

  describe.each(Object.entries(TRIGGERS))('%s trigger', (_, html) => {
    it.each(CLOSES)('%s returns focus to it', async (way, close, key) => {
      const m = await mount('c-menu', { html: `${html}${ITEMS}` });

      const trigger = m.host.querySelector<HTMLElement>('[slot="trigger"]')!;

      const control = controlOf(trigger);

      const events = recordEvents(m.host, ['select']);

      await (key ? openFromKeyboard : openFromPointer)(m, control);

      const { options } = await closeAndRead(m, () => close(m));

      expect(document.activeElement).toBe(trigger);
      expect(trigger.shadowRoot?.activeElement ?? trigger).toBe(control);
      expect(events.names()).toEqual(way === 'Escape' ? [] : ['select']);

      // A key asks for the ring (Firefox and Safari keep a mouse focus
      // through a script focus); a pointer pick leaves it to the browser.
      expect(options?.focusVisible).toBe(key ? true : undefined);
      expect(control.matches(':focus-visible')).toBe(key);
      m.unmount();
    });
  });

  it('Escape returns focus to a designated c-icon-button', async () => {
    const trigger = document.createElement('c-icon-button');

    trigger.id = 'menu-trigger';
    trigger.setAttribute('aria-label', 'Menu');
    trigger.setAttribute('path', mdiDotsVertical);
    document.body.append(trigger);

    const m = await mount('c-menu', {
      html: ITEMS,
      props: { trigger: 'menu-trigger' },
    });

    try {
      const control = controlOf(trigger);

      await openFromKeyboard(m, control);

      const { options } = await closeAndRead(m, () =>
        userEvent.keyboard('{Escape}'),
      );

      expect(document.activeElement).toBe(trigger);
      expect(trigger.shadowRoot!.activeElement).toBe(control);
      expect(options?.focusVisible).toBe(true);
    } finally {
      m.unmount();
      trigger.remove();
    }
  });
});

// `open` is two-way: it follows the panel whoever opened or closed it, so a
// menu the user closed opens again when the page sets it once more.
describe('open property', () => {
  type MenuHost = { open: boolean } & HTMLElement;

  const panelOpen = (m: Mounted): boolean =>
    m.part('panel').matches(':popover-open');

  it('follows the panel, and a menu the user closed reopens on open = true', async () => {
    const m = await mountMenu(items(2));

    const host = m.host as MenuHost;

    await open(m);
    await expect.poll(() => panelOpen(m)).toBe(true);
    expect(host.open).toBe(true);
    await expect
      .poll(() => document.activeElement?.localName)
      .toBe('c-menu-item');

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => panelOpen(m)).toBe(false);
    expect(host.open).toBe(false);

    host.open = true;
    await expect.poll(() => panelOpen(m)).toBe(true);
    await expect
      .poll(() => document.activeElement?.localName)
      .toBe('c-menu-item');

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => host.open).toBe(false);

    host.open = true;
    await expect.poll(() => panelOpen(m)).toBe(true);
    m.unmount();
  });

  it('ArrowUp on the trigger still opens on the last item', async () => {
    const m = await mountMenu(items(3));

    m.host
      .querySelector('c-button')!
      .shadowRoot!.querySelector('button')!
      .focus();
    await userEvent.keyboard('{ArrowUp}');

    await expect
      .poll(() => document.activeElement)
      .toBe(m.host.querySelectorAll('c-menu-item')[2]);
    expect((m.host as MenuHost).open).toBe(true);
    m.unmount();
  });
});
