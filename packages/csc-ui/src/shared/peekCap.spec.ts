/**
 * The peek (CONTEXT.md, ADR-0043) measured on real boxes. Seeded from
 * 8ef62d16: a hard-coded row height broke menus that mix items, labels and
 * dividers.
 */
import { describe, expect, it } from 'vitest';

import { applyPeekCap, peekCap } from './peekCap';

interface Fixture {
  list: HTMLUListElement;
  rows: HTMLElement[];
}

/** A list of `heights` px rows; entries prefixed `label:` are not rows (labels / dividers). */
const build = (
  heights: Array<`label:${number}` | number>,
  listStyle = '',
): Fixture => {
  const list = document.createElement('ul');

  list.style.cssText = `margin:0;padding:0;list-style:none;overflow-y:auto;width:200px;${listStyle}`;

  const rows: HTMLElement[] = [];

  for (const h of heights) {
    const li = document.createElement('li');

    const isLabel = typeof h === 'string';

    const height = isLabel ? Number(h.slice(6)) : h;

    li.style.cssText = `height:${height}px;margin:0;padding:0`;
    li.textContent = isLabel ? 'label' : 'row';
    list.append(li);

    if (!isLabel) rows.push(li);
  }

  document.body.append(list);

  return { list, rows };
};

const midpoint = (list: HTMLElement, row: HTMLElement): number => {
  const origin =
    list.getBoundingClientRect().top + list.clientTop - list.scrollTop;

  const r = row.getBoundingClientRect();

  return r.top - origin + r.height / 2;
};

describe('peekCap', () => {
  it('returns null when the content fits and no row cap applies', () => {
    const { list, rows } = build([40, 40, 40]);

    expect(peekCap(list, { rows })).toBeNull();
    expect(peekCap(list, { itemsPerPage: 5, rows })).toBeNull();
  });

  it('ends the list at the midpoint of the row after items-per-page', () => {
    const { list, rows } = build([40, 40, 40, 40, 40, 40, 40, 40]);

    expect(peekCap(list, { itemsPerPage: 3, rows })).toBe(
      Math.round(midpoint(list, rows[3])),
    );
    expect(peekCap(list, { itemsPerPage: 3, rows })).toBe(140);
  });

  it('snaps to the last row midpoint under the ceiling, never to a label or divider', () => {
    const { list, rows } = build([
      40,
      'label:24',
      40,
      40,
      'label:1',
      40,
      40,
      40,
    ]);

    // Ceiling lands inside the 1px divider region → cap on the row above it.
    const cap = peekCap(list, { ceiling: 150, rows });

    const candidates = rows
      .map((row) => midpoint(list, row))
      .filter((m) => m <= 150);

    expect(cap).toBe(Math.round(Math.max(...candidates)));
  });

  it('converts between the content box and a border-box max-height', () => {
    const contentBox = build(
      [40, 40, 40, 40, 40],
      'padding:4px 0;border:2px solid black;box-sizing:content-box',
    );

    const borderBox = build(
      [40, 40, 40, 40, 40],
      'padding:4px 0;border:2px solid black;box-sizing:border-box',
    );

    const contentCap = peekCap(contentBox.list, {
      itemsPerPage: 2,
      rows: contentBox.rows,
    })!;

    const borderCap = peekCap(borderBox.list, {
      itemsPerPage: 2,
      rows: borderBox.rows,
    })!;

    // Same client-box cap: content-box subtracts the padding, border-box adds the border.
    expect(borderCap - contentCap).toBe(2 * 2 + 2 * 4);
  });

  it('applyPeekCap reads the stylesheet ceiling, not a stale inline cap', () => {
    const { list, rows } = build([40, 40, 40, 40, 40, 40, 40, 40]);

    const sheet = document.createElement('style');

    list.id = 'peek-list';
    sheet.textContent = '#peek-list { max-height: 130px }';
    document.body.append(sheet);
    list.style.maxHeight = '50px';

    applyPeekCap(list, { rows });

    // Ceiling 130 → the last row midpoint under it (row 2 at 100px), not 50px.
    expect(list.style.maxHeight).toBe('100px');

    for (const row of rows.slice(2)) row.remove();

    applyPeekCap(list, { rows: rows.slice(0, 2) });
    expect(list.style.maxHeight, 'cleared when nothing overflows').toBe('');
  });
});
