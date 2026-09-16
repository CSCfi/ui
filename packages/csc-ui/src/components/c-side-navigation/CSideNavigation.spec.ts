/**
 * Behaviour spec for c-side-navigation's pinned, self-scrolling drawer (the
 * `autoheight` host state the docs shell uses). A drawer taller than the
 * viewport scrolls on its own and contains its overscroll: a wheel that
 * reached its end used to chain to the document, and Chromium then latched
 * the rest of the gesture there, leaving the drawer stuck.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

const ITEMS = Array.from(
  { length: 40 },
  (_, i) => `<c-side-navigation-item>Item ${i}</c-side-navigation-item>`,
).join('');

describe('c-side-navigation (autoheight)', () => {
  it('fits the visible viewport under the toolbar, scrolls on its own and contains its overscroll', async () => {
    const m = await mount('c-side-navigation', {
      attrs: { class: 'autoheight' },
      html: ITEMS,
    });

    await settle();

    const style = getComputedStyle(m.host);

    expect(style.overflowY).toBe('auto');
    expect(style.overscrollBehaviorY).toBe('contain');
    expect(m.host.getBoundingClientRect().height).toBe(window.innerHeight - 60);
    expect(m.host.scrollHeight, 'the fixture overflows').toBeGreaterThan(
      m.host.clientHeight,
    );
  });
});
