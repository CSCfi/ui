/**
 * Behaviour spec for c-autocomplete (CONTEXT.md "Autocomplete", "Search
 * input", "Query", "Match marking", "Label region"; ADR-0009/0029/0045).
 * Seeded from 2d3d34b3: content nested in a slotted option rendered only
 * after a query rebuilt the rows.
 */
import { mdiCheck, mdiClose } from '@mdi/js';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { peekCap } from '../../shared/peekCap';
import { fakeVisualViewport } from '../../test/fakeVisualViewport';
import {
  consoleSpy,
  deepActiveElement,
  defineAll,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
  settled,
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

// CONTEXT.md "Fullscreen panel", "Narrow viewport"; ADR-0050. The browser
// project's viewport is the desktop one (vitest.browser.shared.ts); every
// case here resizes it and restores it, the page being shared across specs.
describe('fullscreen panel', () => {
  const DESKTOP = { height: 800, width: 1280 };

  const PHONE = { height: 740, width: 360 };

  afterEach(async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
  });

  const outsideButton = (): HTMLButtonElement => {
    const button = document.createElement('button');

    button.textContent = 'page';
    document.body.append(button);

    return button;
  };

  const openField = async (m: Mounted): Promise<void> => {
    await userEvent.click(m.shadow('c-input'));
    // Past the panel's 120ms fade-in before measuring boxes.
    await settled();
  };

  it('covers the viewport with a heading row and a dialog role, locking the page behind it', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const sibling = outsideButton();

    const m = await mountAuto();

    await openField(m);

    const panel = m.part('panel');

    expect(panel.matches(':popover-open')).toBe(true);

    const rect = panel.getBoundingClientRect();

    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.width).toBe(document.documentElement.clientWidth);
    expect(rect.height).toBe(window.innerHeight);

    const card = m.part('card');

    expect(card.getAttribute('role')).toBe('dialog');
    expect(card.getAttribute('aria-modal')).toBe('true');
    expect(card.getAttribute('aria-label')).toBe('Language');
    expect(m.part('heading').textContent?.trim()).toBe('Language');
    expect(m.part('close').getAttribute('aria-label')).toBe('Close');

    expect(sibling.inert, 'the page behind the panel').toBe(true);
    expect(m.host.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('hidden');

    expect(deepActiveElement()).toBe(m.shadow('[part~="search"] input'));
  });

  it('the close button closes, releases the page and returns focus to the field', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const sibling = outsideButton();

    const m = await mountAuto();

    await openField(m);
    await userEvent.click(m.part('close'));
    await settle();

    expect(m.part('panel').matches(':popover-open')).toBe(false);
    expect(sibling.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
    expect(deepActiveElement()).toBe(m.shadow('input[role="combobox"]'));
    expect(m.shadowAll('[part~="heading-row"]')).toHaveLength(0);
  });

  it('the list takes the remaining height with no peek cap', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountAuto({ itemsPerPage: 1 });

    await openField(m);

    const list = m.part('list');

    expect(list.style.maxHeight).toBe('');

    const card = m.part('card').getBoundingClientRect();

    expect(Math.round(list.getBoundingClientRect().bottom)).toBe(
      Math.round(card.bottom),
    );
  });

  it('crossing the threshold while open closes the panel; at desktop width it anchors again', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountAuto();

    await openField(m);
    await page.viewport(DESKTOP.width, DESKTOP.height);

    await expect
      .poll(() => m.part('panel').matches(':popover-open'))
      .toBe(false);

    await openField(m);

    const panel = m.part('panel');

    expect(panel.matches(':popover-open')).toBe(true);
    expect(m.shadowAll('[part~="heading-row"]')).toHaveLength(0);
    expect(m.part('card').hasAttribute('role')).toBe(false);
    expect(panel.getBoundingClientRect().width).toBeLessThan(
      window.innerWidth / 2,
    );
    expect(document.documentElement.style.overflow).toBe('');
  });

  // The on-screen keyboard: headless Chromium has none, so the visual
  // viewport's box is faked — an Android-like shrink, then an iOS-like pan.
  // The surface must stay over the whole layout viewport either way; only
  // the card follows the visible box, so the search input ends above
  // the keyboard.
  it('keeps the surface over the whole viewport while the keyboard shrinks the visual viewport; the card follows the visible box', async () => {
    await page.viewport(PHONE.width, PHONE.height);

    const m = await mountAuto();

    await openField(m);

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

    const m = await mountAuto();

    await openField(m);
    await matchScreenshotInBothModes(m.part('panel'), 'fullscreen');
  });
});

// The trailing controls (clear button, chevron) sit in c-input's `post` slot
// on a real box: on the `display: contents` host they used to be on, the
// chevron's turn never rendered.
describe('closed field controls', () => {
  it('turns the chevron while the panel is open', async () => {
    const m = await mountAuto();

    const chevron = m.shadow('[slot="post"] > span');

    const closed = getComputedStyle(chevron).rotate;

    await open(m);
    await settled();

    expect(getComputedStyle(chevron).rotate).not.toBe(closed);
  });

  it('visual: closed field with a selection', async () => {
    const m = await mountAuto({ clearable: true, value: 'ts' });

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
      const m = await mountAuto(props);

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

  it('flipped above a field near the bottom of the viewport with its label on top, the panel meets the top edge of the field box', async () => {
    const m = await mountAuto({ labelOnTop: true });

    m.stage.style.marginTop = `${window.innerHeight - 120}px`;
    await settle();
    await open(m);
    await settled();

    const panel = m.part('panel').getBoundingClientRect();

    const box = fieldBox(m);

    expect(panel.bottom, 'opened upward').toBeLessThanOrEqual(box.top + 0.5);
    expect(Math.abs(panel.bottom - box.top), 'flush above').toBeLessThanOrEqual(
      0.5,
    );

    m.unmount();
  });
});
