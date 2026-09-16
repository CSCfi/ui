/**
 * Behaviour spec for c-main (CONTEXT.md "Dashboard layout", "Banner",
 * "Pinned", "Static", "Side navigation", "Bottom slot"; ADR-0051): the
 * document scrolls, the toolbar pins itself, and c-main pins the desktop side
 * navigation — sized to the pinned height so its bottom slot sits at the
 * bottom edge — and follows the toolbar's `static` mode.
 */
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settle } from '../../test/harness';

type NavHost = { mobile: boolean } & HTMLElement;

type ToolbarHost = { static: boolean } & HTMLElement;

const TOOLBAR = '<c-toolbar><span>My Service</span></c-toolbar>';

const STATIC_TOOLBAR = '<c-toolbar static><span>My Service</span></c-toolbar>';

const ITEMS =
  '<c-side-navigation-title>My project</c-side-navigation-title><c-side-navigation-item active>Dashboard</c-side-navigation-item><c-side-navigation-item>Members</c-side-navigation-item>';

const LONG_ITEMS = Array.from(
  { length: 40 },
  (_, i) => `<c-side-navigation-item>Item ${i}</c-side-navigation-item>`,
).join('');

/** A plain button: slotted csc-ui hosts are boxless, this one has a rect to measure. */
const BOTTOM =
  '<button slot="bottom" style="display: block; height: 40px">Sign out</button>';

/** The drawer's inset (`p-6` on the nav, `pb-6` on the bottom region). */
const DRAWER_INSET = 24;

const nav = (items: string, attrs = '') =>
  `<c-side-navigation ${attrs}>${items}</c-side-navigation>`;

const NAV = nav(ITEMS);

const BANNER =
  '<div slot="banner" style="height: 40px">Maintenance notice</div>';

const page = (height: string) =>
  `<c-page><div style="height: ${height}">Content</div><div slot="footer">Footer</div></c-page>`;

const mountMain = (html: string, attrs: Record<string, boolean> = {}) =>
  mount('c-main', { attrs, html, stage: false });

const toolbarOf = (m: Mounted): ToolbarHost =>
  m.host.querySelector('c-toolbar') as ToolbarHost;

const barOf = (m: Mounted): HTMLElement =>
  toolbarOf(m).shadowRoot!.querySelector('[part~="root"]') as HTMLElement;

const navOf = (m: Mounted): NavHost =>
  m.host.querySelector('c-side-navigation') as NavHost;

/** The drawer's scrollable `<nav>` holding the items. */
const navPartOf = (m: Mounted): HTMLElement =>
  navOf(m).shadowRoot!.querySelector('[part~="nav"]') as HTMLElement;

const pageOf = (m: Mounted): HTMLElement =>
  m.host.querySelector('c-page') as HTMLElement;

const slotted = (m: Mounted, slot: string): HTMLElement =>
  m.host.querySelector(`[slot="${slot}"]`) as HTMLElement;

const scrollTo = async (y: number) => {
  window.scrollTo(0, y);
  await settle();
};

describe('c-main', () => {
  afterEach(() => {
    window.scrollTo(0, 0);
  });

  it('lets the document scroll; c-page is not a scroll container', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    await scrollTo(500);

    expect(document.scrollingElement?.scrollTop).toBe(500);

    const pageEl = pageOf(m);

    expect(getComputedStyle(pageEl).overflowY).toBe('visible');
    expect(pageEl.scrollHeight).toBe(pageEl.clientHeight);
  });

  it('keeps the pinned toolbar at the viewport top while the document scrolls', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    await scrollTo(500);

    expect(getComputedStyle(barOf(m)).position).toBe('sticky');
    expect(barOf(m).getBoundingClientRect().top).toBe(0);
  });

  it('pins the desktop side navigation beneath the toolbar, sized to the pinned height', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    const drawer = navOf(m);

    expect(drawer.hasAttribute('data-desktop')).toBe(true);

    const style = getComputedStyle(drawer);

    expect(style.position).toBe('sticky');
    expect(style.top).toBe('60px');
    expect(style.alignSelf).toBe('start');
    // The drawer itself is not a scroll container: the item list scrolls
    // inside c-side-navigation, and the bottom slot's own pin needs the
    // document as its nearest scrollport.
    expect(style.overflowY).toBe('visible');
    expect(style.height).toBe(`${window.innerHeight - 60}px`);

    await scrollTo(500);

    expect(drawer.getBoundingClientRect().top).toBe(60);
  });

  it('follows a static toolbar: it scrolls away and the side navigation pins to the top', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    const drawer = navOf(m);

    toolbarOf(m).static = true;
    await settle();

    expect(getComputedStyle(drawer).top).toBe('0px');
    expect(getComputedStyle(drawer).height).toBe(`${window.innerHeight}px`);

    await scrollTo(500);

    expect(barOf(m).getBoundingClientRect().top).toBeLessThan(0);
    expect(drawer.getBoundingClientRect().top).toBe(0);

    toolbarOf(m).static = false;
    await settle();

    expect(getComputedStyle(drawer).top).toBe('60px');
  });

  it('observes a toolbar slotted after mount', async () => {
    const m = await mountMain(NAV + page('3000px'));

    const drawer = navOf(m);

    expect(getComputedStyle(drawer).top).toBe('60px');

    const late = document.createElement('c-toolbar');

    late.setAttribute('static', '');
    late.textContent = 'Late';
    m.host.prepend(late);
    await settle();

    expect(getComputedStyle(drawer).top).toBe('0px');
  });

  it('places the banner above the toolbar; it scrolls away and the toolbar pins in its place', async () => {
    const m = await mountMain(BANNER + TOOLBAR + NAV + page('3000px'));

    const banner = slotted(m, 'banner');

    const root = m.part('root');

    expect(banner.getBoundingClientRect().top).toBe(
      root.getBoundingClientRect().top,
    );
    expect(barOf(m).getBoundingClientRect().top).toBe(
      banner.getBoundingClientRect().bottom,
    );

    await scrollTo(500);

    expect(banner.getBoundingClientRect().bottom).toBeLessThan(0);
    expect(barOf(m).getBoundingClientRect().top).toBe(0);
    expect(navOf(m).getBoundingClientRect().top).toBe(60);
  });

  it('spans the toolbar and the banner across both columns, even for boxless hosts', async () => {
    const m = await mountMain(
      `<c-alert slot="banner" type="info">Notice</c-alert>${TOOLBAR}${
        NAV
      }${page('100px')}`,
    );

    const width = m.part('root').getBoundingClientRect().width;

    expect(barOf(m).getBoundingClientRect().width).toBe(width);

    const alertRoot = slotted(m, 'banner').shadowRoot!.querySelector(
      '[part~="root"]',
    ) as HTMLElement;

    expect(alertRoot.getBoundingClientRect().width).toBe(width);
    expect(barOf(m).getBoundingClientRect().top).toBe(
      alertRoot.getBoundingClientRect().bottom,
    );
  });

  it('collapses the banner row when nothing is slotted', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('100px'));

    expect(barOf(m).getBoundingClientRect().top).toBe(
      m.part('root').getBoundingClientRect().top,
    );
  });

  it('stretches a short page so its footer sits at the bottom of the viewport-high shell', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('100px'));

    const root = m.part('root');

    expect(root.getBoundingClientRect().height).toBe(window.innerHeight);

    const footer = slotted(m, 'footer');

    expect(footer.getBoundingClientRect().bottom).toBeCloseTo(
      root.getBoundingClientRect().bottom,
      0,
    );
  });

  it('leaves the mobile drawer unpinned', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    const drawer = navOf(m);

    drawer.mobile = true;
    await settle();

    expect(drawer.hasAttribute('data-desktop')).toBe(false);
    expect(getComputedStyle(drawer).position).toBe('static');
  });

  it('disable-layout: a viewport-high column with the banner first', async () => {
    const m = await mountMain(BANNER + TOOLBAR + page('100px'), {
      'disable-layout': true,
    });

    const root = m.part('root');

    expect(getComputedStyle(root).display).toBe('flex');
    expect(root.getBoundingClientRect().height).toBeGreaterThanOrEqual(
      window.innerHeight,
    );

    const banner = slotted(m, 'banner');

    expect(banner.getBoundingClientRect().top).toBe(
      root.getBoundingClientRect().top,
    );
    expect(barOf(m).getBoundingClientRect().top).toBe(
      banner.getBoundingClientRect().bottom,
    );
  });

  describe('bottom slot', () => {
    it('fills the pinned height with a short menu so the bottom slot sits at the bottom edge', async () => {
      const m = await mountMain(TOOLBAR + nav(ITEMS + BOTTOM) + page('3000px'));

      expect(navOf(m).getBoundingClientRect().height).toBe(
        window.innerHeight - 60,
      );
      expect(slotted(m, 'bottom').getBoundingClientRect().bottom).toBeCloseTo(
        window.innerHeight - DRAWER_INSET,
        0,
      );

      await scrollTo(500);

      expect(slotted(m, 'bottom').getBoundingClientRect().bottom).toBeCloseTo(
        window.innerHeight - DRAWER_INSET,
        0,
      );
    });

    it('reaches the bottom edge under a banner and a static toolbar before the drawer has pinned, even with autoheight', async () => {
      const m = await mountMain(
        BANNER +
          STATIC_TOOLBAR +
          nav(ITEMS + BOTTOM, 'class="autoheight"') +
          page('3000px'),
      );

      const button = slotted(m, 'bottom');

      // At rest the banner and the toolbar sit above the drawer; the slot
      // still ends at the viewport's bottom edge.
      expect(button.getBoundingClientRect().bottom).toBeCloseTo(
        window.innerHeight - DRAWER_INSET,
        0,
      );

      await scrollTo(500);

      // Pinned to the top edge (static toolbar), the drawer is a full
      // viewport tall — `autoheight`'s viewport-minus-toolbar is overridden.
      expect(navOf(m).getBoundingClientRect().top).toBe(0);
      expect(navOf(m).getBoundingClientRect().height).toBe(window.innerHeight);
      expect(button.getBoundingClientRect().bottom).toBeCloseTo(
        window.innerHeight - DRAWER_INSET,
        0,
      );
    });

    it('gives a long menu its own scrollbar above a bottom slot that stays visible', async () => {
      const m = await mountMain(
        TOOLBAR + nav(LONG_ITEMS + BOTTOM) + page('3000px'),
      );

      const list = navPartOf(m);

      expect(list.scrollHeight, 'the fixture overflows').toBeGreaterThan(
        list.clientHeight,
      );
      expect(getComputedStyle(list).overscrollBehaviorY).toBe('contain');

      await scrollTo(500);

      const button = slotted(m, 'bottom').getBoundingClientRect();

      expect(button.bottom).toBeCloseTo(window.innerHeight - DRAWER_INSET, 0);
      expect(list.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        button.top,
      );
    });

    it('sizes the drawer from --c-main-viewport-height inside a bounded shell', async () => {
      const m = await mountMain(TOOLBAR + nav(ITEMS + BOTTOM) + page('3000px'));

      const root = m.part('root');

      root.style.cssText =
        'height: 320px; min-height: 0; overflow-y: auto; --c-main-viewport-height: 320px';
      await settle();

      expect(navOf(m).getBoundingClientRect().height).toBe(320 - 60);
      expect(slotted(m, 'bottom').getBoundingClientRect().bottom).toBeCloseTo(
        root.getBoundingClientRect().bottom - DRAWER_INSET,
        0,
      );
    });
  });

  it('visual: the dashboard', async () => {
    const m = await mountMain(BANNER + TOOLBAR + NAV + page('100px'));

    await matchScreenshotInBothModes(m.part('root'), 'dashboard');
  });

  it('visual: the bottom slot', async () => {
    const m = await mountMain(
      TOOLBAR +
        nav(`${ITEMS}<c-button slot="bottom" inverted>Sign out</c-button>`) +
        page('100px'),
    );

    await matchScreenshotInBothModes(m.part('root'), 'bottom-slot');
  });
});
