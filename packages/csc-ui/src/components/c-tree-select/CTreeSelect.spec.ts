/**
 * Behaviour spec for c-tree-select (CONTEXT.md "Tree select", "Stepped
 * listbox", "Breadcrumb", "Browse" / "Search", "Select-branch row";
 * ADR-0047). The committed form of the 127-check smoke run that verified the
 * component on 2026-09-11.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type TreeHost = { value: unknown } & HTMLElement;

const leaf = (value: string, name: string) => ({ code: value, name, value });

const TREE = [
  {
    children: [
      {
        children: [
          leaf('1111', 'Pure mathematics'),
          leaf('1112', 'Applied mathematics'),
        ],
        ...leaf('111', 'Mathematics'),
      },
      {
        children: [leaf('1131', 'Computer science')],
        ...leaf('113', 'Computer sciences'),
      },
    ],
    ...leaf('1', 'Natural sciences'),
  },
  {
    children: [
      {
        children: [
          leaf('2111', 'Urban planning'),
          leaf('2112', 'Landscape'),
          leaf('2113', 'Interiors'),
          leaf('2114', 'Structures'),
        ],
        ...leaf('211', 'Architecture'),
      },
    ],
    ...leaf('2', 'Engineering'),
  },
  {
    children: [{ children: [leaf('3111', 'Deep')], ...leaf('311', 'Hidden') }],
    disabled: true,
    ...leaf('3', 'Disabled root'),
  },
];

const LEVELS = ['Primary field', 'Secondary field', 'Tertiary field'];

const mountTree = (
  props: Record<string, unknown> = {},
  items: unknown[] = TREE,
) =>
  mount<TreeHost>('c-tree-select', {
    props: { items, label: 'Field of science', levelLabels: LEVELS, ...props },
  });

const combobox = (m: Mounted): HTMLInputElement =>
  m.shadow('input[role="combobox"]');

const search = (m: Mounted): HTMLInputElement =>
  m.shadow('[part~="search"] input');

const rows = (m: Mounted): HTMLElement[] => m.shadowAll('li[part~="item"]');

const crumbs = (m: Mounted): HTMLElement[] =>
  m.shadowAll('button[part~="crumb"]');

const header = (m: Mounted): string =>
  Array.from(m.part('header').children)
    .map((c) => c.textContent?.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(m.shadow('c-input'));
  await settle();
};

const clickRow = async (m: Mounted, index: number): Promise<void> => {
  await userEvent.click(rows(m)[index]);
  await settle();
};

describe('opening', () => {
  it.each([
    ['click', async (m: Mounted) => userEvent.click(m.shadow('c-input'))],
    ['ArrowDown', async () => userEvent.keyboard('{ArrowDown}')],
    ['Enter', async () => userEvent.keyboard('{Enter}')],
    ['Space', async () => userEvent.keyboard(' ')],
  ])('opens on %s but not on bare focus', async (_, openVia) => {
    const m = await mountTree();

    combobox(m).focus();
    await settle();

    expect(isOpen(m)).toBe(false);

    await openVia(m);
    await settle();

    expect(isOpen(m)).toBe(true);
  });
});

describe('browse', () => {
  it('shows one level at a time with a breadcrumb and a step counter', async () => {
    const m = await mountTree();

    await open(m);

    expect(rows(m)).toHaveLength(3);
    expect(
      rows(m)[0].querySelector('[part~="code"]')?.textContent?.trim(),
    ).toBe('1');
    expect(rows(m)[0].textContent).toMatch(/2 options/);
    expect(header(m)).toBe('Choose Primary field Step 1 of 3');
    expect(crumbs(m).map((c) => c.textContent?.trim())).toEqual(['All']);

    await clickRow(m, 0);

    expect(rows(m)).toHaveLength(2);
    expect(header(m)).toBe('Choose Secondary field Step 2 of 3');
    expect(crumbs(m).map((c) => c.textContent?.trim())).toEqual([
      'All',
      'Natural sciences',
    ]);
    expect(crumbs(m)[1].getAttribute('aria-current')).toBe('location');
    expect((crumbs(m)[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it('commits a leaf: events, close, focus return and the closed-field format', async () => {
    const m = await mountTree();

    const events = recordEvents(m.host, ['change', 'update:value']);

    const inputs = recordEvents(document.body, ['input']);

    await open(m);
    await clickRow(m, 0);
    await clickRow(m, 0);
    await clickRow(m, 0);

    expect(events.of('change').map((r) => r.detail)).toEqual(['1111']);
    expect(events.of('update:value').map((r) => r.detail)).toEqual(['1111']);
    expect(inputs.of('input', (r) => !r.composed)).toHaveLength(1);
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(combobox(m));
    expect(combobox(m).value).toBe(
      'Natural sciences › Mathematics › 1111 Pure mathematics',
    );
    expect(m.shadow('[part~="code"]').textContent?.trim()).toBe('1111');
  });

  it('climbs with crumbs, ArrowLeft and Backspace in an empty query; ArrowRight descends', async () => {
    const m = await mountTree();

    await open(m);
    await clickRow(m, 0);
    await clickRow(m, 0);

    expect(header(m)).toMatch(/Tertiary field/);

    await userEvent.keyboard('{ArrowLeft}');
    await settle();

    expect(header(m)).toMatch(/Secondary field/);

    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(header(m)).toMatch(/Primary field/);

    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await settle();

    expect(header(m)).toMatch(/Secondary field/);

    await userEvent.click(crumbs(m)[0]);
    await settle();

    expect(header(m)).toMatch(/Primary field/);
  });

  it('reopens at the committed item level with the row selected and highlighted', async () => {
    const m = await mountTree({ value: '1112' });

    await open(m);

    expect(header(m)).toMatch(/Tertiary field/);
    expect(rows(m).map((r) => r.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ]);
    expect(rows(m)[1].hasAttribute('data-active')).toBe(true);

    await matchScreenshotInBothModes(m.part('panel'), 'open-level3-committed');
  });

  it('return-object emits {code, name, path, value} without children', async () => {
    const m = await mountTree({ returnObject: true });

    await open(m);
    await clickRow(m, 0);
    await clickRow(m, 0);
    await clickRow(m, 1);

    expect(m.host.value).toEqual({
      code: '1112',
      name: 'Applied mathematics',
      path: [
        { code: '1', name: 'Natural sciences', value: '1' },
        { code: '111', name: 'Mathematics', value: '111' },
      ],
      value: '1112',
    });
  });

  it('disabled branches cannot be entered', async () => {
    const m = await mountTree();

    await open(m);

    expect(rows(m)[2].getAttribute('aria-disabled')).toBe('true');

    // The row is not an actionable target; force the click through.
    await userEvent.click(rows(m)[2], { force: true });
    await settle();

    expect(header(m)).toMatch(/Primary field/);
    expect(rows(m)).toHaveLength(3);
  });
});

describe('search', () => {
  it('lists whole-tree matches with their paths and marks; Browse instead returns', async () => {
    const m = await mountTree();

    await open(m);
    await userEvent.type(search(m), 'math');
    await settle();

    expect(rows(m)).toHaveLength(2);
    expect(header(m)).toMatch(/^2 matches/);

    for (const row of rows(m)) {
      expect(row.querySelector('[part~="path"]')?.textContent).toMatch(
        /Natural sciences › Mathematics/,
      );
      expect(row.querySelector('mark[part~="match"]')).not.toBeNull();
    }

    await matchScreenshotInBothModes(m.part('panel'), 'search');

    await userEvent.click(m.shadow('[part~="header"] button'));
    await settle();

    expect(search(m).value).toBe('');
    expect(header(m)).toBe('Choose Primary field Step 1 of 3');
  });

  it('a search result commits with its full path', async () => {
    const m = await mountTree();

    await open(m);
    await userEvent.type(search(m), 'urban');
    await settle();
    await clickRow(m, 0);

    expect(m.host.value).toBe('2111');
    expect(combobox(m).value).toBe(
      'Engineering › Architecture › 2111 Urban planning',
    );
  });
});

describe('allow-branch', () => {
  it('the pinned select-branch row commits the branch itself', async () => {
    const m = await mountTree({ allowBranch: true });

    expect(
      m.host.shadowRoot!.querySelector('li[data-select-branch]'),
    ).toBeNull();

    await open(m);

    expect(
      m.host.shadowRoot!.querySelector('li[data-select-branch]'),
    ).toBeNull();

    await clickRow(m, 0);

    const selectBranch = m.shadow('li[data-select-branch]');

    expect(selectBranch.textContent).toMatch(/Select Natural sciences/);

    await userEvent.click(selectBranch);
    await settle();

    expect(m.host.value).toBe('1');
    expect(isOpen(m)).toBe(false);
    expect(combobox(m).value).toBe('1 Natural sciences');
  });

  it('without the prop only leaves appear in search results', async () => {
    const BRANCH_CODES = ['1', '111', '113'];

    const isBranchRow = (row: HTMLElement) =>
      BRANCH_CODES.includes(
        row.querySelector('[part~="code"]')?.textContent?.trim() ?? '',
      );

    const plain = await mountTree();

    await open(plain);
    await userEvent.type(search(plain), 'natural');
    await settle();

    // Every leaf under "Natural sciences" matches through its path; no branch does.
    expect(rows(plain)).toHaveLength(3);
    expect(rows(plain).some(isBranchRow)).toBe(false);

    plain.unmount();

    const branches = await mountTree({ allowBranch: true });

    await open(branches);
    await userEvent.type(search(branches), 'natural');
    await settle();

    expect(rows(branches).length).toBeGreaterThan(3);
    expect(rows(branches).some(isBranchRow)).toBe(true);
  });
});

describe('value', () => {
  it('the clear button empties the value, emits null once and keeps the panel closed', async () => {
    const m = await mountTree({ clearable: true, value: '1111' });

    const events = recordEvents(m.host, ['change', 'update:value']);

    await userEvent.click(
      m.deep('c-icon-button[aria-label="Clear selection"]', 'button'),
    );
    await settle();

    expect(events.of('change').map((r) => r.detail)).toEqual([null]);
    expect(m.host.value).toBeNull();
    expect(isOpen(m)).toBe(false);
    expect(combobox(m).value).toBe('');
  });
});

describe('peek', () => {
  it('re-caps on level change', async () => {
    const m = await mountTree({ itemsPerPage: 3 });

    await open(m);

    expect(m.part('list').style.maxHeight, 'three roots fit').toBe('');

    await clickRow(m, 1);
    await clickRow(m, 0);

    expect(rows(m)).toHaveLength(4);
    expect(m.part('list').style.maxHeight).not.toBe('');

    await userEvent.keyboard('{ArrowLeft}');
    await settle();
    await settle();

    expect(m.part('list').style.maxHeight).toBe('');
  });
});

describe('uneven trees', () => {
  it('drops the step counter and says Final level on an all-leaf level', async () => {
    const m = await mountTree({}, [
      { children: [{ name: 'A1', value: 'a1' }], name: 'A', value: 'a' },
      { name: 'B', value: 'b' },
    ]);

    await open(m);

    expect(header(m)).toBe('Choose Primary field');

    await clickRow(m, 0);

    expect(header(m)).toBe('Choose Secondary field Final level');
  });
});
