/**
 * Behaviour spec for c-autocomplete (CONTEXT.md "Autocomplete", "Search
 * input", "Query", "Match marking", "Label region"; ADR-0009/0029/0045).
 * Seeded from 2d3d34b3: content nested in a slotted option rendered only
 * after a query rebuilt the rows.
 */
import { mdiCheck, mdiClose } from '@mdi/js';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { peekCap } from '../../shared/peekCap';
import {
  consoleSpy,
  deepActiveElement,
  defineAll,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  wrap,
} from '../../test/harness';

type AutoHost = {
  items?: unknown[];
  label?: string;
  loading?: boolean;
  value: unknown;
} & HTMLElement;

const option = (value: string, label: string, body = label): string =>
  `<c-option value="${value}">${body}</c-option>`;

const LANGUAGES = [
  option('js', 'JavaScript'),
  option('ts', 'TypeScript'),
  option('py', 'Python'),
].join('');

const WRAPPED = [
  option(
    'js',
    'JavaScript',
    '<c-option-value>JavaScript</c-option-value><span class="desc">Java-like</span>',
  ),
  option(
    'ts',
    'TypeScript',
    '<c-option-value>TypeScript</c-option-value><span class="desc">Typed Java-like</span>',
  ),
  option('py', 'Python', '<c-option-value>Python</c-option-value>'),
].join('');

const mountAuto = (props: Record<string, unknown> = {}, html = LANGUAGES) =>
  mount<AutoHost>('c-autocomplete', {
    html,
    props: { label: 'Language', ...props },
  });

const combobox = (m: Mounted): HTMLInputElement =>
  m.shadow('input[role="combobox"]');

const search = (m: Mounted): HTMLInputElement =>
  m.shadow('[part~="search"] input');

const rows = (m: Mounted): HTMLElement[] => m.shadowAll('li[part~="item"]');

const list = (m: Mounted): HTMLElement => m.part('list');

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

const open = async (m: Mounted): Promise<void> => {
  await userEvent.click(m.shadow('c-input'));
  await settle();
};

describe('option content', () => {
  it('renders content nested in a slotted option on the first open', async () => {
    defineAll();

    // Assemble detached, the way a framework template does: the nested
    // c-icon receives its path as a property, and reflects it to an attribute
    // only once IT connects — after the autocomplete has taken its snapshot.
    const host = document.createElement('c-autocomplete') as AutoHost;

    host.label = 'Language';

    for (const [value, label] of [
      ['js', 'JavaScript'],
      ['ts', 'TypeScript'],
    ]) {
      const opt = document.createElement('c-option');

      const wrapper = document.createElement('c-option-value');

      const icon = document.createElement('c-icon') as {
        path?: string;
      } & HTMLElement;

      opt.setAttribute('value', value);
      wrapper.textContent = label;
      icon.path = mdiCheck;
      opt.append(wrapper, icon);
      host.append(opt);
    }

    document.body.append(host);
    await customElements.whenDefined('c-autocomplete');
    await settle();

    const m = wrap(host);

    // The first row copy is taken before the icons reflect `path` (they
    // connect after their parent), so those copies mount path-less and Vue
    // warns once per icon; the attribute observer then refreshes the rows.
    consoleSpy.expect(/Missing required prop: "path"/);
    consoleSpy.expect(/Missing required prop: "path"/);

    await userEvent.click(host.shadowRoot!.querySelector('c-input')!);
    await settle();

    const icons = Array.from(
      host.shadowRoot!.querySelectorAll('li[part~="item"] c-icon'),
    );

    expect(icons).toHaveLength(2);

    for (const icon of icons) {
      expect(icon.getAttribute('path')).toBe(mdiCheck);
      expect(icon.shadowRoot?.querySelector('svg path[d]')).not.toBeNull();
    }

    // Later attribute changes on the slotted option reach the rows too.
    const [first] = host.querySelectorAll<
      { disabled?: boolean; path?: string } & HTMLElement
    >('c-option');

    first.disabled = true;
    (first.querySelector('c-icon') as { path?: string } & HTMLElement).path =
      mdiClose;
    await settle();

    expect(rows(m)[0].getAttribute('aria-disabled')).toBe('true');
    expect(rows(m)[0].querySelector('c-icon')?.getAttribute('path')).toBe(
      mdiClose,
    );
  });
});

describe('match marking', () => {
  it('marks the query inside the label region only', async () => {
    const m = await mountAuto({}, WRAPPED);

    await open(m);
    await userEvent.type(search(m), 'ja');
    await settle();

    const [javascript] = rows(m);

    const marks = javascript.querySelectorAll('mark[part~="match"]');

    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Ja');
    expect(marks[0].closest('c-option-value')).not.toBeNull();
    expect(javascript.querySelector('.desc mark')).toBeNull();
    expect(
      rows(m).map((r) => r.querySelector('c-option-value')?.textContent),
    ).toEqual(['JavaScript']);

    await matchScreenshotInBothModes(m.part('panel'), 'open-marked');
  });

  it('treats regex metacharacters in the query literally', async () => {
    const m = await mountAuto({}, WRAPPED);

    await open(m);

    for (const query of ['(', 'c++', '[\\']) {
      await userEvent.fill(search(m), query);
      await settle();

      expect(rows(m)).toHaveLength(0);
      expect(
        m.host.shadowRoot!.querySelector('li[part~="info"]'),
      ).not.toBeNull();
    }
  });
});

describe('query', () => {
  it('emits change:query "" on every open and once per keystroke', async () => {
    const m = await mountAuto();

    const events = recordEvents(m.host, ['change:query']);

    await open(m);

    expect(events.details()).toEqual(['']);

    await userEvent.type(search(m), 'ja');
    await settle();

    expect(events.details()).toEqual(['', 'j', 'ja']);

    await userEvent.keyboard('{Escape}');
    await settle();
    await open(m);

    expect(events.details()).toEqual(['', 'j', 'ja', '']);
  });
});

describe('multiple', () => {
  it('keeps the panel open across picks with DOM focus in the search input and virtual highlight', async () => {
    const m = await mountAuto({ multiple: true, selectAll: true });

    await open(m);
    await userEvent.click(rows(m)[0]);
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(deepActiveElement()).toBe(search(m));
    expect(m.host.value).toEqual(['js']);

    const id = search(m)
      .getAttribute('aria-controls')!
      .replace(/-listbox$/, '');

    await userEvent.keyboard('{Home}');
    await settle();

    expect(search(m).getAttribute('aria-activedescendant')).toBe(
      `${id}-select-all`,
    );

    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(search(m).getAttribute('aria-activedescendant')).toBe(`${id}-opt-0`);

    await userEvent.keyboard('{Home}{Enter}');
    await settle();

    expect(m.host.value).toEqual(['js', 'ts', 'py']);
  });

  it('return-object carries {name, value} entries', async () => {
    const m = await mountAuto({ multiple: true, returnObject: true });

    await open(m);
    await userEvent.click(rows(m)[1]);
    await settle();

    expect(m.host.value).toEqual([{ name: 'TypeScript', value: 'ts' }]);
  });
});

describe('external mode', () => {
  it('shows the loading row and remembers committed labels across an items swap', async () => {
    const m = await mountAuto({ external: true, items: [], loading: true }, '');

    await open(m);

    expect(rows(m)).toHaveLength(0);
    expect(m.host.shadowRoot!.querySelector('li[part~="info"]')).not.toBeNull();

    m.host.loading = false;
    m.host.items = [{ name: 'Alpha', value: 'a' }];
    await settle();
    await userEvent.click(rows(m)[0]);
    await settle();

    expect(combobox(m).value).toBe('Alpha');

    m.host.items = [{ name: 'Beta', value: 'b' }];
    await settle();

    expect(combobox(m).value).toBe('Alpha');
  });
});

describe('peek', () => {
  const eight = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    .map((v) => option(v, `Option ${v}`))
    .join('');

  it('caps at items-per-page and clears once a query leaves nothing to scroll', async () => {
    const m = await mountAuto({ itemsPerPage: 3 }, eight);

    await open(m);

    const ul = list(m);

    expect(parseFloat(ul.style.maxHeight)).toBeGreaterThan(0);
    expect(parseFloat(ul.style.maxHeight)).toBe(
      peekCap(ul, { itemsPerPage: 3, rows: rows(m) }),
    );

    await userEvent.type(search(m), 'Option a');
    await settle();
    await settle();

    expect(rows(m)).toHaveLength(1);
    expect(ul.style.maxHeight).toBe('');
  });
});
