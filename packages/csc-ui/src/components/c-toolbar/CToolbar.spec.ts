/**
 * Behaviour spec for c-toolbar (CONTEXT.md "Toolbar", "Pinned", "Static";
 * ADR-0051). The bar pins itself with CSS sticky — no spacer, no `fixed` —
 * and the 3.x `class="relative"` switch is replaced by the `static` prop.
 */
import { describe, expect, it } from 'vitest';

import { matchScreenshotInBothModes, mount, settle } from '../../test/harness';

type ToolbarHost = { static: boolean } & HTMLElement;

const CONTENT =
  '<span>My Service</span><c-button style="margin-inline-start: auto" text>Log out</c-button>';

const mountToolbar = (attrs: Record<string, boolean | string> = {}) =>
  mount<ToolbarHost>('c-toolbar', { attrs, html: CONTENT, stage: false });

describe('c-toolbar', () => {
  it('is pinned by default: a sticky, toolbar-high bar with no spacer', async () => {
    const m = await mountToolbar();

    const root = m.part('root');

    const style = getComputedStyle(root);

    expect(style.position).toBe('sticky');
    expect(style.top).toBe('0px');
    expect(root.getBoundingClientRect().height).toBe(60);
    expect(m.host.hasAttribute('static')).toBe(false);
    expect(m.shadowAll('div')).toHaveLength(1);
  });

  it('static: the property reflects to the attribute and puts the bar in flow', async () => {
    const m = await mountToolbar();

    m.host.static = true;
    await settle();

    expect(m.host.hasAttribute('static')).toBe(true);
    expect(getComputedStyle(m.part('root')).position).toBe('relative');

    m.host.static = false;
    await settle();

    expect(m.host.hasAttribute('static')).toBe(false);
    expect(getComputedStyle(m.part('root')).position).toBe('sticky');
  });

  it('honours a bare static attribute', async () => {
    const m = await mountToolbar({ static: true });

    expect(getComputedStyle(m.part('root')).position).toBe('relative');
  });

  it('reads static="false" as pinned', async () => {
    const m = await mountToolbar({ static: 'false' });

    expect(getComputedStyle(m.part('root')).position).toBe('sticky');
  });

  it('visual: the bar', async () => {
    const m = await mountToolbar();

    await matchScreenshotInBothModes(m.part('root'), 'toolbar');
  });
});
