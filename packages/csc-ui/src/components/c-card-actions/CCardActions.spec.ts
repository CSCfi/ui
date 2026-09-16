/**
 * Behaviour spec for c-card-actions: a footer row longer than the card flows
 * onto further rows instead of overflowing it.
 */
import { describe, expect, it } from 'vitest';

import { mount, settled } from '../../test/harness';

const ACTIONS = ['Cancel', 'Save draft', 'Publish now']
  .map((label) => `<c-button>${label}</c-button>`)
  .join('');

describe('c-card-actions', () => {
  it('wraps its actions inside the card instead of overflowing it', async () => {
    const m = await mount('c-card-actions', { html: ACTIONS });

    m.stage.style.cssText = 'display:block;padding:8px;width:280px';
    await settled();

    const root = m.part('root').getBoundingClientRect();

    const controls = Array.from(m.host.querySelectorAll('c-button')).map((b) =>
      b.shadowRoot!.querySelector('button')!.getBoundingClientRect(),
    );

    for (const r of controls) {
      expect(r.right).toBeLessThanOrEqual(root.right + 0.5);
      expect(r.left).toBeGreaterThanOrEqual(root.left - 0.5);
    }

    expect(
      new Set(controls.map((r) => Math.round(r.top))).size,
    ).toBeGreaterThan(1);
  });
});
