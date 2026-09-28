/**
 * Behaviour spec for c-accordion and its items (CONTEXT.md "Accordion
 * frame", ADR-0058). Collapsed items stack flush into one hairline frame whose
 * run ends round off; an expanded item lifts out of it with its own outline,
 * wash and 8px margins, and the items either side close their runs.
 */
import { describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import {
  matchScreenshotInBothModes,
  mount,
  roleInMode,
  settle,
  settled,
} from '../../test/harness';

const HEADINGS = ['Billing', 'Members', 'Storage', 'Access'];

const ITEMS = HEADINGS.map(
  (h) =>
    `<c-accordion-item heading="${h}" value="${h.toLowerCase()}"><p>${h} content.</p></c-accordion-item>`,
).join('');

const mountAccordion = async (
  props: Record<string, unknown> = {},
): Promise<Mounted> => {
  const m = await mount('c-accordion', { html: ITEMS, props });

  m.stage.style.cssText = 'display:block;width:420px;padding:8px';
  await settled();

  return m;
};

const items = (m: Mounted): HTMLElement[] =>
  Array.from(m.host.querySelectorAll('c-accordion-item'));

const root = (item: HTMLElement): HTMLElement =>
  item.shadowRoot!.querySelector('[part~="root"]')!;

const style = (item: HTMLElement): CSSStyleDeclaration =>
  getComputedStyle(root(item));

const toggle = async (item: HTMLElement): Promise<void> => {
  item.shadowRoot!.querySelector('button')!.click();
  await settled();
};

const rounded = (s: CSSStyleDeclaration, edge: 'bottom' | 'top'): boolean =>
  parseFloat(
    edge === 'top' ? s.borderTopLeftRadius : s.borderBottomLeftRadius,
  ) > 0;

describe('c-accordion', () => {
  it('expands the item named by an initial value on HTML-authored items', async () => {
    const m = await mountAccordion({ value: 'members' });

    expect(items(m).map((i) => i.hasAttribute('expanded'))).toEqual([
      false,
      true,
      false,
      false,
    ]);
  });

  it('stacks collapsed items flush into one frame with rounded ends', async () => {
    const m = await mountAccordion();

    const all = items(m);

    const rects = all.map((i) => root(i).getBoundingClientRect());

    for (let i = 1; i < rects.length; i++) {
      expect(rects[i].top, `item ${i} is flush`).toBeCloseTo(
        rects[i - 1].bottom,
        0,
      );
    }

    // One hairline per shared edge: only the first item draws a top border.
    expect(all.map((i) => style(i).borderTopWidth)).toEqual([
      '1px',
      '0px',
      '0px',
      '0px',
    ]);
    expect(style(all[1]).borderLeftWidth).toBe('1px');

    expect(rounded(style(all[0]), 'top')).toBe(true);
    expect(rounded(style(all[0]), 'bottom')).toBe(false);
    expect(rounded(style(all[1]), 'top')).toBe(false);
    expect(rounded(style(all[3]), 'bottom')).toBe(true);
  });

  it('lifts an expanded item out of the frame and closes the runs either side', async () => {
    const m = await mountAccordion();

    const all = items(m);

    await toggle(all[1]);

    const lifted = style(all[1]);

    expect(lifted.marginTop).toBe('8px');
    expect(lifted.marginBottom).toBe('8px');
    expect(lifted.borderTopWidth).toBe('1px');
    expect(lifted.borderTopColor).toBe(roleInMode('light', '--c-primary'));
    expect(lifted.boxShadow).toContain('inset');
    expect(rounded(lifted, 'top') && rounded(lifted, 'bottom')).toBe(true);

    // The item above closes its run; the one below opens a new run.
    expect(rounded(style(all[0]), 'bottom')).toBe(true);
    expect(style(all[2]).borderTopWidth).toBe('1px');
    expect(rounded(style(all[2]), 'top')).toBe(true);

    // Collapsing it re-joins the frame.
    await toggle(all[1]);

    expect(style(all[1]).marginTop).toBe('0px');
    expect(rounded(style(all[0]), 'bottom')).toBe(false);
    expect(style(all[2]).borderTopWidth).toBe('0px');
  });

  it('keeps no margin above a first expanded item or between two expanded items', async () => {
    const m = await mountAccordion({ multiple: true });

    const all = items(m);

    await toggle(all[0]);
    await toggle(all[1]);

    expect(style(all[0]).marginTop).toBe('0px');
    expect(style(all[1]).marginTop).toBe('0px');
    expect(style(all[0]).marginBottom).toBe('8px');
  });

  it('frames an item added after mount', async () => {
    const m = await mountAccordion();

    const extra = document.createElement('c-accordion-item');

    extra.setAttribute('heading', 'Extra');
    extra.setAttribute('value', 'extra');
    m.host.append(extra);
    await settle();
    await settled();

    const all = items(m);

    expect(rounded(style(all[3]), 'bottom')).toBe(false);
    expect(rounded(style(extra), 'bottom')).toBe(true);
  });

  it('squares the header wash off at the bottom of an expanded item', async () => {
    const m = await mountAccordion({ value: 'members' });

    const [first, open] = items(m);

    const header = (item: HTMLElement): CSSStyleDeclaration =>
      getComputedStyle(item.shadowRoot!.querySelector('button')!);

    // A collapsed end item's wash follows the frame's rounded corner.
    expect(rounded(header(first), 'top')).toBe(true);
    // An expanded item's wash stops above the content card, square.
    expect(rounded(header(open), 'top')).toBe(true);
    expect(rounded(header(open), 'bottom')).toBe(false);
  });

  it('outlines only expanded items when outlined', async () => {
    const m = await mountAccordion({
      multiple: true,
      outlined: true,
      value: ['billing'],
    });

    const [open, closed] = items(m);

    // No ring inside a collapsed item's hairline (read as a double border).
    expect(style(closed).boxShadow).toBe('none');
    expect(style(open).boxShadow).toContain(roleInMode('light', '--c-primary'));
  });

  it('visual: collapsed frame and an expanded item', async () => {
    const m = await mountAccordion({ value: 'members' });

    await matchScreenshotInBothModes(m.stage, 'frame-expanded');
  });
});
