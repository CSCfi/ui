/**
 * Behaviour spec for c-icon: an `aria-label` on the host names the icon.
 */
import { mdiCheckCircle } from '@mdi/js';
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

describe('c-icon', () => {
  it('is an image named by the host aria-label', async () => {
    const { part } = await mount('c-icon', {
      attrs: { 'aria-label': 'Completed', path: mdiCheckCircle },
    });

    const svg = part('root');

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Completed');
    expect(svg.hasAttribute('ariaLabel')).toBe(false);
  });

  it('stays an unnamed graphic without one', async () => {
    const { part } = await mount('c-icon', { attrs: { path: mdiCheckCircle } });

    expect(part('root').hasAttribute('role')).toBe(false);
  });
});
