/**
 * Behaviour spec for c-icon-button: the host's ARIA attributes name and
 * describe the inner native button.
 */
import { describe, expect, it } from 'vitest';

import { mount, roleInMode, setThemeMode, settle } from '../../test/harness';

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

describe('c-icon-button loading', () => {
  it('keeps its slotted name and tells assistive technology it is busy', async () => {
    const { deep, host } = await mount('c-icon-button', {
      attrs: { loading: true },
      html: '<span class="sr-only">Save draft</span>',
    });

    const button = deep<HTMLButtonElement>('button');

    expect(host.querySelector('span')!.assignedSlot).not.toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');

    (host as { loading?: boolean } & HTMLElement).loading = false;
    await settle();

    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('c-icon-button disabled', () => {
  it('dims its icon to the faint ink, as c-button does, in dark mode too', async () => {
    setThemeMode('dark');

    for (const attrs of [
      {},
      { ghost: true },
      { text: true },
      { outlined: true },
    ] as Record<string, boolean>[]) {
      const { part } = await mount('c-icon-button', {
        attrs: { ...attrs, disabled: true },
      });

      expect(getComputedStyle(part('root')).color, JSON.stringify(attrs)).toBe(
        roleInMode('dark', '--c-on-surface-faint'),
      );
    }
  });
});
