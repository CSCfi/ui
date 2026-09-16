/**
 * Behaviour spec for c-side-navigation-title. Seeded from the report that the
 * first section title in a navigation carried its section-separating top
 * margin on top of the nav padding.
 */
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

const TITLE_MARGIN = '24px'; // `mt-6`

const titleRoot = (title: Element): HTMLElement =>
  title.shadowRoot!.querySelector('[part~="root"]') as HTMLElement;

describe('c-side-navigation-title', () => {
  it('drops its top margin when it is the first child of the navigation', async () => {
    const m = await mount('c-side-navigation', {
      html: '<c-side-navigation-title>Guides</c-side-navigation-title><c-side-navigation-item>One</c-side-navigation-item><c-side-navigation-title>Components</c-side-navigation-title>',
    });

    const [first, second] = Array.from(
      m.host.querySelectorAll('c-side-navigation-title'),
    );

    expect(getComputedStyle(titleRoot(first)).marginTop).toBe('0px');
    expect(getComputedStyle(titleRoot(second)).marginTop).toBe(TITLE_MARGIN);
  });

  it('keeps the top margin when an item precedes it', async () => {
    const m = await mount('c-side-navigation', {
      html: '<c-side-navigation-item>One</c-side-navigation-item><c-side-navigation-title>More</c-side-navigation-title>',
    });

    const title = m.host.querySelector('c-side-navigation-title')!;

    expect(getComputedStyle(titleRoot(title)).marginTop).toBe(TITLE_MARGIN);
  });
});
