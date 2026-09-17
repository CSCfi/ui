/**
 * Behaviour spec for c-menu (CONTEXT.md "Menu", "Peek"; ADR-0008/0043).
 * Seeded from 8ef62d16: menus showed scrollbars, ended mid-boundary, and
 * measured their rows with a hard-coded height.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settle } from '../../test/harness';

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

  it('the submenu panel can flip to the other side when the right has no room', async () => {
    const m = await mountMenu(SUBMENU);

    await open(m);

    const panel = submenuPanel(m.host.querySelector('c-menu-item')!);

    expect(
      getComputedStyle(panel).getPropertyValue('position-try-fallbacks'),
    ).toContain('flip-inline');
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

      const sub = rect(panel.querySelector('[part~="submenu"]')!);

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
