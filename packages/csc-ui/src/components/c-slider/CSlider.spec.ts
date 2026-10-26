/**
 * Behaviour spec for c-slider's value bubble: it appears the moment the
 * thumb is pressed or the input focused — the 300ms transition only plays
 * on hide. It used to fade in over 300ms, and only on hover or focus, so on
 * a touch drag it lagged or never showed.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle, settled, withMotion } from '../../test/harness';

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

  it('shows no unit unless one is set', async () => {
    const m = await mount('c-slider', { attrs: { label: 'Cores', value: 3 } });

    expect(m.shadow('[data-tooltip]').getAttribute('data-tooltip')).toBe('3');
  });
});
