/**
 * Behaviour spec for c-main (CONTEXT.md "Dashboard layout", "Banner",
 * "Pinned", "Static"; ADR-0051): the document scrolls, the toolbar pins
 * itself, and c-main pins the desktop side navigation and follows the
 * toolbar's `static` mode.
 */
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settle } from '../../test/harness';

type NavHost = { mobile: boolean } & HTMLElement;

type ToolbarHost = { static: boolean } & HTMLElement;

const TOOLBAR = '<c-toolbar><span>My Service</span></c-toolbar>';

const NAV =
  '<c-side-navigation><c-side-navigation-title>My project</c-side-navigation-title><c-side-navigation-item active>Dashboard</c-side-navigation-item><c-side-navigation-item>Members</c-side-navigation-item></c-side-navigation>';

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

  it('pins the desktop side navigation beneath the toolbar', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    const nav = navOf(m);

    expect(nav.hasAttribute('data-desktop')).toBe(true);

    const style = getComputedStyle(nav);

    expect(style.position).toBe('sticky');
    expect(style.top).toBe('60px');
    expect(style.alignSelf).toBe('start');
    expect(style.overflowY).toBe('auto');
    // A wheel that reaches the drawer's end must not chain to the document.
    expect(style.overscrollBehaviorY).toBe('contain');
    expect(style.maxHeight).toBe(`${window.innerHeight - 60}px`);

    await scrollTo(500);

    expect(nav.getBoundingClientRect().top).toBe(60);
  });

  it('follows a static toolbar: it scrolls away and the side navigation pins to the top', async () => {
    const m = await mountMain(TOOLBAR + NAV + page('3000px'));

    const nav = navOf(m);

    toolbarOf(m).static = true;
    await settle();

    expect(getComputedStyle(nav).top).toBe('0px');
    expect(getComputedStyle(nav).maxHeight).toBe(`${window.innerHeight}px`);

    await scrollTo(500);

    expect(barOf(m).getBoundingClientRect().top).toBeLessThan(0);
    expect(nav.getBoundingClientRect().top).toBe(0);

    toolbarOf(m).static = false;
    await settle();

    expect(getComputedStyle(nav).top).toBe('60px');
  });

  it('observes a toolbar slotted after mount', async () => {
    const m = await mountMain(NAV + page('3000px'));

    const nav = navOf(m);

    expect(getComputedStyle(nav).top).toBe('60px');

    const late = document.createElement('c-toolbar');

    late.setAttribute('static', '');
    late.textContent = 'Late';
    m.host.prepend(late);
    await settle();

    expect(getComputedStyle(nav).top).toBe('0px');
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

    const nav = navOf(m);

    nav.mobile = true;
    await settle();

    expect(nav.hasAttribute('data-desktop')).toBe(false);
    expect(getComputedStyle(nav).position).toBe('static');
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

  it('visual: the dashboard', async () => {
    const m = await mountMain(BANNER + TOOLBAR + NAV + page('100px'));

    await matchScreenshotInBothModes(m.part('root'), 'dashboard');
  });
});
