/**
 * Behaviour spec for c-progress-bar (CONTEXT.md "Progress bar", "Progress
 * track", "Bar"; ADR-0086). Seeded from `label` naming the progress element —
 * it used to be only the text after the percentage — and from the track and
 * bar no `::part()` rule could recolour.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { commands } from 'vitest/browser';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settle } from '../../test/harness';

it('names the progress element with its label', async () => {
  const m = await mount('c-progress-bar', {
    attrs: { label: 'Uploading files', value: 40 },
  });

  expect(m.part('track').getAttribute('aria-label')).toBe('Uploading files');
});

it('an aria-label on the element names the progress bar without a label', async () => {
  const m = await mount('c-progress-bar', {
    attrs: { 'aria-label': 'Storage used', value: 40 },
  });

  expect(m.part('track').getAttribute('aria-label')).toBe('Storage used');
});

it('shows no percentage tooltip while indeterminate', async () => {
  const { host } = await mount('c-progress-bar', {
    attrs: { indeterminate: true, value: 0 },
  });

  expect(host.hasAttribute('title')).toBe(false);
});

it('the progress track carries the progressbar role and the value', async () => {
  const m = await mount('c-progress-bar', {
    attrs: { label: 'Uploading files', value: 40 },
  });

  const track = m.part('track');

  expect(track.getAttribute('role')).toBe('progressbar');
  expect(track.getAttribute('aria-valuemin')).toBe('0');
  expect(track.getAttribute('aria-valuemax')).toBe('100');
  expect(track.getAttribute('aria-valuenow')).toBe('40');

  m.host.setAttribute('indeterminate', '');
  await settle();
  expect(track.hasAttribute('aria-valuenow')).toBe(false);
  m.unmount();
});

describe('recolour via ::part()', () => {
  const TRACK = 'rgb(10, 20, 30)';

  const BAR = 'rgb(200, 100, 50)';

  let sheet: HTMLStyleElement | undefined;

  afterEach(() => {
    sheet?.remove();
  });

  const recoloured = async (
    attrs: Record<string, boolean | number | string>,
  ): Promise<Mounted> => {
    sheet = document.createElement('style');
    sheet.textContent = `
      c-progress-bar.recolour::part(track) { background-color: ${TRACK}; }
      c-progress-bar.recolour::part(bar) { background-color: ${BAR}; }
    `;
    document.head.append(sheet);

    const m = await mount('c-progress-bar', {
      attrs: { class: 'recolour', ...attrs },
    });

    m.stage.style.cssText = 'display:block;padding:8px;width:320px';
    await settle();

    return m;
  };

  /** What paints at the middle of `el`, inside the element's shadow root. */
  const paintedAtCentre = (m: Mounted, el: Element): Element | null => {
    const rect = el.getBoundingClientRect();

    return m.host.shadowRoot!.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  };

  it('::part(track) paints the ground and ::part(bar) the bar, uncovered', async () => {
    const m = await recoloured({ value: 40 });

    const track = m.part('track');

    const bar = m.part('bar');

    expect(getComputedStyle(track).backgroundColor).toBe(TRACK);
    expect(getComputedStyle(bar).backgroundColor).toBe(BAR);
    expect(getComputedStyle(track).opacity).toBe('1');
    expect(paintedAtCentre(m, bar)).toBe(bar);
    m.unmount();
  });

  it('the bar fills value % of the track inside its frame, clamped', async () => {
    const m = await recoloured({ value: 40 });

    const track = m.part('track');

    const bar = m.part('bar');

    const inner = (): number => {
      const style = getComputedStyle(track);

      return (
        track.getBoundingClientRect().width -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight)
      );
    };

    expect(bar.getBoundingClientRect().width).toBeCloseTo(inner() * 0.4, 0);
    // The frame is the track's padding: the bar sits inside it.
    expect(bar.getBoundingClientRect().height).toBeCloseTo(
      track.getBoundingClientRect().height - 8,
      0,
    );

    m.host.setAttribute('value', '150');
    await settle();
    expect(bar.getBoundingClientRect().width).toBeCloseTo(inner(), 0);

    m.host.setAttribute('value', '-5');
    await settle();
    expect(bar.getBoundingClientRect().width).toBe(0);
    m.unmount();
  });

  it('::part(bar) also paints the indeterminate sweep', async () => {
    const m = await recoloured({ indeterminate: true });

    const bar = m.part('bar');

    expect(getComputedStyle(bar).backgroundColor).toBe(BAR);
    expect(bar.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(bar.getAnimations().length).toBeGreaterThan(0);
    m.unmount();
  });

  it('keeps the bar visible in a forced-colors mode', async () => {
    const m = await recoloured({ value: 40 });

    const probe = document.createElement('div');

    probe.style.cssText = 'forced-color-adjust:none;background-color:Highlight';
    document.body.append(probe);

    await commands.emulateForcedColors('active');

    try {
      expect(matchMedia('(forced-colors: active)').matches).toBe(true);

      const highlight = getComputedStyle(probe).backgroundColor;

      const bar = getComputedStyle(m.part('bar')).backgroundColor;

      expect(bar).toBe(highlight);
      expect(bar).not.toBe(getComputedStyle(m.part('track')).backgroundColor);
    } finally {
      await commands.emulateForcedColors('none');
      probe.remove();
      m.unmount();
    }
  });
});

describe('in a tinted container', () => {
  /** What `role` see-through at 75% shows over the container's ground. */
  const seeThrough = (m: Mounted, role: string): string => {
    const probe = document.createElement('div');

    probe.style.backgroundColor = `color-mix(in srgb, var(${role}) 75%, var(--_c-tint-ground))`;
    m.host.append(probe);

    const colour = getComputedStyle(probe).backgroundColor;

    probe.remove();

    return colour;
  };

  // c-alert's message mixes a tint at half its share, for the labels on it
  // (ADR-0082). The bar carries no label: it paints its see-through look.
  it('mixes the bar and the track into the container at the full share', async () => {
    const m = await mount('c-alert', {
      html: '<c-progress-bar value="40"></c-progress-bar>',
    });

    const root = m.host.querySelector('c-progress-bar')!.shadowRoot!;

    const part = (name: string): Element =>
      root.querySelector(`[part~="${name}"]`)!;

    expect(getComputedStyle(part('bar')).backgroundColor).toBe(
      seeThrough(m, '--c-primary'),
    );
    expect(getComputedStyle(part('track')).backgroundColor).toBe(
      seeThrough(m, '--c-surface-muted'),
    );
    m.unmount();
  });
});

describe('c-progress-bar visual', () => {
  const VARIANTS: Record<string, boolean | number | string>[] = [
    { value: 0 },
    { label: 'Uploading files', value: 40 },
    { value: 100 },
    { label: 'Transfer failed', value: -5 },
    { label: 'Copying', 'single-line': true, value: 60 },
    { 'hide-details': true, value: 75 },
  ];

  it('determinate', async () => {
    const m = await mount('c-progress-bar', { attrs: VARIANTS[0] });

    m.stage.style.cssText =
      'display:flex;flex-direction:column;gap:12px;padding:8px;width:320px';

    for (const attrs of VARIANTS.slice(1)) {
      const bar = document.createElement('c-progress-bar');

      for (const [name, value] of Object.entries(attrs))
        bar.setAttribute(name, value === true ? '' : String(value));
      m.stage.append(bar);
    }

    await settle();
    await matchScreenshotInBothModes(m.stage, 'determinate');
    m.unmount();
  });

  it('indeterminate, its sweep paused mid-way', async () => {
    const m = await mount('c-progress-bar', {
      attrs: { indeterminate: true },
    });

    m.stage.style.cssText = 'display:block;padding:8px;width:320px';
    await settle();

    const animations = m.host.shadowRoot!.getAnimations();

    expect(animations.length).toBeGreaterThan(0);

    for (const animation of animations) {
      animation.pause();
      animation.currentTime = 500;
    }

    // The screenshot otherwise cancels an infinite animation to its first
    // frame, where the sweep is still off the track.
    await matchScreenshotInBothModes(m.stage, 'indeterminate', {
      screenshotOptions: { animations: 'allow' },
    });
    m.unmount();
  });

  it('inside an alert', async () => {
    const m = await mount('c-alert', {
      html: '<c-progress-bar label="Uploading files" value="40"></c-progress-bar>',
    });

    m.stage.style.cssText = 'display:block;padding:8px;width:320px';
    await settle();
    await matchScreenshotInBothModes(m.stage, 'in-an-alert');
    m.unmount();
  });
});
