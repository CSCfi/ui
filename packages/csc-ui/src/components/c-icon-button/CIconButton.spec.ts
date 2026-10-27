/**
 * Behaviour spec for c-icon-button: the host's ARIA attributes name and
 * describe the inner native button.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from '../../test/harness';

describe('c-icon-button', () => {
  it('forwards host ARIA attributes to the button under their own names', async () => {
    const { host, part } = await mount('c-icon-button', {
      attrs: {
        'aria-expanded': 'false',
        'aria-haspopup': 'dialog',
        'aria-label': 'Open calendar',
      },
    });

    const button = part('root');

    expect(button.getAttribute('aria-label')).toBe('Open calendar');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.hasAttribute('ariahaspopup')).toBe(false);

    host.setAttribute('aria-expanded', 'true');
    host.removeAttribute('aria-haspopup');
    await settle();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.hasAttribute('aria-haspopup')).toBe(false);
  });
});
