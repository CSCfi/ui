/**
 * Behaviour spec for c-slider's value bubble: it appears the moment the
 * thumb is pressed or the input focused — the 300ms transition only plays
 * on hide. It used to fade in over 300ms, and only on hover or focus, so on
 * a touch drag it lagged or never showed.
 */
import { describe, expect, it } from 'vitest';

import {
  mount,
  roleInMode,
  settle,
  settled,
  withMotion,
} from '../../test/harness';

describe('c-slider value bubble', () => {
  it('reveals instantly on focus and fades only on hide', () =>
    withMotion(async () => {
      const m = await mount('c-slider', {
        props: { label: 'Volume', max: 100, min: 0, value: 40 },
      });

      await settled();

      const bubble = m.shadow('.c-slider__tooltip');

      const input = m.shadow<HTMLInputElement>('input');

      expect(getComputedStyle(bubble).opacity).toBe('0');
      expect(getComputedStyle(bubble).transitionDuration).toBe('0.3s');

      input.focus();
      await settle();

      expect(
        getComputedStyle(bubble).transitionDuration,
        'instant reveal',
      ).toBe('0s');
      expect(getComputedStyle(bubble).opacity).toBe('1');

      input.blur();
      await settle();

      expect(getComputedStyle(bubble).transitionDuration, 'fades on hide').toBe(
        '0.3s',
      );
    }));
});

describe('3.x attribute names (R1)', () => {
  it('a host aria-label names the range input, and name reaches it', async () => {
    const m = await mount('c-slider', {
      attrs: { 'aria-label': 'Volume', name: 'volume' },
    });

    const range = m.shadow<HTMLInputElement>('input[type="range"]');

    expect(range.getAttribute('aria-label')).toBe('Volume');
    expect(range.name).toBe('volume');
    expect(m.part('root').hasAttribute('aria-label')).toBe(false);
  });

  it('a visible label names it instead, and is not doubled', async () => {
    const m = await mount('c-slider', { attrs: { label: 'Volume' } });

    const range = m.shadow<HTMLInputElement>('input[type="range"]');

    expect(range.hasAttribute('aria-label')).toBe(false);
    expect(range.labels?.[0]?.textContent?.trim()).toBe('Volume');
  });
});

describe('numbers (decisions D12)', () => {
  it('reads numeric attributes as numbers and emits a number', async () => {
    const m = await mount<{ value: unknown } & HTMLElement>('c-slider', {
      attrs: { label: 'Cores', max: 8, value: 3 },
    });

    expect(m.host.value).toBe(3);

    const range = m.shadow<HTMLInputElement>('input[type="range"]');

    const details: unknown[] = [];
    m.host.addEventListener('update:value', (e) =>
      details.push((e as CustomEvent).detail),
    );
    range.value = '5';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();

    expect(details).toEqual([5]);
  });

  it('lays the marks and their numbers out from min to max', async () => {
    const m = await mount('c-slider', {
      attrs: {
        label: 'Range',
        labels: true,
        max: 20,
        min: 10,
        segments: 5,
        ticks: true,
        value: 13,
      },
    });

    const marks = m.shadowAll('[part~="ticks"] > span');

    expect(marks.map((mark) => mark.dataset.value)).toEqual([
      '10',
      '12',
      '14',
      '16',
      '18',
      '20',
    ]);

    // The end marks are not drawn; the fill has passed 12 but not 14.
    const passed = roleInMode('light', '--c-on-primary');

    expect(
      marks
        .slice(1, -1)
        .map((mark) => getComputedStyle(mark).backgroundColor === passed),
    ).toEqual([true, false, false, false]);
  });

  it('keeps the built-in value inside a narrower range', async () => {
    const m = await mount('c-slider', { attrs: { label: 'Cores', max: 8 } });

    expect(m.shadow('[data-tooltip]').getAttribute('data-tooltip')).toBe('8');
    expect(m.part('root').style.getPropertyValue('--_c-slider-position')).toBe(
      '100',
    );
  });

  it('writes the bubble in the page language, to the step', async () => {
    const lang = document.documentElement.lang;

    try {
      for (const [pageLang, shown] of [
        ['en', '2.5'],
        ['fi', '2,5'],
      ]) {
        document.documentElement.lang = pageLang!;

        const m = await mount('c-slider', {
          attrs: { label: 'Memory', max: 4, step: 0.5, value: 2.5 },
        });

        expect(m.shadow('[data-tooltip]').getAttribute('data-tooltip')).toBe(
          shown,
        );
      }
    } finally {
      document.documentElement.lang = lang;
    }
  });

  it('shows no unit unless one is set', async () => {
    const m = await mount('c-slider', { attrs: { label: 'Cores', value: 3 } });

    expect(m.shadow('[data-tooltip]').getAttribute('data-tooltip')).toBe('3');
  });
});
