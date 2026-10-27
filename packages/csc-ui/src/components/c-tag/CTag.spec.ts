/**
 * Behaviour spec for c-tag: a flat tag drops its hover effect, but a flat
 * closeable tag's close button still takes the pointer.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, recordEvents } from '../../test/harness';

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
