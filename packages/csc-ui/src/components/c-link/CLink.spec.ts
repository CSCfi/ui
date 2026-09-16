/**
 * Behaviour spec for c-link. The hover background is the `link-subtle` tint
 * role: the `link-hover` role it painted before is the hover *ink*, which in
 * dark mode is a lighter step than the link text itself (1.6:1).
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, setThemeMode, settled } from '../../test/harness';

/** The computed colour a token resolves to, read off a probe in the light DOM. */
const tokenColor = (token: string): string => {
  const probe = document.createElement('div');

  probe.style.backgroundColor = `var(${token})`;
  document.body.append(probe);

  const value = getComputedStyle(probe).backgroundColor;

  probe.remove();

  return value;
};

describe('c-link', () => {
  for (const mode of ['light', 'dark'] as const) {
    it(`paints the link-subtle tint on hover under the link ink (${mode})`, async () => {
      setThemeMode(mode);

      const { part } = await mount('c-link', {
        attrs: { href: '#' },
        html: 'Read the guide',
      });

      await userEvent.hover(part('root'));
      await settled();

      const style = getComputedStyle(part('root'));

      expect(style.backgroundColor).toBe(tokenColor('--c-link-subtle'));
      expect(style.color).toBe(tokenColor('--c-link'));

      setThemeMode('light');
    });
  }
});
