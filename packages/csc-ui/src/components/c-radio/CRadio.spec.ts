/**
 * Behaviour spec for c-radio's name: an `aria-label` on the element names the
 * radio input; it used to be dropped.
 */
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

describe('c-radio name', () => {
  it('an aria-label on the element names the radio', async () => {
    const { host } = await mount('c-radio', {
      attrs: { 'aria-label': 'Monthly billing', value: 'monthly' },
    });

    expect(
      host.shadowRoot!.querySelector('input')!.getAttribute('aria-label'),
    ).toBe('Monthly billing');
  });
});
