/**
 * Behaviour spec for c-page (CONTEXT.md "Page"; ADR-0051): a plain region
 * that grows with its content — the document scrolls, and the scroll
 * indicator follows the document.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

const TALL = '<div style="height: 3000px">Content</div>';

describe('c-page', () => {
  afterEach(() => {
    window.scrollTo(0, 0);
  });

  it('is not a scroll container: it grows with its content', async () => {
    const m = await mount('c-page', { html: TALL, stage: false });

    const style = getComputedStyle(m.host);

    expect(style.display).toBe('grid');
    expect(style.overflowY).toBe('visible');
    expect(m.host.getBoundingClientRect().height).toBeGreaterThanOrEqual(3000);
    expect(m.host.scrollHeight).toBe(m.host.clientHeight);
  });

  it('scroll-indicator tracks the document scroll', async () => {
    const m = await mount('c-page', {
      html: TALL,
      props: { scrollIndicator: true },
      stage: false,
    });

    const scroller = document.scrollingElement!;

    const range = scroller.scrollHeight - scroller.clientHeight;

    window.scrollTo(0, Math.floor(range / 2));
    await settle();

    expect(m.part('scroll-indicator').style.width).toBe(
      `${(scroller.scrollTop / range) * 100}%`,
    );

    window.scrollTo(0, range);
    await settle();

    expect(m.part('scroll-indicator').style.width).toBe('100%');
  });

  it('scroll-indicator paints above a pinned toolbar inside c-main', async () => {
    await mount('c-main', {
      html: `<c-toolbar>Toolbar</c-toolbar><c-page scroll-indicator>${TALL}</c-page>`,
      stage: false,
    });

    const scroller = document.scrollingElement!;

    window.scrollTo(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    await settle();

    // A point on both the toolbar and the indicator's bar.
    expect(document.elementFromPoint(100, 1)?.localName).toBe('c-page');
  });

  it('puts the footer at the bottom of a sized host', async () => {
    const m = await mount('c-page', {
      attrs: { style: 'height: 240px' },
      html: '<p>Short</p><div slot="footer">Footer</div>',
      stage: false,
    });

    const footer = m.host.querySelector('[slot="footer"]') as HTMLElement;

    expect(footer.getBoundingClientRect().bottom).toBeCloseTo(
      m.host.getBoundingClientRect().bottom,
      0,
    );
  });
});
