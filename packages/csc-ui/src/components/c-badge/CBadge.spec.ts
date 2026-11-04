import { describe, expect, it } from 'vitest';

import { contrastRatio, mount, setThemeMode } from '../../test/harness';

describe('c-badge', () => {
  // The count is text on the warning fill, so AA's 4.5:1 applies. White on
  // the light-mode warning fill read 3.16:1.
  it('inks its count at AA contrast against its fill in both modes', async () => {
    for (const mode of ['light', 'dark'] as const) {
      setThemeMode(mode);

      const { part } = await mount('c-badge', { html: '2' });

      const { backgroundColor, color } = getComputedStyle(part('root'));

      expect(
        contrastRatio(color, backgroundColor),
        mode,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
