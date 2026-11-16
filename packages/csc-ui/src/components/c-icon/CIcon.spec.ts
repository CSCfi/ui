/**
 * Behaviour spec for c-icon: an `aria-label` on the host names the icon, and
 * an ancestor's private `--_c-icon-size` sizes it over its own `size`.
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

  it('takes an ancestor’s --_c-icon-size over its own size', async () => {
    const { part, stage } = await mount('c-icon', {
      attrs: { path: mdiCheckCircle, size: 20 },
    });

    expect(part('root').getBoundingClientRect().width).toBe(20);

    stage.style.setProperty('--_c-icon-size', '11px');

    expect(part('root').getBoundingClientRect().width).toBe(11);
  });

  it('stays an unnamed graphic without one', async () => {
    const { part } = await mount('c-icon', { attrs: { path: mdiCheckCircle } });

    expect(part('root').hasAttribute('role')).toBe(false);
  });
});
