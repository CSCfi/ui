/**
 * Behaviour spec for c-pagination: the range text ("1 - 10 of 100 items")
 * sits at the right edge of the details row beside the items-per-page
 * control while both fit; once the row is too narrow it takes its own row,
 * flush under the control. It used to keep a fixed right-aligned box there,
 * so it landed indented at a width-dependent offset.
 */
import { describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

const mountPagination = async (width: number): Promise<Mounted> => {
  const m = await mount('c-pagination', {
    props: { value: { currentPage: 1, itemCount: 100, itemsPerPage: 10 } },
  });

  m.stage.style.cssText = `display:block;padding:8px;width:${width}px`;
  await settled();

  return m;
};

const range = (m: Mounted): DOMRect =>
  m.part('details').querySelector('span')!.getBoundingClientRect();

describe('c-pagination details', () => {
  it('keep the range at the right edge beside items-per-page while both fit', async () => {
    const m = await mountPagination(900);

    const perPage = m.part('items-per-page').getBoundingClientRect();

    const details = m.part('details').getBoundingClientRect();

    const r = range(m);

    expect(Math.abs(r.right - details.right)).toBeLessThanOrEqual(1);
    expect(Math.round(r.top)).toBeGreaterThanOrEqual(
      Math.round(perPage.top) - 1,
    );
    expect(Math.round(r.bottom)).toBeLessThanOrEqual(
      Math.round(perPage.bottom) + 1,
    );
  });

  it('put the range flush under items-per-page when the row is too narrow', async () => {
    const m = await mountPagination(300);

    const perPage = m.part('items-per-page').getBoundingClientRect();

    const r = range(m);

    expect(r.top, 'own row').toBeGreaterThanOrEqual(perPage.bottom);
    expect(Math.abs(r.left - perPage.left), 'flush left').toBeLessThanOrEqual(
      1,
    );
  });

  it('visual: narrow', async () => {
    const m = await mountPagination(300);

    await matchScreenshotInBothModes(m.stage, 'narrow');
  });
});
