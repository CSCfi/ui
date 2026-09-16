import { describe, expect, it } from 'vitest';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

describe('c-button', () => {
  it('upgrades with adopted styles and a painted root', async () => {
    const { host, part } = await mount('c-button', { html: 'Save' });

    expect(host.shadowRoot).not.toBeNull();
    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThanOrEqual(
      1,
    );
    // The Tailwind @property defaults must be registered in the light DOM,
    // or every utility border collapses (defineElement.ts).
    expect(
      document.head.querySelector('style[data-csc-ui-tw-properties]'),
    ).not.toBeNull();

    await settled();
    expect(getComputedStyle(part('root')).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  it('matches its visual baseline in both theme modes', async () => {
    const { stage } = await mount('c-button', { html: 'Save' });
    await matchScreenshotInBothModes(stage, 'default');
  });
});

describe('c-button ripple', () => {
  it('clips the ripple to the same corner shape and radius as the root', async () => {
    const { part } = await mount('c-button', { html: 'Save' });

    await settled();

    const root = getComputedStyle(part('root'));

    // The ripple clip is the root's last child.
    const ripples = getComputedStyle(part('root').lastElementChild!);

    expect(ripples.borderRadius).toBe(root.borderRadius);
    // `corner-shape` (the squircle of `rounded-csc-md`) does not inherit
    // like the radius does; the clip must restate it or a round clip sits
    // inside a squircle corner.
    expect(ripples.getPropertyValue('corner-shape')).toBe(
      root.getPropertyValue('corner-shape'),
    );
  });
});
