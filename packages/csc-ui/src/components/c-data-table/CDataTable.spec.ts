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

describe('c-data-table selection and query (decisions #19, #20)', () => {
  type TableHost = {
    query?: string;
    selectedRows: Record<string, unknown>[];
  } & HTMLElement;

  const mountTable = (props: Record<string, unknown> = {}) =>
    mount<TableHost>('c-data-table', {
      props: {
        columns: COLUMNS,
        data: DATA,
        getRowId: (row: { name: string }) => row.name,
        ...props,
      },
    });

  it('change:selected carries the selected ids; selectedRows the rows', async () => {
    const m = await mountTable({ selection: 'multiple' });
    await settled();

    const ids: unknown[] = [];
    m.host.addEventListener('change:selected', (e) =>
      ids.push((e as CustomEvent).detail),
    );

    const checkbox = m.shadowAll('tr[part~="row"] c-checkbox')[1];

    checkbox.shadowRoot!.querySelector('input')!.click();
    await settled();

    expect(ids).toEqual([['Borealis']]);
    expect(m.host.selectedRows.map((row) => row.name)).toEqual(['Borealis']);
  });

  it('query filters the rows across every column', async () => {
    const m = await mountTable({ query: 'mahti' });
    await settled();

    expect(m.shadowAll('tr[part~="row"]')).toHaveLength(1);
  });
});

describe('c-data-table sorting', () => {
  it('announces a sort only on a column that sorts', async () => {
    const m = await mount('c-data-table', {
      props: {
        columns: [
          { header: 'Project', key: 'name' },
          { header: 'Owner', key: 'owner', sortable: true },
        ],
        data: DATA,
        sort: { column: 'name', direction: 'desc' },
      },
    });
    await settled();

    // The rows keep their order: a column that does not sort is never sorted.
    expect(m.shadow('th[data-col="name"]').hasAttribute('aria-sort')).toBe(
      false,
    );

    (m.host as { sort?: unknown } & HTMLElement).sort = {
      column: 'owner',
      direction: 'asc',
    };
    await settled();

    expect(m.shadow('th[data-col="owner"]').getAttribute('aria-sort')).toBe(
      'ascending',
    );
  });
});

describe('c-data-table for assistive technology', () => {
  const mountTable = (props: Record<string, unknown> = {}) =>
    mount('c-data-table', {
      props: {
        columns: COLUMNS,
        data: DATA,
        expandedContent: () => 'More',
        getRowId: (row: { name: string }) => row.name,
        selection: 'multiple',
        ...props,
      },
    });

  it('announces the selection banner from a status region that is always there', async () => {
    // A full page with more rows beyond it shows the banner.
    const m = await mountTable({ pageSize: 1 });
    await settled();

    const status = m.shadow('[role="status"]');

    expect(status.textContent?.trim()).toBe('');

    m.shadowAll('thead c-checkbox')[0]!
      .shadowRoot!.querySelector('input')!
      .click();
    await settled();

    const message = m.part('banner').querySelector('span')!.textContent!.trim();

    expect(m.shadow('[role="status"]')).toBe(status);
    expect(message).not.toBe('');
    expect(status.textContent?.trim()).toBe(message);
  });

  it('is busy while loading', async () => {
    const m = await mountTable({ loading: true });
    await settled();

    expect(m.part('table').getAttribute('aria-busy')).toBe('true');

    (m.host as { loading?: boolean } & HTMLElement).loading = false;
    await settled();

    expect(m.part('table').hasAttribute('aria-busy')).toBe(false);
  });

  it('names each row’s checkbox and expander after the row', async () => {
    const m = await mountTable();
    await settled();

    const [first] = m.shadowAll('tbody tr[part~="row"]');

    expect(first!.querySelector('c-checkbox')!.getAttribute('aria-label')).toBe(
      'Select Aurora',
    );
    expect(
      first!.querySelector('c-icon-button')!.getAttribute('aria-label'),
    ).toBe('Details of Aurora');
  });
});
