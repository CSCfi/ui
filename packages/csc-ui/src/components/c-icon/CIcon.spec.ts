/**
 * Behaviour spec for c-icon: an `aria-label` on the host names the icon, an
 * ancestor's private `--_c-icon-size` sizes it over its own `size`, and an
 * icon slot's `--_c-icon-default-size` sizes it only while `size` is unset.
 */
import { mdiCheckCircle } from '@mdi/js';
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

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

  it('is 24px unless set, and leaves `size` unset on the element', async () => {
    const { host, part } = await mount<{ size?: number } & HTMLElement>(
      'c-icon',
      { attrs: { path: mdiCheckCircle } },
    );

    expect(part('root').getBoundingClientRect().width).toBe(24);
    // Vue writes a withDefaults value back to the attribute, where it would
    // read as set.
    expect(host.hasAttribute('size')).toBe(false);
    expect(host.size).toBeUndefined();
  });

  it('takes an icon slot’s --_c-icon-default-size only while its size is unset', async () => {
    const { host, part, stage } = await mount<{ size?: number } & HTMLElement>(
      'c-icon',
      { attrs: { path: mdiCheckCircle } },
    );

    stage.style.setProperty('--_c-icon-default-size', '18px');

    expect(part('root').getBoundingClientRect().width).toBe(18);

    host.size = 16;
    await settle();

    expect(part('root').getBoundingClientRect().width).toBe(16);

    host.removeAttribute('size');
    await settle();

    expect(part('root').getBoundingClientRect().width).toBe(18);
  });

  it('stays an unnamed graphic without one', async () => {
    const { part } = await mount('c-icon', { attrs: { path: mdiCheckCircle } });

    expect(part('root').hasAttribute('role')).toBe(false);
  });
});
