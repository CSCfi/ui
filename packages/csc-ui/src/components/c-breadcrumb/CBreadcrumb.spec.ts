/**
 * Behaviour spec for c-breadcrumb and c-breadcrumb-item (CONTEXT.md
 * "Breadcrumb", "Crumb", "Current crumb", "Folded crumbs"; ADR-0067): one line
 * of crumbs whose middle ones fold into a disclosure panel by moving there,
 * then whose current and first crumbs truncate.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mdiChevronRight, mdiHome } from '@mdi/js';
import { page, userEvent } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { applyDefaults, resetDefaults } from '../../shared/appDefaults';
import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  parkPointer,
  settle,
} from '../../test/harness';

const LABELS = [
  'Home',
  'Research infrastructures',
  'Computing services',
  'Supercomputers',
  'Project allocations',
  'Project #1',
];

/** Crumbs with an `href` each, but the last (the current page). */
const crumbsHtml = (labels: readonly string[]): string =>
  labels
    .map((label, i) =>
      i === labels.length - 1
        ? `<c-breadcrumb-item>${label}</c-breadcrumb-item>`
        : `<c-breadcrumb-item href="#crumb-${i}">${label}</c-breadcrumb-item>`,
    )
    .join('');

/** Fold and refit run a frame after a change; two settles cover the re-render. */
const relaid = async (): Promise<void> => {
  await settle();
  await settle();
};

/** A breadcrumb in a block stage `width` px wide (content box). */
const mountBreadcrumb = async (
  width: number,
  html = crumbsHtml(LABELS),
): Promise<Mounted> => {
  const m = await mount('c-breadcrumb', { html });

  m.stage.style.display = 'block';
  m.stage.style.boxSizing = 'content-box';
  m.stage.style.width = `${width}px`;
  await relaid();

  return m;
};

const resize = async (m: Mounted, width: number): Promise<void> => {
  m.stage.style.width = `${width}px`;
  await relaid();
};

const crumbs = (m: Mounted): HTMLElement[] =>
  Array.from(m.host.querySelectorAll<HTMLElement>('c-breadcrumb-item'));

const foldedCrumbs = (m: Mounted): HTMLElement[] =>
  crumbs(m).filter((c) => c.getAttribute('slot') === 'folded');

const folded = (m: Mounted): string[] =>
  foldedCrumbs(m).map((c) => c.textContent!.trim());

const inner = <E extends Element = HTMLElement>(
  crumb: Element,
  selector: string,
): E => crumb.shadowRoot!.querySelector<E>(selector)!;

const link = (crumb: Element): HTMLAnchorElement => inner(crumb, 'a');

const part = (crumb: Element, name: string): HTMLElement | null =>
  crumb.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`);

const isShown = (el: Element): boolean =>
  getComputedStyle(el).visibility === 'visible' &&
  el.getClientRects().length > 0;

const openFold = async (m: Mounted): Promise<void> => {
  await userEvent.click(m.part('fold-button'));
  await settle();
};

const isOpen = (m: Mounted): boolean =>
  m.part('panel').matches(':popover-open');

describe('semantics', () => {
  it('is a labelled navigation holding an ordered list of crumbs', async () => {
    const m = await mountBreadcrumb(1200);

    const nav = m.part('root');

    expect(nav.localName).toBe('nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(m.part('list').localName).toBe('ol');

    for (const crumb of crumbs(m)) {
      expect(part(crumb, 'root')!.localName).toBe('li');
    }
  });

  it('makes the last crumb the current page — no link, even with an href', async () => {
    const m = await mountBreadcrumb(
      1200,
      `${crumbsHtml(['Home', 'Projects'])}`.replace(
        '<c-breadcrumb-item>Projects',
        '<c-breadcrumb-item href="#projects">Projects',
      ),
    );

    const [home, projects] = crumbs(m);

    expect(link(projects).getAttribute('aria-current')).toBe('page');
    expect(link(projects).hasAttribute('href')).toBe(false);
    expect(projects.matches(':state(current)')).toBe(true);
    expect(link(home).hasAttribute('aria-current')).toBe(false);
    expect(link(home).getAttribute('href')).toBe('#crumb-0');
    expect(home.matches(':state(current)')).toBe(false);
  });

  it('moves the current page to an appended crumb', async () => {
    const m = await mountBreadcrumb(1200, crumbsHtml(['Home', 'Projects']));

    const next = document.createElement('c-breadcrumb-item');

    next.textContent = 'Project #1';
    m.host.append(next);
    await relaid();

    const [, projects, project] = crumbs(m);

    expect(projects.matches(':state(current)')).toBe(false);
    expect(link(projects).hasAttribute('aria-current')).toBe(false);
    expect(project.matches(':state(current)')).toBe(true);
    expect(link(project).getAttribute('aria-current')).toBe('page');
  });

  it('renders a crumb without an href as text, out of the Tab order', async () => {
    const m = await mountBreadcrumb(
      1200,
      '<c-breadcrumb-item href="#home">Home</c-breadcrumb-item><c-breadcrumb-item>Services</c-breadcrumb-item><c-breadcrumb-item>Project #1</c-breadcrumb-item>',
    );

    const [home, services] = crumbs(m);

    expect(link(services).hasAttribute('href')).toBe(false);

    link(home).focus();
    await userEvent.tab();

    expect(deepActiveElement()).not.toBe(link(services));
  });

  it('names an icon-only crumb from its host aria-label, keeping other host attributes off the link', async () => {
    const m = await mountBreadcrumb(
      1200,
      '<c-breadcrumb-item id="home-crumb" aria-label="Home" href="#home"><span slot="icon">⌂</span></c-breadcrumb-item><c-breadcrumb-item>Projects</c-breadcrumb-item>',
    );

    const [home] = crumbs(m);

    expect(link(home).getAttribute('aria-label')).toBe('Home');
    expect(link(home).hasAttribute('id')).toBe(false);
    expect(part(home, 'root')!.hasAttribute('id')).toBe(false);
    expect(part(home, 'root')!.hasAttribute('slot')).toBe(false);
    // No label, so no gap reserved for one.
    expect(isShown(part(home, 'label')!)).toBe(false);

    home.setAttribute('aria-label', 'Front page');
    await relaid();

    expect(link(home).getAttribute('aria-label')).toBe('Front page');
  });

  it('draws a hidden chevron before every crumb in the row but the first', async () => {
    const m = await mountBreadcrumb(1200);

    const [first, ...rest] = crumbs(m);

    expect(part(first, 'separator')).toBeNull();

    for (const crumb of rest) {
      const separator = part(crumb, 'separator')!;

      expect(separator.localName).toBe('svg');
      expect(separator.querySelector('path')!.getAttribute('d')).toBe(
        mdiChevronRight,
      );
      expect(separator.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('centres the label capitals on the icon and the chevron, whatever the font metrics', async () => {
    // A face whose ascent dwarfs its descent: centred by its line box, its
    // capitals would sit about 4px below the icon's middle.
    const skewed = new FontFace('Skewed', "local('Liberation Sans')", {
      ascentOverride: '140%',
      descentOverride: '10%',
      weight: '700',
    });

    document.fonts.add(await skewed.load());

    try {
      const m = await mountBreadcrumb(
        1200,
        `<c-breadcrumb-item aria-label="Home" href="#home"><svg slot="icon" viewBox="0 0 24 24" width="20" height="20"><path d="${mdiHome}" /></svg></c-breadcrumb-item><c-breadcrumb-item>Projects<span class="baseline" style="display:inline-block;width:0;height:0"></span></c-breadcrumb-item>`,
      );

      m.stage.style.setProperty('--c-font-family', 'Skewed');
      await relaid();

      const [home, projects] = crumbs(m);

      const middle = (el: Element): number => {
        const r = el.getBoundingClientRect();

        return r.top + r.height / 2;
      };

      const line = middle(part(home, 'content')!);

      const canvas = document.createElement('canvas').getContext('2d')!;

      canvas.font = '700 14px Skewed';

      const capHeight = canvas.measureText('H').actualBoundingBoxAscent;

      // The consumer's own zero-size span rests on the label's baseline.
      const baseline = projects
        .querySelector('.baseline')!
        .getBoundingClientRect().top;

      expect(middle(home.querySelector('svg')!)).toBeCloseTo(line, 0);
      expect(middle(part(projects, 'separator')!)).toBeCloseTo(line, 0);
      expect(baseline - capHeight / 2).toBeCloseTo(line, 0);
    } finally {
      document.fonts.delete(skewed);
    }
  });
});

describe('folding', () => {
  it('folds nothing while the crumbs fit, and keeps the fold button out of reach', async () => {
    const m = await mountBreadcrumb(1200);

    expect(folded(m)).toEqual([]);
    expect(isShown(m.part('fold-button'))).toBe(false);

    link(crumbs(m)[0]).focus();
    await userEvent.tab();

    expect(deepActiveElement()).toBe(link(crumbs(m)[1]));
  });

  it('folds the crumb nearest the first one first, never the first or the current crumb', async () => {
    const m = await mountBreadcrumb(1200);

    const list = m.part('list');

    const seen: string[][] = [];

    for (const width of [700, 560, 420, 320]) {
      await resize(m, width);
      seen.push(folded(m));
      expect(list.scrollWidth, `${width}px`).toBeLessThanOrEqual(
        list.clientWidth,
      );
    }

    // Each narrower width folds a prefix of the middle crumbs, longer each step.
    for (const step of seen) {
      expect(step).toEqual(LABELS.slice(1, 1 + step.length));
    }

    expect(seen.at(-1)!.length).toBeGreaterThan(seen[0].length);
    expect(seen.at(-1)).not.toContain('Home');
    expect(seen.at(-1)).not.toContain('Project #1');
    expect(isShown(m.part('fold-button'))).toBe(true);

    const [first] = crumbs(m);

    expect(crumbs(m)[1].matches(':state(folded)')).toBe(true);
    expect(first.matches(':state(folded)')).toBe(false);
    // A folded crumb draws no separator; the fold button brings its own.
    expect(part(crumbs(m)[1], 'separator')).toBeNull();
  });

  it('measures in its own units inside a zoomed container', async () => {
    const m = await mountBreadcrumb(1200);

    m.stage.style.zoom = '2';
    // Relabelling remeasures every crumb, now under the zoom.
    crumbs(m)[1].textContent = 'Research infrastructure';
    await relaid();

    expect(folded(m)).toEqual([]);
    expect(m.part('list').getAttribute('style') ?? '').not.toContain(
      '--_c-breadcrumb',
    );
  });

  it('unfolds again as the row widens', async () => {
    const m = await mountBreadcrumb(320);

    expect(folded(m).length).toBeGreaterThan(0);

    await resize(m, 1200);

    expect(folded(m)).toEqual([]);
    expect(isShown(m.part('fold-button'))).toBe(false);
  });

  it('settles: no slot is rewritten once the layout is in place', async () => {
    const m = await mountBreadcrumb(420);

    const writes: string[] = [];

    const observer = new MutationObserver((records) =>
      writes.push(...records.map((r) => r.attributeName!)),
    );

    for (const crumb of crumbs(m)) {
      observer.observe(crumb, { attributeFilter: ['slot'] });
    }

    await settle();
    await settle();
    await settle();
    observer.disconnect();

    expect(writes).toEqual([]);
  });

  it('truncates the current crumb before the first one, titling each truncated crumb', async () => {
    const m = await mountBreadcrumb(
      1200,
      crumbsHtml([
        'Research infrastructure services',
        'Computing',
        'A project with a rather long and descriptive name',
      ]),
    );

    const [first, , current] = crumbs(m);

    expect(link(current).hasAttribute('title')).toBe(false);

    await resize(m, 400);

    expect(folded(m)).toEqual(['Computing']);
    expect(link(current).getAttribute('title')).toBe(
      'A project with a rather long and descriptive name',
    );
    expect(link(first).hasAttribute('title')).toBe(false);

    await resize(m, 200);

    expect(link(first).getAttribute('title')).toBe(
      'Research infrastructure services',
    );

    // Still one line, at the small text-button height.
    expect(m.part('list').getBoundingClientRect().height).toBe(28);
  });

  it('refolds when crumbs are added, removed or relabelled', async () => {
    const m = await mountBreadcrumb(700, crumbsHtml(LABELS.slice(0, 3)));

    expect(folded(m)).toEqual([]);

    // A route change: the consumer replaces the crumbs.
    m.host.innerHTML = crumbsHtml(LABELS);
    await relaid();

    expect(folded(m).length).toBeGreaterThan(0);

    const before = folded(m).length;

    crumbs(m)[4].textContent = 'Allocations';
    await relaid();

    expect(folded(m).length).toBeLessThanOrEqual(before);

    for (const crumb of crumbs(m).slice(1, -1)) crumb.remove();
    await relaid();

    expect(folded(m)).toEqual([]);
  });
});

describe('fold panel', () => {
  it('is a disclosure: the button names the folded crumbs and controls the panel', async () => {
    const m = await mountBreadcrumb(420);

    const button = m.part('fold-button');

    const count = folded(m).length;

    expect(button.localName).toBe('button');
    expect(button.getAttribute('aria-label')).toBe(`Show ${count} more`);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(m.part('panel').id);

    await openFold(m);

    expect(isOpen(m)).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    // The folded crumbs are rows of the panel, in order, as links.
    const rows = crumbs(m).filter((c) => c.getAttribute('slot') === 'folded');

    for (const crumb of rows) {
      expect(m.part('panel').contains(crumb.assignedSlot)).toBe(true);
      expect(link(crumb).hasAttribute('href')).toBe(true);
      expect(isShown(part(crumb, 'root')!)).toBe(true);
    }

    await userEvent.click(button);
    await settle();

    expect(isOpen(m)).toBe(false);
  });

  it('Tab walks from the button through the folded crumbs, then on along the row, closing the panel', async () => {
    const m = await mountBreadcrumb(420);

    await openFold(m);

    const rows = crumbs(m).filter((c) => c.getAttribute('slot') === 'folded');

    for (const crumb of rows) {
      await userEvent.tab();
      expect(deepActiveElement()).toBe(link(crumb));
    }

    await userEvent.tab();
    await settle();

    const next = crumbs(m)[rows.length + 1];

    expect(deepActiveElement()).toBe(link(next));
    expect(isOpen(m)).toBe(false);
  });

  it('closes on Escape from a folded crumb and returns focus to the fold button', async () => {
    const m = await mountBreadcrumb(420);

    await openFold(m);
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(m.part('fold-button'));
  });

  it('Shift+Tab walks back to the fold button, then out of the fold, closing the panel', async () => {
    const m = await mountBreadcrumb(420);

    await openFold(m);
    await userEvent.tab();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await settle();

    expect(deepActiveElement()).toBe(m.part('fold-button'));
    expect(isOpen(m)).toBe(true);

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await settle();

    expect(deepActiveElement()).toBe(link(crumbs(m)[0]));
    expect(isOpen(m)).toBe(false);
  });

  it('keeps the panel open while Tab walks it inside another shadow root', async () => {
    const m = await mountBreadcrumb(420);

    // A consumer app rendering into its own shadow root: the document's
    // active element is then the app's host, not the breadcrumb or a crumb.
    const app = document.createElement('div');

    document.body.append(app);
    app.attachShadow({ mode: 'open' }).append(m.stage);

    try {
      await relaid();
      await openFold(m);
      await userEvent.tab();
      await settle();

      expect(isOpen(m)).toBe(true);
      expect(deepActiveElement()).toBe(link(foldedCrumbs(m)[0]));
    } finally {
      app.remove();
    }
  });

  it('opens from the keyboard: Enter and Space toggle it, focus staying on the button', async () => {
    const m = await mountBreadcrumb(420);

    const button = m.part('fold-button');

    link(crumbs(m)[0]).focus();
    await userEvent.tab();

    expect(deepActiveElement()).toBe(button);

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(deepActiveElement()).toBe(button);

    await userEvent.keyboard(' ');
    await settle();

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(button);
  });

  it('↓ and ↑ on the fold button open the panel onto the first and the last folded crumb', async () => {
    const m = await mountBreadcrumb(420);

    const rows = foldedCrumbs(m);

    const button = m.part('fold-button');

    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(deepActiveElement()).toBe(link(rows[0]));

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(deepActiveElement()).toBe(button);

    await userEvent.keyboard('{ArrowUp}');
    await settle();

    expect(isOpen(m)).toBe(true);
    expect(deepActiveElement()).toBe(link(rows[rows.length - 1]));
  });

  it('↓ and ↑ move through the folded crumbs and wrap, Home and End reach the ends, the page never scrolling', async () => {
    const m = await mountBreadcrumb(420);

    const rows = foldedCrumbs(m);

    expect(rows.length).toBeGreaterThan(2);

    await openFold(m);
    await userEvent.tab();

    // Bubble phase on the document: after the breadcrumb has had the key.
    const scrolling: string[] = [];

    const onKey = (event: KeyboardEvent): void => {
      if (!event.defaultPrevented) scrolling.push(event.key);
    };

    document.addEventListener('keydown', onKey);

    try {
      for (const crumb of [...rows.slice(1), rows[0]]) {
        await userEvent.keyboard('{ArrowDown}');
        expect(deepActiveElement()).toBe(link(crumb));
      }

      await userEvent.keyboard('{ArrowUp}');
      expect(deepActiveElement()).toBe(link(rows[rows.length - 1]));

      await userEvent.keyboard('{ArrowUp}');
      expect(deepActiveElement()).toBe(link(rows[rows.length - 2]));

      await userEvent.keyboard('{Home}');
      expect(deepActiveElement()).toBe(link(rows[0]));

      await userEvent.keyboard('{End}');
      expect(deepActiveElement()).toBe(link(rows[rows.length - 1]));
    } finally {
      document.removeEventListener('keydown', onKey);
    }

    await settle();

    expect(scrolling).toEqual([]);
    expect(isOpen(m)).toBe(true);
  });

  it('skips a folded crumb without an href, as Tab does', async () => {
    const m = await mountBreadcrumb(
      420,
      crumbsHtml(LABELS).replace(' href="#crumb-2"', ''),
    );

    const rows = foldedCrumbs(m);

    const plain = crumbs(m)[2];

    // The plain crumb folds between two links.
    expect(rows.indexOf(plain)).toBeGreaterThan(0);
    expect(rows.indexOf(plain)).toBeLessThan(rows.length - 1);

    const links = rows.filter((c) => c !== plain);

    await openFold(m);
    await userEvent.tab();

    expect(deepActiveElement()).toBe(link(links[0]));

    for (const crumb of links.slice(1)) {
      await userEvent.keyboard('{ArrowDown}');
      expect(deepActiveElement()).toBe(link(crumb));
    }

    await userEvent.keyboard('{ArrowDown}');
    expect(deepActiveElement()).toBe(link(links[0]));
  });

  it("runs a folded crumb's own click listener, so a single-page app can route", async () => {
    const m = await mountBreadcrumb(420);

    const crumb = crumbs(m)[1];

    let routed = false;

    crumb.addEventListener('click', (event) => {
      event.preventDefault();
      routed = true;
    });

    const hash = location.hash;

    await openFold(m);
    await userEvent.click(link(crumb));
    await settle();

    expect(routed).toBe(true);
    expect(location.hash).toBe(hash);
    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).toBe(m.part('fold-button'));
  });

  it('closes when the row widens past the need to fold, keeping focus on the row', async () => {
    const m = await mountBreadcrumb(420);

    await openFold(m);
    await userEvent.tab();
    await resize(m, 1200);

    expect(isOpen(m)).toBe(false);
    expect(deepActiveElement()).not.toBe(document.body);
  });

  it('stays open while a narrower row folds more', async () => {
    const m = await mountBreadcrumb(560);

    const before = folded(m).length;

    await openFold(m);
    await resize(m, 320);

    expect(folded(m).length).toBeGreaterThan(before);
    expect(isOpen(m)).toBe(true);
  });

  describe('peek', () => {
    // `max-h-[80vh]` → a 320px ceiling twenty folded crumbs overflow.
    beforeAll(() => page.viewport(1200, 400));
    afterAll(() => page.viewport(1280, 800));

    it('an overflowing fold panel hides its scrollbar and ends on a half-visible crumb', async () => {
      const labels = Array.from({ length: 22 }, (_, i) => `Level ${i}`);

      const m = await mountBreadcrumb(320, crumbsHtml(labels));

      await openFold(m);
      await settle();

      const list = m.part('panel-list');

      const bottom = list.getBoundingClientRect().bottom;

      expect(list.style.maxHeight).not.toBe('');
      expect(getComputedStyle(list).scrollbarWidth).toBe('none');

      const cut = crumbs(m)
        .filter((c) => c.getAttribute('slot') === 'folded')
        .map((c) => part(c, 'root')!.getBoundingClientRect())
        .find((r) => r.top < bottom && bottom < r.bottom);

      expect(cut, 'list bottom falls inside a crumb row').toBeDefined();
    });
  });
});

describe('texts', () => {
  afterEach(() => resetDefaults());

  it('translates the navigation and the fold button per instance', async () => {
    const m = await mount('c-breadcrumb', {
      html: crumbsHtml(LABELS),
      props: {
        texts: {
          breadcrumb: 'Murupolku',
          fold: (count: number) => `Näytä ${count} lisää`,
        },
      },
    });

    m.stage.style.display = 'block';
    m.stage.style.width = '420px';
    await relaid();

    expect(m.part('root').getAttribute('aria-label')).toBe('Murupolku');
    expect(m.part('fold-button').getAttribute('aria-label')).toBe(
      `Näytä ${folded(m).length} lisää`,
    );
  });

  it('takes app-wide texts, an instance key still winning', async () => {
    applyDefaults({
      'c-breadcrumb': {
        texts: { breadcrumb: 'Murupolku', fold: () => 'Lisää' },
      },
    });

    const m = await mount('c-breadcrumb', {
      html: crumbsHtml(LABELS),
      props: { texts: { fold: () => 'Enemmän' } },
    });

    expect(m.part('root').getAttribute('aria-label')).toBe('Murupolku');
    expect(m.part('fold-button').getAttribute('aria-label')).toBe('Enemmän');
  });
});

describe('visual', () => {
  it('row, folded row, fold panel and truncated row', async () => {
    const m = await mountBreadcrumb(
      1000,
      `<c-breadcrumb-item aria-label="Home" href="#home"><svg slot="icon" viewBox="0 0 24 24" width="20" height="20"><path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" /></svg></c-breadcrumb-item>${crumbsHtml(LABELS.slice(1))}`,
    );

    await matchScreenshotInBothModes(m.stage, 'row');

    await resize(m, 420);
    await matchScreenshotInBothModes(m.stage, 'folded');

    await openFold(m);
    await matchScreenshotInBothModes(m.part('panel'), 'fold-panel');
    await userEvent.keyboard('{Escape}');
    m.part('fold-button').blur();
    await parkPointer();

    await resize(m, 200);
    expect(link(crumbs(m).at(-1)!).hasAttribute('title')).toBe(true);
    await matchScreenshotInBothModes(m.stage, 'truncated');
  });
});
