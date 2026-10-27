/**
 * Behaviour spec for c-tags: the group's `size` reaches every tag in it,
 * including tags added after it mounts.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

describe('c-tags', () => {
  it('gives a tag added after mount the group size', async () => {
    const { host } = await mount('c-tags', {
      attrs: { size: 'small' },
      html: '<c-tag>One</c-tag>',
    });

    const added = document.createElement('c-tag');

    added.textContent = 'Two';
    host.append(added);
    await settle();

    expect(added.getAttribute('size')).toBe('small');
  });
});
