/**
 * Behaviour spec for c-tree-select (CONTEXT.md "Tree select", "Stepped
 * listbox", "Breadcrumb", "Browse" / "Search", "Select-branch row";
 * ADR-0047). The committed form of the 127-check smoke run that verified the
 * component on 2026-09-11.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { fakeVisualViewport } from '../../test/fakeVisualViewport';
import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
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

// A realistic field width: in the inline-block stage the block host would
// otherwise collapse to 46 px, putting the field's centre on the chevron and
// pinning the panel to that width.
const mountTree = (
  props: Record<string, unknown> = {},
  items: unknown[] = TREE,
) =>
  mount<TreeHost>('c-tree-select', {
    attrs: { style: 'width: 320px' },
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

  expect(isOpen(m), 'the panel did not open on the field click').toBe(true);
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

// CONTEXT.md "Fullscreen panel", "Narrow viewport"; ADR-0050. The browser
// project's viewport is the desktop one (vitest.browser.shared.ts); every
// case here resizes it and restores it, the page being shared across specs.
describe('fullscreen panel', () => {
  const DESKTOP = { height: 800, width: 1280 };

  const PHONE = { height: 740, width: 360 };

  afterEach(async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
  });

  const openFullscreen = async (m: Mounted): Promise<void> => {
    await open(m);
    // Past the panel's 120ms fade-in before measuring boxes.
    await settled();
  };

  it('covers the viewport with a heading row above the search, breadcrumb and header; the page behind is inert', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const sibling = document.createElement('button');

    document.body.append(sibling);

    const m = await mountTree();

    await openFullscreen(m);

    const rect = m.part('panel').getBoundingClientRect();

    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.width).toBe(document.documentElement.clientWidth);
    expect(rect.height).toBe(window.innerHeight);

    const card = m.part('card');

    expect(card.getAttribute('role')).toBe('dialog');
    expect(card.getAttribute('aria-modal')).toBe('true');
    expect(m.part('heading').textContent?.trim()).toBe('Field of science');

    // Heading row first, then the anchored layout's rows in their order.
    const order = Array.from(card.children)
      .map((c) => c.getAttribute('part'))
      .filter((p) => p && p !== 'card');

    expect(order.slice(0, 1)).toEqual(['heading-row']);
    expect(order).toContain('search');
    expect(order.indexOf('search')).toBeLessThan(order.indexOf('breadcrumb'));
    expect(order.indexOf('breadcrumb')).toBeLessThan(order.indexOf('header'));
    expect(order.indexOf('header')).toBeLessThan(order.indexOf('list'));

    expect(sibling.inert).toBe(true);
    expect(m.host.inert).toBe(false);
    expect(deepActiveElement()).toBe(search(m));
    expect(header(m)).toBe('Choose Primary field Step 1 of 3');
  });

  it('browsing into a level keeps the fullscreen layout; the close button returns focus to the field', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountTree();

    await openFullscreen(m);
    await clickRow(m, 0);

    expect(isOpen(m)).toBe(true);
    expect(header(m)).toBe('Choose Secondary field Step 2 of 3');
    expect(m.part('panel').getBoundingClientRect().height).toBe(
      window.innerHeight,
    );

    await userEvent.click(m.part('close'));
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(combobox(m));
    expect(document.documentElement.style.overflow).toBe('');
    expect(m.host.value).toBeNull();
  });

  it('the list has no peek cap in the fullscreen layout', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountTree({ itemsPerPage: 1 });

    await openFullscreen(m);

    expect(m.part('list').style.maxHeight).toBe('');
  });

  // The on-screen keyboard: headless Chromium has none, so the visual
  // viewport's box is faked — an Android-like shrink, then an iOS-like pan.
  // The surface must stay over the whole layout viewport either way; only
  // the card follows the visible box, so the search input ends above
  // the keyboard.
  it('keeps the surface over the whole viewport while the keyboard shrinks the visual viewport; the card follows the visible box', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountTree();

    await openFullscreen(m);

    const viewport = {
      height: window.innerHeight,
      width: document.documentElement.clientWidth,
    };

    const expectSurfaceCovers = (): void => {
      const rect = m.part('panel').getBoundingClientRect();

      expect([rect.left, rect.top, rect.width, rect.height]).toEqual([
        0,
        0,
        viewport.width,
        viewport.height,
      ]);
      expect(getComputedStyle(m.part('panel')).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
    };

    for (const box of [
      { height: 400, offsetTop: 0 },
      { height: 400, offsetTop: 340 },
    ]) {
      const restore = fakeVisualViewport(box);

      try {
        await settle();
        expectSurfaceCovers();

        const content = m.part('card').getBoundingClientRect();

        expect([
          content.left,
          content.top,
          content.width,
          content.height,
        ]).toEqual([0, box.offsetTop, viewport.width, box.height]);

        const inside = search(m).getBoundingClientRect();

        expect(inside.top).toBeGreaterThanOrEqual(content.top);
        expect(inside.bottom).toBeLessThanOrEqual(content.bottom);
      } finally {
        restore();
      }
    }

    await settle();
    expectSurfaceCovers();
    expect(m.part('card').getBoundingClientRect().height).toBe(viewport.height);
  });

  it('visual: fullscreen panel', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountTree();

    await openFullscreen(m);
    await matchScreenshotInBothModes(m.part('panel'), 'fullscreen');
  });
});

// The closed field with a selection. The two-line value block used to have no
// clip, so a long label painted out through the fieldset and across the clear
// button; the clear button and chevron sat on a `display: contents` host, so
// their edge pull and the chevron's turn never rendered. Later the code
// ellipsised along with the label, and the block sat low in the field —
// 10px above, 6px below — so the value read as bottom-heavy.
describe('closed field with a selection', () => {
  const LONG = [
    {
      children: [
        {
          code: '3141.5926',
          name: 'Interdisciplinary computational neuroscience and cognition',
          value: 'long',
        },
      ],
      ...leaf('3', 'Very long things'),
    },
  ];

  /** The painted width of an element's own text, ellipsis or not. */
  const textWidth = (el: Element): number => {
    const range = document.createRange();

    range.selectNodeContents(el);

    return range.getBoundingClientRect().width;
  };

  const centre = (r: DOMRect): number => (r.top + r.bottom) / 2;

  const slotBox = (m: Mounted): DOMRect =>
    m.deep('c-input', '.c-input__slot').getBoundingClientRect();

  const postButton = (m: Mounted): HTMLElement =>
    m
      .shadow('[slot="post"] c-icon-button')
      .shadowRoot!.querySelector('button')!;

  it('keeps a long code and label inside the field, the clear button at its trailing edge', async () => {
    const m = await mountTree({ clearable: true, value: 'long' }, LONG);

    await settled();

    const slot = slotBox(m);

    const clear = postButton(m).getBoundingClientRect();

    expect(clear.right).toBeLessThanOrEqual(slot.right);
    expect(clear.left).toBeGreaterThan(slot.left);
    expect(clear.top).toBeGreaterThanOrEqual(slot.top);
    expect(clear.bottom).toBeLessThanOrEqual(slot.bottom);

    const codeEl = m.part('code');

    const code = codeEl.getBoundingClientRect();

    expect(
      code.right,
      'the code stops before the clear button',
    ).toBeLessThanOrEqual(clear.left);
    expect(code.bottom).toBeLessThanOrEqual(slot.bottom);
    expect(code.top).toBeGreaterThanOrEqual(slot.top);

    // The code never truncates: it is the item's identity. The label beside
    // it is what ellipsises.
    expect(code.width, 'the code shows whole').toBeGreaterThanOrEqual(
      textWidth(codeEl) - 0.5,
    );

    const label = codeEl.nextElementSibling!;

    expect(label.scrollWidth, 'the label ellipsises').toBeGreaterThan(
      label.clientWidth,
    );
  });

  it('the field keeps the control height whether empty or holding a two-line value', async () => {
    const empty = await mountTree();

    const two = await mountTree({ value: '1112' });

    await settled();

    const emptyBox = slotBox(empty);

    const twoBox = slotBox(two);

    expect(emptyBox.height, 'empty field').toBe(52);
    expect(twoBox.height, 'two-line value').toBe(emptyBox.height);
    expect(
      two.deep('c-input', '.c-input__slot').scrollHeight,
      'the value block fits the box',
    ).toBeLessThanOrEqual(twoBox.height);
  });

  it('centres the value in the field: the two-line block and a single-line root value alike', async () => {
    const two = await mountTree({ value: '1112' });

    await settled();

    const block = two.shadow('.c-input__content [aria-hidden]');

    const [path, main] = Array.from(block.children).map((el) =>
      el.getBoundingClientRect(),
    );

    const slot = slotBox(two);

    expect(
      Math.abs((path.top + main.bottom) / 2 - centre(slot)),
      'two lines sit centred',
    ).toBeLessThanOrEqual(1);

    const one = await mountTree({ value: '1' });

    await settled();

    const value = one
      .shadow('.c-input__content [aria-hidden]')
      .lastElementChild!.getBoundingClientRect();

    expect(
      Math.abs(centre(value) - centre(slotBox(one))),
      'one line sits centred',
    ).toBeLessThanOrEqual(1);
  });

  it('turns the chevron while the panel is open', async () => {
    const m = await mountTree();

    const chevron = m.shadow('[slot="post"] > span');

    const closed = getComputedStyle(chevron).rotate;

    await userEvent.click(postButton(m));
    await settled();

    expect(getComputedStyle(chevron).rotate).not.toBe(closed);
  });

  it('visual: closed field with a selection', async () => {
    const m = await mountTree({ clearable: true, value: 'long' }, LONG);

    await settled();
    await matchScreenshotInBothModes(m.stage, 'field-selected');
  });
});

// The gap between the field and its panel is the same for every dropdown:
// none — the panel's edge meets the field box, as `c-select`'s listbox and a
// `c-menu` with the default `distance` do. The anchor spans the whole
// `c-input`, and only the message area's height was pulled back, so the 8px
// gap above it stayed between the field and the panel.
describe('field to panel gap', () => {
  const fieldBox = (m: Mounted): DOMRect =>
    m.deep('c-input', '.c-input__slot').getBoundingClientRect();

  it('the panel meets the field box, with a floating label and with the label on top', async () => {
    for (const props of [{}, { labelOnTop: true }]) {
      const m = await mountTree(props);

      await open(m);
      await settled();

      const panel = m.part('panel').getBoundingClientRect();

      expect(
        Math.abs(panel.top - fieldBox(m).bottom),
        `panel flush under the field (${JSON.stringify(props)})`,
      ).toBeLessThanOrEqual(0.5);

      m.unmount();
    }
  });
});
