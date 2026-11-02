/**
 * Behaviour spec for c-pagination: the range text ("1 - 10 of 100 items")
 * sits at the right edge of the details row beside the items-per-page
 * control while both fit; once the row is too narrow it takes its own row,
 * flush under the control. It used to keep a fixed right-aligned box there,
 * so it landed indented at a width-dependent offset.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';
import type { CPaginationOptions } from './CPagination.vue';

import {
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
} from '../../test/harness';

const mountPagination = async (width: number): Promise<Mounted> => {
  const m = await mount('c-pagination', {
    props: { value: { itemCount: 100, page: 1, pageSize: 10 } },
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

describe('c-pagination value (R3)', () => {
  type PaginationHost = { value: CPaginationOptions } & HTMLElement;

  const next = (m: Mounted) =>
    m.deep('c-icon-button[aria-label="Next page"]', 'button');

  it('emits nothing on mount or when the value is set, and never writes into it', async () => {
    const value: CPaginationOptions = { itemCount: 100, page: 2, pageSize: 10 };

    const m = await mount<PaginationHost>('c-pagination', { props: { value } });

    const events = recordEvents(m.host, ['change', 'input', 'update:value']);

    m.host.value = { itemCount: 100, page: 3, pageSize: 10 };
    await settle();

    expect(events.records).toEqual([]);
    expect(value).toEqual({ itemCount: 100, page: 2, pageSize: 10 });
    expect(m.shadow('[aria-current="page"]').textContent?.trim()).toBe('3');
  });

  it('emits a new value with the page, the page size and the item range', async () => {
    const value: CPaginationOptions = { itemCount: 100, page: 1, pageSize: 10 };

    const m = await mount<PaginationHost>('c-pagination', { props: { value } });

    const events = recordEvents(m.host, ['change']);

    await userEvent.click(next(m));
    await settle();

    const [detail] = events.records.map((r) => r.detail as CPaginationOptions);

    expect(detail).toEqual({
      endTo: 19,
      itemCount: 100,
      page: 2,
      pageSize: 10,
      startFrom: 10,
    });
    expect(detail).not.toBe(value);
    expect(value.page).toBe(1);
  });

  it('ends the last page’s range at the last item', async () => {
    const m = await mount<PaginationHost>('c-pagination', {
      props: { value: { itemCount: 95, page: 9, pageSize: 10 } },
    });

    const events = recordEvents(m.host, ['change']);

    await userEvent.click(next(m));
    await settle();

    expect(events.records.map((r) => r.detail)).toEqual([
      { endTo: 94, itemCount: 95, page: 10, pageSize: 10, startFrom: 90 },
    ]);
  });

  it('leaves the element’s classes off its nav, and its aria-label on', async () => {
    const m = await mount('c-pagination', {
      attrs: {
        'aria-label': 'Result pages',
        class: 'page-pager',
        simple: true,
        size: 'small',
      },
      props: { value: { itemCount: 100 } },
    });

    expect(m.part('root').className).not.toMatch(/page-pager|c-pagination/);
    // A host aria-label still names the navigation.
    expect(m.part('root').getAttribute('aria-label')).toBe('Result pages');
  });

  it('names the page buttons and the page-size button with their values', async () => {
    const m = await mount('c-pagination', {
      props: { value: { itemCount: 100, page: 1, pageSize: 25 } },
    });

    const inner = (el: Element): HTMLButtonElement =>
      el.shadowRoot!.querySelector('button')!;

    const pageButton = m
      .shadowAll('c-icon-button')
      .find((b) => b.textContent?.trim() === '2')!;

    expect(inner(pageButton).getAttribute('aria-label')).toBe('page 2 of 4');
    expect(m.shadowAll('ul span[aria-label]')).toEqual([]);

    const sizeButton = m.shadow('c-button[slot="trigger"]');

    expect(inner(sizeButton).getAttribute('aria-label')).toBe(
      'Items per page: 25',
    );
  });

  it('keeps its page-size menu’s select inside', async () => {
    const m = await mount<PaginationHost>('c-pagination', {
      props: { value: { itemCount: 100, pageSize: 25 } },
    });

    const page = recordEvents(document, ['select']);

    const changes = recordEvents(m.host, ['change']);

    await userEvent.click(m.deep('c-menu c-button', 'button'));
    await settle();
    await userEvent.click(m.shadow('c-menu-item[value="50"]') as HTMLElement);
    await settle();

    expect(
      changes.records.map((r) => (r.detail as CPaginationOptions).pageSize),
    ).toEqual([50]);
    expect(page.records).toEqual([]);
  });

  it('reads its texts from the texts prop', async () => {
    const m = await mount<PaginationHost>('c-pagination', {
      props: {
        texts: {
          nextPage: 'Seuraava sivu',
          range: (start: number, end: number, count: number) =>
            `${start}–${end} / ${count}`,
        },
        value: { itemCount: 100, page: 2, pageSize: 10 },
      },
    });

    expect(m.part('details').querySelector('span')!.textContent).toBe(
      '11–20 / 100',
    );
    expect(
      m.shadow('c-icon-button[aria-label="Seuraava sivu"]'),
    ).not.toBeNull();
  });
});
