/**
 * Behaviour spec for c-card-title: the `actions` slot sits at the right edge
 * beside the title while both fit, and drops onto its own row under the
 * title — starting at the left edge — when they do not. It used to stay
 * glued to the right edge after wrapping.
 */
import { describe, expect, it } from 'vitest';

import type { Mounted } from '../../test/harness';

import { matchScreenshotInBothModes, mount, settled } from '../../test/harness';

const TITLE = 'Notifications and account activity';

const ACTIONS =
  '<c-button slot="actions" ghost size="small">Mark all read</c-button>' +
  '<c-button slot="actions" ghost size="small">Settings</c-button>';

const mountTitle = async (width: number): Promise<Mounted> => {
  const m = await mount('c-card-title', { html: TITLE + ACTIONS });

  m.stage.style.cssText = `display:block;padding:8px;width:${width}px`;
  await settled();

  return m;
};

const contentBox = (m: Mounted): { left: number; right: number } => {
  const root = m.part('root');

  const rect = root.getBoundingClientRect();

  const style = getComputedStyle(root);

  return {
    left: rect.left + parseFloat(style.paddingLeft),
    right: rect.right - parseFloat(style.paddingRight),
  };
};

describe('c-card-title actions', () => {
  it('sit at the right edge beside the title when both fit', async () => {
    const m = await mountTitle(640);

    const heading = m.part('heading').getBoundingClientRect();

    const actions = m.part('actions').getBoundingClientRect();

    expect(Math.abs(actions.right - contentBox(m).right)).toBeLessThanOrEqual(
      1,
    );
    expect(actions.top).toBeLessThan(heading.bottom);
  });

  it('drop under the title, starting at the left edge, when they do not fit beside it', async () => {
    const m = await mountTitle(300);

    const heading = m.part('heading').getBoundingClientRect();

    const actions = m.part('actions').getBoundingClientRect();

    expect(actions.top, 'own row under the title').toBeGreaterThanOrEqual(
      heading.bottom,
    );
    expect(
      Math.abs(actions.left - contentBox(m).left),
      'left-aligned',
    ).toBeLessThanOrEqual(1);

    const controls = Array.from(m.host.querySelectorAll('c-button')).map((b) =>
      b.shadowRoot!.querySelector('button')!.getBoundingClientRect(),
    );

    expect(controls[0].left).toBeLessThan(controls[1].left);
  });

  it('visual: wrapped actions', async () => {
    const m = await mountTitle(300);

    await matchScreenshotInBothModes(m.stage, 'wrapped-actions');
  });
});
