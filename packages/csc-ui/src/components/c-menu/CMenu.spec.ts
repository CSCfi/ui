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
