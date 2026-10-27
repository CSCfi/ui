/**
 * Behaviour spec for c-side-navigation's drawer (CONTEXT.md "Side
 * navigation", "Drawer", "Bottom slot"). The item list is the drawer's scroll
 * container and contains its overscroll — a wheel that reached its end used
 * to chain to the document, and Chromium then latched the rest of the gesture
 * there, leaving the drawer stuck — while the bottom slot stays at the
 * drawer's bottom edge. Covers the standalone `autoheight` host state (the
 * docs shell) and the mobile drawer; the pinning inside c-main is c-main's
 * spec.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents, settle } from '../../test/harness';

const ITEMS = Array.from(
  { length: 40 },
  (_, i) => `<c-side-navigation-item>Item ${i}</c-side-navigation-item>`,
).join('');

/** A plain button: slotted csc-ui hosts are boxless, this one has a rect to measure. */
const BOTTOM =
  '<button slot="bottom" style="display: block; height: 40px">Sign out</button>';

/** The drawer's inset (`p-6` on the nav, `pb-6` on the bottom region). */
const DRAWER_INSET = 24;

describe('c-side-navigation', () => {
  it('autoheight: fits the visible viewport under the toolbar; the item list scrolls and contains its overscroll', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { class: 'autoheight' },
      html: ITEMS + BOTTOM,
    });

    await settle();

    expect(m.host.getBoundingClientRect().height).toBe(window.innerHeight - 60);

    const list = m.part('nav');

    expect(list.scrollHeight, 'the fixture overflows').toBeGreaterThan(
      list.clientHeight,
    );
    expect(getComputedStyle(list).overscrollBehaviorY).toBe('contain');
    // The host itself never overflows: the list shrinks and scrolls instead.
    expect(m.host.scrollHeight).toBe(m.host.clientHeight);

    const button = m.host.querySelector('[slot="bottom"]') as HTMLElement;

    expect(button.getBoundingClientRect().bottom).toBeCloseTo(
      m.host.getBoundingClientRect().bottom - DRAWER_INSET,
      0,
    );
  });

  it('mobile: the item list scrolls and the bottom slot sits at the panel’s bottom edge', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { mobile: true, open: true },
      html: ITEMS + BOTTOM,
    });

    await settle();

    const list = m.part('nav');

    expect(list.scrollHeight, 'the fixture overflows').toBeGreaterThan(
      list.clientHeight,
    );

    const button = m.host.querySelector('[slot="bottom"]') as HTMLElement;

    expect(button.getBoundingClientRect().bottom).toBeCloseTo(
      window.innerHeight - DRAWER_INSET,
      0,
    );

    // The drawer is sized in `dvh`, the visible viewport — not `vh`, which on
    // a phone is the viewport with the browser chrome collapsed and left the
    // drawer's tail behind the address bar. Headless Chromium has no dynamic
    // chrome, so the unit is read from the declaration that sizes the root.
    const root = m.part('root');

    // Tailwind nests its utilities in `@layer` blocks: walk grouped rules. A
    // style rule is itself a grouping rule in Firefox (it may hold nested
    // rules), so keep it as well as walking into it.
    const flatten = (rules: CSSRuleList): CSSRule[] =>
      Array.from(rules).flatMap((rule) => [
        ...(rule instanceof CSSStyleRule ? [rule] : []),
        ...(rule instanceof CSSGroupingRule ? flatten(rule.cssRules) : []),
      ]);

    const heights = Array.from(m.host.shadowRoot!.adoptedStyleSheets)
      .flatMap((sheet) => flatten(sheet.cssRules))
      .filter(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && root.matches(rule.selectorText),
      )
      .map((rule) => rule.style.height)
      .filter(Boolean);

    expect(heights, 'the drawer height declaration').toContain('100dvh');
    expect(heights).not.toContain('100vh');
  });

  // A stable scrollbar gutter on the page (the ADR-0014 advice) leaves a
  // drawer that is only slid off-screen showing in the gutter — a 15px strip
  // at the right edge of a phone. The closed drawer is invisible instead.
  it('mobile: the closed drawer shows nothing, even beside a stable scrollbar gutter', async () => {
    const root = document.documentElement;

    const gutter = root.style.scrollbarGutter;

    root.style.scrollbarGutter = 'stable';

    try {
      const m = await mount('c-side-navigation', {
        attrs: { mobile: true },
        html: ITEMS,
      });

      await settle(300);

      const drawer = m.part('root');

      expect(getComputedStyle(drawer).visibility).toBe('hidden');
      // The slide is Tailwind's `translate` property, not `transform`: it has
      // to stay in the transition list, or the drawer jumps instead.
      expect(getComputedStyle(drawer).transitionProperty).toContain(
        'translate',
      );

      (m.host as { open?: boolean } & HTMLElement).open = true;
      await settle(300);

      expect(getComputedStyle(drawer).visibility).toBe('visible');
      expect(drawer.getBoundingClientRect().right).toBeLessThanOrEqual(
        window.innerWidth,
      );
    } finally {
      root.style.scrollbarGutter = gutter;
    }
  });

  describe('select', () => {
    const NAV =
      '<c-side-navigation-item value="dashboard">Dashboard</c-side-navigation-item>' +
      '<c-side-navigation-item value="projects">Projects' +
      '<c-sub-navigation-item value="active">Active</c-sub-navigation-item>' +
      '<c-sub-navigation-item value="archived">Archived</c-sub-navigation-item>' +
      '</c-side-navigation-item>';

    type ItemHost = { active: boolean } & HTMLElement;

    const item = (m: { host: HTMLElement }, value: string): ItemHost =>
      m.host.querySelector(`[value="${value}"]`) as ItemHost;

    const box = (el: HTMLElement, part: string): HTMLElement =>
      el.shadowRoot!.querySelector(`[part~="${part}"]`) as HTMLElement;

    it('an item fires select with its value, heard on the navigation', async () => {
      const m = await mount('c-side-navigation', { html: NAV });

      await settle();

      const events = recordEvents(m.host, ['select']);

      await userEvent.click(box(item(m, 'dashboard'), 'header'));
      box(item(m, 'dashboard'), 'header').focus();
      await userEvent.keyboard('{Enter}');

      expect(events.details()).toEqual([
        { value: 'dashboard' },
        { value: 'dashboard' },
      ]);
    });

    it('a sub-item fires select with its value and leaves the parent items alone', async () => {
      const m = await mount('c-side-navigation', { html: NAV });

      await settle();

      // Open the parent so its sub-items are shown.
      await userEvent.click(box(item(m, 'projects'), 'header'));
      await settle();

      const events = recordEvents(m.host, ['select']);

      await userEvent.click(box(item(m, 'active'), 'root'));

      expect(events.details()).toEqual([{ value: 'active' }]);
      expect(item(m, 'projects').active).toBe(true);
    });

    it('the page marks the current page: activating a leaf moves no highlight', async () => {
      const m = await mount('c-side-navigation', {
        html: `${NAV}<c-side-navigation-item value="settings">Settings</c-side-navigation-item>`,
      });

      // As a page's binding does, from the page it shows.
      item(m, 'settings').active = true;
      await settle();

      const current = (): string[] =>
        [...m.host.querySelectorAll<ItemHost>('[value]')]
          .filter((el) => el.active)
          .map((el) => el.getAttribute('value')!);

      // A router can cancel the navigation a click asks for; the item the page
      // marked stays the current page until the page says otherwise.
      await userEvent.click(box(item(m, 'dashboard'), 'header'));
      await settle();

      expect(current()).toEqual(['settings']);
      expect(
        box(item(m, 'dashboard'), 'header').hasAttribute('aria-current'),
      ).toBe(false);
      expect(
        box(item(m, 'settings'), 'header').getAttribute('aria-current'),
      ).toBe('page');

      // A parent still expands itself; its sub-item is a leaf like any other.
      await userEvent.click(box(item(m, 'projects'), 'header'));
      await settle();
      await userEvent.click(box(item(m, 'archived'), 'root'));
      await settle();

      expect(current()).toEqual(['projects', 'settings']);
    });

    it('an item with an href fires select once on Enter', async () => {
      const m = await mount('c-side-navigation', {
        html: '<c-side-navigation-item href="#side-nav-enter" value="docs">Docs</c-side-navigation-item>',
      });

      await settle();

      const events = recordEvents(m.host, ['select']);

      box(item(m, 'docs'), 'header').focus();
      await userEvent.keyboard('{Enter}');
      await settle();

      expect(events.details()).toEqual([{ value: 'docs' }]);
    });

    it('a nested item follows its href and leaves its parent open', async () => {
      const m = await mount('c-side-navigation', {
        html:
          '<c-side-navigation-item value="guides">Guides' +
          '<c-side-navigation-item href="#side-nav-nested" value="intro">Intro</c-side-navigation-item>' +
          '</c-side-navigation-item>',
      });

      await settle();
      await userEvent.click(box(item(m, 'guides'), 'header'));
      await settle();

      const events = recordEvents(m.host, ['select']);

      await userEvent.click(box(item(m, 'intro'), 'header'));
      await settle();

      expect(location.hash).toBe('#side-nav-nested');
      expect(events.details()).toEqual([{ value: 'intro' }]);
      expect(item(m, 'guides').active).toBe(true);
      expect(item(m, 'intro').active).toBe(false);
      history.replaceState(null, '', location.pathname + location.search);
    });

    it('a sub-item added after mount goes under its item', async () => {
      const m = await mount('c-side-navigation', { html: NAV });

      await settle();

      const added = ['dashboard', 'projects'].map((value) => {
        const sub = document.createElement('c-sub-navigation-item');

        sub.setAttribute('value', `${value}-new`);
        sub.textContent = 'New';
        item(m, value).append(sub);

        return sub;
      });

      await settle();

      for (const sub of added) {
        expect(sub.assignedSlot?.name, sub.getAttribute('value')!).toBe(
          'sub-item',
        );
      }

      expect(
        box(item(m, 'dashboard'), 'header').getAttribute('aria-expanded'),
      ).toBe('false');
    });
  });
});

describe('open (decisions #44)', () => {
  type NavHost = { open?: boolean } & HTMLElement;

  const ITEMS =
    '<c-side-navigation-item value="/home">Home</c-side-navigation-item>';

  const navButton = async () => {
    const b = await mount('c-navigation-button');

    return b.host
      .shadowRoot!.querySelector('c-icon-button')!
      .shadowRoot!.querySelector('button')!;
  };

  it('Enter on a c-navigation-button opens the drawer once, and fires change:open', async () => {
    const nav = await mount<NavHost>('c-side-navigation', {
      attrs: { mobile: true },
      html: ITEMS,
    });

    const events = recordEvents(nav.host, ['change:open']);

    (await navButton()).focus();
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(nav.host.open).toBe(true);
    expect(events.records.map((r) => r.detail)).toEqual([true]);
  });

  it('activating a leaf item closes the drawer and fires change:open', async () => {
    const nav = await mount<NavHost>('c-side-navigation', {
      attrs: { mobile: true, open: true },
      html: ITEMS,
    });

    const events = recordEvents(nav.host, ['change:open']);

    nav.host.querySelector('c-side-navigation-item')!.dispatchEvent(
      new CustomEvent('select', {
        bubbles: true,
        composed: true,
        detail: { value: '/home' },
      }),
    );
    await settle();

    expect(nav.host.open).toBe(false);
    expect(events.records.map((r) => r.detail)).toEqual([false]);
  });

  it('a c-navigation-button leaves a desktop navigation alone', async () => {
    const nav = await mount<NavHost>('c-side-navigation', { html: ITEMS });

    const events = recordEvents(nav.host, ['change:open']);

    (await navButton()).click();
    await settle();

    expect(nav.host.open).toBe(false);
    expect(events.records).toEqual([]);
  });

  it('a value set from code fires nothing', async () => {
    const nav = await mount<NavHost>('c-side-navigation', {
      attrs: { mobile: true },
      html: ITEMS,
    });

    const events = recordEvents(nav.host, ['change:open']);

    nav.host.open = true;
    await settle();

    expect(events.records).toEqual([]);
  });
});

describe('APG disclosure navigation', () => {
  const NAV =
    '<c-side-navigation-title>My project</c-side-navigation-title>' +
    '<c-side-navigation-item value="dashboard">Dashboard</c-side-navigation-item>' +
    '<c-side-navigation-item href="#docs" value="docs">Docs</c-side-navigation-item>' +
    '<c-side-navigation-item value="projects">Projects' +
    '<c-sub-navigation-item value="active">Active</c-sub-navigation-item>' +
    '<c-sub-navigation-item href="#archived" value="archived">Archived</c-sub-navigation-item>' +
    '</c-side-navigation-item>';

  const at = (m: { host: HTMLElement }, value: string): HTMLElement =>
    m.host.querySelector(`[value="${value}"]`) as HTMLElement;

  const partOf = (el: HTMLElement, name: string): HTMLElement =>
    el.shadowRoot!.querySelector(`[part~="${name}"]`) as HTMLElement;

  it('is a nav landmark of links and buttons, not a menubar', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { 'aria-label': 'Project' },
      html: NAV,
    });

    await settle();

    expect(m.part('nav').hasAttribute('role')).toBe(false);
    expect(m.part('nav').getAttribute('aria-label')).toBe('Project');

    expect(partOf(at(m, 'dashboard'), 'header').localName).toBe('button');
    expect(partOf(at(m, 'docs'), 'header').localName).toBe('a');
    expect(partOf(at(m, 'active'), 'root').localName).toBe('button');
    expect(partOf(at(m, 'archived'), 'root').getAttribute('href')).toBe(
      '#archived',
    );
    expect(m.host.shadowRoot!.querySelector('[role^="menu"]')).toBeNull();

    for (const value of ['dashboard', 'docs', 'projects', 'active']) {
      expect(
        at(m, value).shadowRoot!.querySelector('[role^="menu"]'),
        value,
      ).toBeNull();
    }

    // A parent is a disclosure button for its sub-items.
    const parent = partOf(at(m, 'projects'), 'header');

    expect(parent.getAttribute('aria-expanded')).toBe('false');

    const controlled = at(m, 'projects').shadowRoot!.getElementById(
      parent.getAttribute('aria-controls')!,
    );

    expect(controlled?.getAttribute('part')).toBe('sub-nav');
  });

  it('section titles are headings', async () => {
    const m = await mount('c-side-navigation', { html: NAV });

    const heading = partOf(
      m.host.querySelector('c-side-navigation-title')!,
      'heading',
    );

    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('the mobile drawer is a modal dialog the navigation button reports', async () => {
    const button = await mount('c-navigation-button');

    const inner = button.host
      .shadowRoot!.querySelector('c-icon-button')!
      .shadowRoot!.querySelector('button')!;

    const nav = await mount<{ open?: boolean } & HTMLElement>(
      'c-side-navigation',
      { attrs: { mobile: true }, html: NAV },
    );

    await settle();
    expect(inner.getAttribute('aria-expanded')).toBe('false');

    inner.focus();
    await userEvent.keyboard('{Enter}');
    await settle();

    const drawer = nav.part('root');

    expect(nav.host.open).toBe(true);
    expect(drawer.getAttribute('role')).toBe('dialog');
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    expect(inner.getAttribute('aria-expanded')).toBe('true');
    // Focus moved into the drawer, and the page behind it is inert.
    expect(nav.host.matches(':focus-within')).toBe(true);
    expect(button.stage.inert).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(nav.host.open).toBe(false);
    expect(drawer.hasAttribute('role')).toBe(false);
    expect(button.stage.inert).toBe(false);
    expect(inner.getAttribute('aria-expanded')).toBe('false');
    expect(button.host.shadowRoot!.activeElement).not.toBeNull();
  });

  it('the navigation button reports nothing beside a desktop navigation', async () => {
    const button = await mount('c-navigation-button');

    await mount('c-side-navigation', { html: NAV });
    await settle();

    const inner = button.host
      .shadowRoot!.querySelector('c-icon-button')!
      .shadowRoot!.querySelector('button')!;

    expect(inner.hasAttribute('aria-expanded')).toBe(false);
  });
});
