/**
 * Behaviour spec for c-select (CONTEXT.md "Dropdown"). Seeded from the
 * regressions fixed in d54ae8a9 (selected-row check, scalar value resolution,
 * highlight seeding on every open path) and 8ef62d16 (the peek cap measured
 * the outgoing rows).
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { peekCap } from '../../shared/peekCap';
import {
  deepActiveElement,
  defineAll,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type SelectHost = { reset(): void; value: unknown } & HTMLElement;

const option = (value: string, name: string, extra = ''): string =>
  `<c-option name="${name}" value="${value}"${extra}>${name}</c-option>`;

const COUNTRIES = [
  option('fi', 'Finland'),
  option('se', 'Sweden'),
  option('no', 'Norway'),
  option('dk', 'Denmark'),
].join('');

const VALUE_EVENTS = ['changeValue', 'change-value', 'update:value'] as const;

const mountSelect = (props: Record<string, unknown> = {}, html = COUNTRIES) =>
  mount<SelectHost>('c-select', {
    html,
    props: { label: 'Country', ...props },
  });

const dropdownRoot = (m: Mounted): ShadowRoot =>
  m.shadow('c-dropdown').shadowRoot!;

const combobox = (m: Mounted): HTMLInputElement =>
  m.shadow('input[role="combobox"]');

const rows = (m: Mounted): HTMLElement[] =>
  Array.from(
    dropdownRoot(m).querySelectorAll(
      'li[role="option"]:not([data-select-all])',
    ),
  );

const list = (m: Mounted): HTMLElement =>
  dropdownRoot(m).querySelector('ul[part~="list"]')!;

const isOpen = (m: Mounted): boolean =>
  list(m).classList.contains('active') &&
  dropdownRoot(m).querySelector('dialog')!.open;

const openByClick = async (m: Mounted): Promise<void> => {
  await userEvent.click(m.shadow('c-input'));
  await settle();
};

describe('single mode', () => {
  it('marks the picked option row with a trailing check', async () => {
    const m = await mountSelect({ value: 'se' });

    await openByClick(m);

    const [finland, sweden, ...rest] = rows(m);

    expect(sweden.getAttribute('aria-selected')).toBe('true');
    expect(sweden.querySelector('svg.check')).not.toBeNull();

    for (const row of [finland, ...rest]) {
      expect(row.getAttribute('aria-selected')).toBe('false');
      expect(row.querySelector('svg.check')).toBeNull();
    }

    await matchScreenshotInBothModes(
      dropdownRoot(m).querySelector('dialog')!,
      'open-checked',
    );
  });

  it('resolves a scalar value to its option', async () => {
    const m = await mountSelect({ value: 'se' });

    expect(combobox(m).value).toBe('Sweden');

    await openByClick(m);

    expect(rows(m).map((row) => row.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ]);

    m.host.value = 'dk';
    await settle();

    expect(combobox(m).value).toBe('Denmark');
    expect(rows(m).map((row) => row.getAttribute('aria-selected'))).toEqual([
      'false',
      'false',
      'false',
      'true',
    ]);
  });

  it.each([
    ['field click', async (m: Mounted) => userEvent.click(m.shadow('c-input'))],
    [
      'chevron',
      async (m: Mounted) =>
        userEvent.click(
          m.deep('c-icon-button[aria-label="Toggle options"]', 'button'),
        ),
    ],
    [
      'keyboard',
      async (m: Mounted) => {
        combobox(m).focus();
        await userEvent.keyboard('{ArrowDown}');
      },
    ],
  ])(
    'seeds the highlight from the selection when opened via %s',
    async (_, openVia) => {
      const m = await mountSelect({ value: 'se' });

      await openVia(m);
      await settle();

      expect(isOpen(m)).toBe(true);
      // Rows take focus only on arrow navigation.
      expect(rows(m)).not.toContain(dropdownRoot(m).activeElement);

      combobox(m).focus();
      await userEvent.keyboard('{ArrowDown}');
      await settle();

      // One step from the picked row (index 1), not from a stale first row.
      expect(dropdownRoot(m).activeElement).toBe(rows(m)[2]);
    },
  );

  it('Escape closes and refocuses the field, and is consumed only while open', async () => {
    const m = await mountSelect();

    const escape = () =>
      combobox(m).dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          key: 'Escape',
        }),
      );

    await openByClick(m);

    expect(isOpen(m)).toBe(true);
    expect(escape(), 'Escape consumed while open').toBe(false);

    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(combobox(m));
    expect(escape(), 'Escape passes through while closed').toBe(true);
  });

  it('the clear button and reset() empty the value and emit null once', async () => {
    const m = await mountSelect({ clearable: true, value: 'se' });

    const events = recordEvents(m.host, VALUE_EVENTS);

    await userEvent.click(
      m.deep('c-icon-button[aria-label="Clear selection"]', 'button'),
    );
    await settle();

    expect(events.of('update:value').map((r) => r.detail)).toEqual([null]);
    expect(combobox(m).value).toBe('');

    events.clear();
    m.host.value = 'no';
    await settle();
    m.host.reset();
    await settle();

    expect(events.of('update:value').map((r) => r.detail)).toEqual([null]);
  });

  it.fails(
    'does not emit when a slotted <c-option selected> seeds the value at mount (pinned deviation)',
    async () => {
      defineAll();

      const host = document.createElement('c-select');

      host.innerHTML = [
        option('fi', 'Finland'),
        option('se', 'Sweden', ' selected'),
      ].join('');

      const events = recordEvents(host, VALUE_EVENTS);

      document.body.append(host);
      await settle(60);

      expect(events.records).toEqual([]);
    },
  );
});

describe('multiple mode', () => {
  it('keeps the list open across picks and renders them as tags in pick order', async () => {
    const m = await mountSelect({ multiple: true, selectAll: true });

    await openByClick(m);

    expect(list(m).getAttribute('aria-multiselectable')).toBe('true');

    const selectAll = dropdownRoot(m).querySelector('li[data-select-all]')!;

    expect(selectAll.getAttribute('aria-selected')).toBe('false');

    await userEvent.click(rows(m)[1]);
    await settle();
    await userEvent.click(rows(m)[0]);
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(m.host.value).toEqual(['se', 'fi']);
    expect(
      m.shadowAll('c-tag[part~="tag"]').map((t) => t.textContent?.trim()),
    ).toEqual(['Sweden', 'Finland']);
    expect(combobox(m).value).toBe('Sweden, Finland');
    expect(selectAll.getAttribute('aria-selected')).not.toBe('true');

    await matchScreenshotInBothModes(
      dropdownRoot(m).querySelector('dialog')!,
      'multiple-open-indeterminate',
    );
  });

  it('the select-all row toggles every listed option and max-tags folds the row', async () => {
    const m = await mountSelect({
      maxTags: 1,
      multiple: true,
      selectAll: true,
    });

    await openByClick(m);
    await userEvent.click(
      dropdownRoot(m).querySelector('li[data-select-all]')!,
    );
    await settle();

    expect(m.host.value).toEqual(['fi', 'se', 'no', 'dk']);

    const tags = m.shadowAll('c-tag[part~="tag"]');

    expect(tags).toHaveLength(2);
    expect(tags[1].textContent).toMatch(/3/);

    await userEvent.click(
      dropdownRoot(m).querySelector('li[data-select-all]')!,
    );
    await settle();

    expect(m.host.value).toEqual([]);
  });

  it('max-tags="0" shows the count summary instead of tags', async () => {
    const m = await mountSelect({
      maxTags: 0,
      multiple: true,
      value: ['fi', 'se'],
    });

    expect(m.shadowAll('c-tag[part~="tag"]')).toHaveLength(0);
    expect(combobox(m).value).toBe('2 selected');
  });

  it('Backspace on the field removes the last pick', async () => {
    const m = await mountSelect({ multiple: true, value: ['fi', 'se'] });

    combobox(m).focus();
    await userEvent.keyboard('{Backspace}');
    await settle();

    expect(m.host.value).toEqual(['fi']);
  });
});

describe('peek', () => {
  const eight = ['fi', 'se', 'no', 'dk', 'is', 'ee', 'lv', 'lt']
    .map((v) => option(v, v.toUpperCase()))
    .join('');

  it('re-measures the cap a frame after the row set changes while open', async () => {
    const m = await mountSelect({ itemsPerPage: 3 }, eight);

    await openByClick(m);

    const ul = list(m);

    const before = parseFloat(ul.style.maxHeight);

    expect(before).toBeGreaterThan(0);

    // A tall option inserted above the peek row pushes the fourth row down:
    // the cap must follow the NEW rows, not the ones measured before the patch.
    const tall = document.createElement('c-option');

    tall.setAttribute('name', 'Tall');
    tall.setAttribute('value', 'tall');
    tall.innerHTML = '<div style="height:90px">Tall</div>';
    m.host.insertBefore(tall, m.host.children[1]);

    await settle();
    await settle();

    const after = parseFloat(ul.style.maxHeight);

    expect(after).toBeGreaterThan(before);
    expect(after).toBe(peekCap(ul, { itemsPerPage: 3, rows: rows(m) }));
  });
});
