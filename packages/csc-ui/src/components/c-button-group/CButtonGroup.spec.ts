/**
 * Behaviour spec for c-button-group (CONTEXT.md "Button group", "Track").
 * The track is a grid of equal columns at the longest label's width; when
 * the track is narrower than one row of them the buttons flow onto further
 * rows — they used to overflow their single-row grid cells and paint over
 * each other.
 */
import { describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

const LABELS = ['Day', 'Week', 'Month', 'Quarter', 'Year'];

const BUTTONS = LABELS.map(
  (label) => `<c-button value="${label.toLowerCase()}">${label}</c-button>`,
).join('');

const mountGroup = async (stageCss: string): Promise<Mounted> => {
  const m = await mount('c-button-group', {
    html: BUTTONS,
    props: { value: 'week' },
  });

  m.stage.style.cssText = `padding:8px;${stageCss}`;
  // Two frames for the group's driving pass plus the column measurement.
  await settled();

  return m;
};

/** The native controls' boxes, in DOM order. */
const boxes = (m: Mounted): DOMRect[] =>
  Array.from(m.host.querySelectorAll('c-button')).map((b) =>
    b.shadowRoot!.querySelector('button')!.getBoundingClientRect(),
  );

const overlaps = (a: DOMRect, b: DOMRect): boolean =>
  a.left < b.right - 0.5 &&
  b.left < a.right - 0.5 &&
  a.top < b.bottom - 0.5 &&
  b.top < a.bottom - 0.5;

const rows = (rects: DOMRect[]): number =>
  new Set(rects.map((r) => Math.round(r.top))).size;

const expectEqualWidths = (rects: DOMRect[]): void => {
  const widths = rects.map((r) => Math.round(r.width));

  expect(new Set(widths).size, `equal columns, got ${widths.join(', ')}`).toBe(
    1,
  );
};

const expectInsideTrack = (m: Mounted, rects: DOMRect[]): void => {
  const track = m.part('root').getBoundingClientRect();

  for (const r of rects) {
    expect(r.left).toBeGreaterThanOrEqual(track.left);
    expect(r.right).toBeLessThanOrEqual(track.right + 0.5);
    expect(r.bottom).toBeLessThanOrEqual(track.bottom + 0.5);
  }

  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      expect(
        overlaps(rects[i], rects[j]),
        `${LABELS[i]} and ${LABELS[j]} paint over each other`,
      ).toBe(false);
    }
  }
};

describe('c-button-group', () => {
  it('wraps onto further rows of equal columns when the track is narrower than one row', async () => {
    const m = await mountGroup('display:block;width:260px');

    const rects = boxes(m);

    expectInsideTrack(m, rects);
    expect(rows(rects)).toBeGreaterThanOrEqual(2);
    expectEqualWidths(rects);
    expect(
      m.part('root').getBoundingClientRect().height,
      'the track grows with the rows',
    ).toBeGreaterThan(rects[0].height * 2);
  });

  it('wraps just the same when a flex row squeezes it', async () => {
    const m = await mountGroup('display:flex;width:260px');

    const rects = boxes(m);

    expectInsideTrack(m, rects);
    expect(rows(rects)).toBeGreaterThanOrEqual(2);
    expectEqualWidths(rects);
  });

  it('shares a wide track as one row of equal columns', async () => {
    const m = await mountGroup('display:block;width:640px');

    const rects = boxes(m);

    expectInsideTrack(m, rects);
    expect(rows(rects)).toBe(1);
    expectEqualWidths(rects);
    expect(m.part('root').getBoundingClientRect().width, 'fills the box').toBe(
      640,
    );
  });

  it('keeps its natural one-row width in a shrink-to-fit context', async () => {
    const m = await mountGroup('display:inline-block');

    const rects = boxes(m);

    expectInsideTrack(m, rects);
    expect(rows(rects)).toBe(1);
    expectEqualWidths(rects);

    // Every column is at least the longest label (`Quarter`) — the column
    // width the group measured — and the track is exactly one row of them.
    const longest = rects[3];

    for (const r of rects)
      expect(r.width).toBeGreaterThanOrEqual(longest.width - 0.5);

    const track = m.part('root').getBoundingClientRect();

    expect(track.width).toBeLessThan(rects[0].width * LABELS.length + 40);
  });

  it('visual: one row and wrapped', async () => {
    const one = await mountGroup('display:inline-block');

    await matchScreenshotInBothModes(one.stage, 'default');
    one.unmount();

    const wrapped = await mountGroup('display:block;width:260px');

    await matchScreenshotInBothModes(wrapped.stage, 'wrapped');
  });
});
