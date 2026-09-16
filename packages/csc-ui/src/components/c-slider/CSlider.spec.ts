/**
 * Behaviour spec for c-slider's value bubble: it appears the moment the
 * thumb is pressed or the input focused — the 300ms transition only plays
 * on hide. It used to fade in over 300ms, and only on hover or focus, so on
 * a touch drag it lagged or never showed.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle, settled } from '../../test/harness';

describe('c-slider value bubble', () => {
  it('reveals instantly on focus and fades only on hide', async () => {
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

    expect(getComputedStyle(bubble).transitionDuration, 'instant reveal').toBe(
      '0s',
    );
    expect(getComputedStyle(bubble).opacity).toBe('1');

    input.blur();
    await settle();

    expect(getComputedStyle(bubble).transitionDuration, 'fades on hide').toBe(
      '0.3s',
    );
  });
});
