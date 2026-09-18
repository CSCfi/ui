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
  wrap,
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

  it('scrolls inside c-tabs too: the strip is squeezed to the tab row, not clipped by it', async () => {
    // The consumer's authoring: c-tabs slots the strip into its own tab row.
    // That row is allowed to outgrow its clipping viewport (the underlined
    // c-tab row scrolls by transform), so without a buttons-mode rule the
    // one-row strip pushed the row wide, the frame was clipped at the
    // viewport edge and the inner scroller never saw an overflow — the
    // Android report: no arrows, no touch panning, the last tab cut off.
    const tabs = await mount('c-tabs', {
      html: `<c-tab-buttons>${BUTTONS}</c-tab-buttons><c-tab-items slot="items">${LABELS.map(
        (l) =>
          `<c-tab-item value="${l.toLowerCase().replace(' ', '-')}"><p>${l}</p></c-tab-item>`,
      ).join('')}</c-tab-items>`,
      props: { value: 'overview' },
    });

    tabs.stage.style.cssText = 'display:block;padding:8px;width:320px';
    await settled();

    const strip = tabs.host.querySelector<HTMLElement>('c-tab-buttons')!;

    const m = wrap(strip, tabs.stage);

    const box = scroller(m);

    const frame = m.part('root').getBoundingClientRect();

    const row = tabs.host.getBoundingClientRect();

    expect(frame.right, 'frame clipped by the tab row').toBeLessThanOrEqual(
      row.right + 0.5,
    );
    expect(box.scrollWidth).toBeGreaterThan(box.clientWidth);
    expect(m.part('scroll-forward').hasAttribute('disabled')).toBe(false);

    // Touch panning is the browser's own: a scrolled strip must move the
    // buttons with it, not the page.
    box.scrollLeft = 80;
    await settled();

    expect(box.scrollLeft).toBeGreaterThan(0);
    expect(m.part('scroll-back').hasAttribute('disabled')).toBe(false);
    expectIndicatorUnderActive(m);
  });

  it('visual: overflowing strip', async () => {
    const m = await mountStrip(320);

    await matchScreenshotInBothModes(m.stage, 'overflow');
  });
});
