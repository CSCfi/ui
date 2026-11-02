/**
 * Behaviour spec for c-tag: a flat tag drops its hover effect, but a flat
 * closeable tag's close button still takes the pointer.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents, settle } from '../../test/harness';

describe('c-tag', () => {
  it('a flat closeable tag closes from its button', async () => {
    const { deep, host } = await mount('c-tag', {
      attrs: { closeable: true, flat: true },
      html: 'Draft',
    });

    const events = recordEvents(host, ['close']);

    await userEvent.click(deep('c-icon-button', 'button'), { timeout: 2000 });

    expect(events.names()).toEqual(['close']);
  });
});

describe('c-tag as a toggle button', () => {
  it('Enter and Space press a plain tag, and active is its pressed state', async () => {
    const { host } = await mount('c-tag', { html: 'GPU' });

    const clicks = recordEvents(host, ['click']);

    expect(host.getAttribute('aria-pressed')).toBe('false');

    host.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(clicks.names()).toEqual(['click', 'click']);

    (host as { active?: boolean } & HTMLElement).active = true;
    await settle();

    expect(host.getAttribute('aria-pressed')).toBe('true');
  });

  it('a flat or closeable tag is no button and has no pressed state', async () => {
    for (const attrs of [{ flat: true }, { closeable: true }] as Record<
      string,
      boolean
    >[]) {
      const { host } = await mount('c-tag', { attrs, html: 'GPU' });

      expect(host.hasAttribute('aria-pressed'), JSON.stringify(attrs)).toBe(
        false,
      );
    }
  });
});
