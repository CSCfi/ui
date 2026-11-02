/**
 * Behaviour spec for c-login-button: with an `href` the card is a link, and
 * without one a native button, so the keyboard activates it either way. It
 * used to be an `<a tabindex="0">` with no `href`, which Enter did not
 * activate.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents } from '../../test/harness';

describe('c-login-button', () => {
  it('is a button without an href, pressed by Enter and Space', async () => {
    const { host, part } = await mount('c-login-button', { html: 'Haka' });

    const clicks = recordEvents(host, ['click']);

    expect(part('root').localName).toBe('button');

    part('root').focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(clicks.names()).toEqual(['click', 'click']);
  });

  it('is a link with an href', async () => {
    const { part } = await mount('c-login-button', {
      attrs: { href: '/login/haka' },
      html: 'Haka',
    });

    expect(part('root').localName).toBe('a');
    expect(part('root').getAttribute('href')).toBe('/login/haka');
    expect(part('root').hasAttribute('tabindex')).toBe(false);
  });
});
