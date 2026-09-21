/**
 * Behaviour spec for c-tab. A `c-badge` slotted into a tab is a corner overlay:
 * its root is `absolute -right-1.5 -top-1.5` with a 2px ring, so it paints 8px
 * outside the tab box. The tab used to clip it three times over — on
 * `[part=root]`, on the host, and again on the tab strip's clipping viewport —
 * so only the inner sliver survived.
 */
import { describe, expect, it } from 'vitest';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

const LABELS = [
  'Overview',
  'Members',
  'Settings',
  'Billing',
  'Integrations',
  'Audit log',
];

const TABS =
  '<c-tab value="summary">Summary</c-tab>' +
  '<c-tab value="members">Members<c-badge>2</c-badge></c-tab>' +
  '<c-tab value="settings">Settings</c-tab>';

/**
 * Walk the flat tree upwards, hopping out of each shadow root, and collect
 * every ancestor that clips. `overflow-clip-margin` only applies to
 * `overflow: clip`, so any other non-`visible` value clips at 0 margin.
 *
 * Neither clipping element here carries a border, so the border box
 * `getBoundingClientRect()` returns is also the padding box the clip is
 * measured from.
 */
const clippersAbove = (start: Element) => {
  const clippers: { element: Element; margin: number }[] = [];

  let node: Node | null = start;

  while (node) {
    if (node instanceof Element) {
      const style = getComputedStyle(node);

      if (style.overflow !== 'visible') {
        clippers.push({
          element: node,
          margin:
            style.overflow === 'clip'
              ? parseFloat(style.overflowClipMargin) || 0
              : 0,
        });
      }

      node = node.assignedSlot ?? node.parentNode;

      continue;
    }

    node = node instanceof ShadowRoot ? node.host : node.parentNode;
  }

  return clippers;
};

const describeClip = (element: Element) => {
  const part = element.getAttribute('part');

  return part
    ? `${element.tagName.toLowerCase()} [part=${part}]`
    : element.tagName.toLowerCase();
};

describe('c-tab badge overhang', () => {
  it('lets a slotted c-badge paint outside the tab and the strip', async () => {
    const { host } = await mount('c-tabs', { html: TABS });

    await settled();

    const badge = host.querySelector('c-badge')!;
    const badgeRoot = badge.shadowRoot!.querySelector('[part~="root"]')!;
    const rect = badgeRoot.getBoundingClientRect();

    expect(rect.width).toBeGreaterThan(0);

    const cut = clippersAbove(badgeRoot)
      .filter(({ element, margin }) => {
        const clip = element.getBoundingClientRect();

        return (
          rect.top < clip.top - margin ||
          rect.left < clip.left - margin ||
          rect.right > clip.right + margin ||
          rect.bottom > clip.bottom + margin
        );
      })
      .map(({ element }) => describeClip(element));

    expect(cut).toEqual([]);
  });

  it('matches its visual baseline in both theme modes', async () => {
    const { stage } = await mount('c-tabs', { html: TABS });

    await settled();

    await matchScreenshotInBothModes(stage, 'badge');
  });
});

describe('c-tab label', () => {
  it('keeps an over-long label inside the tab in vertical mode', async () => {
    // Vertical tabs pin every tab to `min/max-width: 100%`, so a
    // `whitespace-nowrap` label longer than the strip has to be cut off rather
    // than widen the tab. `[part=root]` is a flex item of the host, and swapping
    // its `overflow: hidden` for `clip` stopped it being a scroll container —
    // the shortcut that used to make its `min-width: auto` resolve to 0. Its
    // explicit `w-full` is what holds the line now (a definite width is the
    // specified size suggestion that caps the content-based minimum), so this
    // guards the pairing: drop `w-full`, or give the root a content-sized width,
    // and a long label starts widening the tab again.
    const { host } = await mount('c-tabs', {
      attrs: { vertical: true },
      html:
        '<c-tab value="short">Short</c-tab>' +
        `<c-tab value="long">${'Extraordinarily long tab label '.repeat(4)}</c-tab>`,
    });

    await settled();

    const tab = host.querySelectorAll('c-tab')[1]!;
    const root = tab.shadowRoot!.querySelector('[part~="root"]')!;

    expect(root.getBoundingClientRect().width).toBeLessThanOrEqual(
      tab.getBoundingClientRect().width + 0.5,
    );
  });
});

describe('c-tab strip', () => {
  it('still clips and squeezes to its grid cell when the tabs overflow', async () => {
    // `[part=tabs]` clips with a margin now. `overflow: clip` is not a scroll
    // container, so it needs the explicit `min-w-0` that `hidden` implied —
    // without it the viewport takes the min-content width of the whole tab row
    // as its automatic minimum, outgrows its grid cell and never reports
    // overflow, so the arrows never appear.
    const m = await mount('c-tabs', {
      html: LABELS.map(
        (label) => `<c-tab value="${label.toLowerCase()}">${label}</c-tab>`,
      ).join(''),
      props: { value: 'overview' },
    });

    m.stage.style.cssText = 'display:block;padding:8px;width:320px';
    await settled();

    const viewport = m.part('tabs');

    expect(
      viewport.getBoundingClientRect().width,
      'viewport squeezed to the stage',
    ).toBeLessThanOrEqual(m.stage.getBoundingClientRect().width + 0.5);

    expect(
      m.host.classList.contains('c-tabs--overflow'),
      'overflow detected',
    ).toBe(true);

    expect(
      m.shadowAll('c-icon-button').length,
      'back and forward arrows rendered',
    ).toBe(2);
  });
});

describe('c-tab', () => {
  it('upgrades with adopted styles and a painted root', async () => {
    const { host, part } = await mount('c-tab', { html: 'Summary' });

    expect(host.shadowRoot).not.toBeNull();
    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThanOrEqual(
      1,
    );
    expect(getComputedStyle(part('root')).display).toBe('flex');
  });
});
