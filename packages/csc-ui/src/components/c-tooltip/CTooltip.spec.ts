/**
 * Behaviour spec for c-tooltip (CONTEXT.md "Trigger"; ADR-0038). Seeded from
 * the `open` property, which stayed at the page's last write while the user
 * showed and dismissed the tooltip.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount } from '../../test/harness';

// `open` is two-way: it follows the panel whoever showed or hid it, so a
// tooltip the user dismissed shows again when the page sets it once more.
describe('open property', () => {
  it('follows the panel, and a tooltip the user dismissed reopens on open = true', async () => {
    const m = await mount('c-tooltip', {
      html: '<c-button slot="trigger">Hover</c-button>',
      props: { delay: 0, text: 'Hint' },
    });

    const host = m.host as { open: boolean } & HTMLElement;

    const panelOpen = (): boolean => m.part('panel').matches(':popover-open');

    await userEvent.hover(
      m.host.querySelector('c-button')!.shadowRoot!.querySelector('button')!,
    );
    await expect.poll(panelOpen).toBe(true);
    expect(host.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(panelOpen).toBe(false);
    expect(host.open).toBe(false);

    await userEvent.unhover(
      m.host.querySelector('c-button')!.shadowRoot!.querySelector('button')!,
    );

    host.open = true;
    await expect.poll(panelOpen).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => host.open).toBe(false);

    host.open = true;
    await expect.poll(panelOpen).toBe(true);
    m.unmount();
  });
});
