/**
 * Behaviour spec for c-data-table's autohide (CONTEXT.md "Autohide"). In a
 * box narrower than its content the table must move `auto` columns into the
 * expansion row until it fits, not scroll: it measured its columns from an
 * already-squeezed `width: 100%` layout, so their total always equalled the
 * box and nothing was ever hidden.
 */
import { describe, expect, it } from 'vitest';

import { mount, settled } from '../../test/harness';

const COLUMNS = [
  { header: 'Project', key: 'name', pinned: 'left' },
  { header: 'Owner', key: 'owner' },
  { header: 'Facility', key: 'facility' },
  { header: 'Quota', key: 'quota' },
  { header: 'Created', key: 'created' },
];

const DATA = [
  {
    created: '2026-01-14',
    facility: 'Puhti',
    name: 'Aurora',
    owner: 'aino.virtanen@example.fi',
    quota: '20 TB',
  },
  {
    created: '2026-02-02',
    facility: 'Mahti',
    name: 'Borealis',
    owner: 'eero.korhonen@example.fi',
    quota: '5 TB',
  },
];

describe('c-data-table autohide', () => {
  it('hides columns until the table fits a narrow box instead of scrolling it', async () => {
    const m = await mount('c-data-table', {
      attrs: { autohide: true },
      props: { columns: COLUMNS, data: DATA },
    });

    m.stage.style.cssText = 'display:block;padding:0;width:300px';
    await settled();
    await settled();

    const viewport = m.part('viewport');

    expect(viewport.scrollWidth, 'no horizontal scroll').toBeLessThanOrEqual(
      viewport.clientWidth + 1,
    );

    const headers = m
      .shadowAll('thead th[data-col]')
      .map((th) => th.getAttribute('data-col'));

    expect(
      headers.length,
      'some columns moved to the expansion row',
    ).toBeLessThan(COLUMNS.length + 1);
    expect(headers, 'the pinned column never hides').toContain('name');
  });

  it('shows every column when the box is wide enough', async () => {
    const m = await mount('c-data-table', {
      attrs: { autohide: true },
      props: { columns: COLUMNS, data: DATA },
    });

    m.stage.style.cssText = 'display:block;padding:0;width:900px';
    await settled();

    const keys = m
      .shadowAll('thead th[data-col]')
      .map((th) => th.getAttribute('data-col'));

    for (const col of COLUMNS) expect(keys).toContain(col.key);
  });
});
