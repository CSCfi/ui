/**
 * Behaviour spec for c-tab-buttons (CONTEXT.md "Tab buttons", "Sliding
 * indicator"). A tab strip is always one row: wider than its box it scrolls
 * sideways behind edge arrows, the active tab is brought into view and the
 * sliding indicator follows it through the scroller — the buttons used to
 * overflow their grid cells and paint over each other.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import {
  matchScreenshotInBothModes,
  mount,
  settle,
  settled,
} from '../../test/harness';

const LABELS = [
  'Overview',
  'Members',
  'Settings',
  'Billing',
  'Integrations',
  'Audit log',
];

const BUTTONS = LABELS.map(
  (label) =>
    `<c-button value="${label.toLowerCase().replace(' ', '-')}">${label}</c-button>`,
).join('');

type TabButtonsHost = { value: number | string } & HTMLElement;

const mountStrip = async (width: number): Promise<Mounted<TabButtonsHost>> => {
  const m = await mount<TabButtonsHost>('c-tab-buttons', {
    html: BUTTONS,
    props: { value: 'overview' },
  });

  m.stage.style.cssText = `display:block;padding:8px;width:${width}px`;
  await settled();

  return m;
};

const boxes = (m: Mounted): DOMRect[] =>
  Array.from(m.host.querySelectorAll('c-button')).map((b) =>
    b.shadowRoot!.querySelector('button')!.getBoundingClientRect(),
  );

const scroller = (m: Mounted): HTMLElement =>
  m.part('root').firstElementChild as HTMLElement;

const activeBox = (m: Mounted): DOMRect =>
  m.host
    .querySelector('c-button[active]')!
    .shadowRoot!.querySelector('button')!
    .getBoundingClientRect();

const expectIndicatorUnderActive = (m: Mounted): void => {
  const pill = m.part('indicator').getBoundingClientRect();

  const active = activeBox(m);

  expect(Math.abs(pill.left - active.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(pill.width - active.width)).toBeLessThanOrEqual(1);
};

describe('c-tab-buttons', () => {
  it('stays one row and scrolls sideways behind edge arrows when it does not fit', async () => {
    const m = await mountStrip(320);

    const rects = boxes(m);

    expect(new Set(rects.map((r) => Math.round(r.top))).size, 'one row').toBe(
      1,
    );

    for (let i = 1; i < rects.length; i++) {
      expect(
        rects[i].left,
        `${LABELS[i]} paints over ${LABELS[i - 1]}`,
      ).toBeGreaterThanOrEqual(rects[i - 1].right - 0.5);
    }

    const box = scroller(m);

    expect(box.scrollWidth).toBeGreaterThan(box.clientWidth);
    expect(m.part('scroll-back').hasAttribute('disabled')).toBe(true);
    expect(m.part('scroll-forward').hasAttribute('disabled')).toBe(false);
    expectIndicatorUnderActive(m);

    // The arrow's host is `display: contents`; click its native button.
    await userEvent.click(
      m.part('scroll-forward').shadowRoot!.querySelector('button')!,
    );
    await settled();

    expect(box.scrollLeft).toBeGreaterThan(0);
    expect(m.part('scroll-back').hasAttribute('disabled')).toBe(false);
    expectIndicatorUnderActive(m);
  });

  it('brings the tab c-tabs makes active into view, scrolling the strip and not the page', async () => {
    const m = await mountStrip(320);

    const box = scroller(m);

    const pageY = window.scrollY;

    m.host.value = 'audit-log';
    await settled();
    await settle(400);

    const outer = box.getBoundingClientRect();

    const active = activeBox(m);

    expect(active.right).toBeLessThanOrEqual(outer.right + 0.5);
    expect(active.left).toBeGreaterThanOrEqual(outer.left - 0.5);
    expect(box.scrollLeft).toBeGreaterThan(0);
    expect(window.scrollY).toBe(pageY);
    expectIndicatorUnderActive(m);
  });

  it('fills a wide box as one row of equal columns with no arrows', async () => {
    const m = await mountStrip(900);

    const rects = boxes(m);

    expect(new Set(rects.map((r) => Math.round(r.width))).size).toBe(1);
    expect(scroller(m).scrollWidth).toBe(scroller(m).clientWidth);
    expect(m.shadowAll('[part~="scroll-forward"]')).toHaveLength(0);
    expectIndicatorUnderActive(m);
  });

  it('visual: overflowing strip', async () => {
    const m = await mountStrip(320);

    await matchScreenshotInBothModes(m.stage, 'overflow');
  });
});
