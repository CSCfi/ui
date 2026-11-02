/**
 * Behaviour spec for c-csc-logo's name: an image named "CSC", or by an
 * `aria-label` on the element. Its built-in title used to name it
 * "CSC_logo_no_tagline".
 */
import { describe, expect, it } from 'vitest';

import { mount } from '../../test/harness';

describe('c-csc-logo', () => {
  it('is an image named CSC', async () => {
    const { part } = await mount('c-csc-logo');

    const svg = part('root');

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.querySelector('title')?.textContent).toBe('CSC');
  });

  it('takes its name from an aria-label on the element', async () => {
    const { part } = await mount('c-csc-logo', {
      attrs: { 'aria-label': 'CSC – IT Center for Science' },
    });

    expect(part('root').getAttribute('aria-label')).toBe(
      'CSC – IT Center for Science',
    );
  });
});
