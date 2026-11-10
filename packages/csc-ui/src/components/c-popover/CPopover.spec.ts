/**
 * Behaviour spec for c-popover (CONTEXT.md "Popover", "Trigger"; ADR-0033,
 * ADR-0038). Seeded from the focus return to a csc-ui button trigger: Escape
 * from the panel's content dropped focus on the page.
 */
import { mdiDotsVertical } from '@mdi/js';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, settle } from '../../test/harness';

describe('focus return', () => {
  const TRIGGERS: Record<string, string> = {
    '<button>': '<button slot="trigger">Settings</button>',
    'c-button': '<c-button slot="trigger">Settings</c-button>',
    'c-icon-button': `<c-icon-button slot="trigger" aria-label="Settings" path="${mdiDotsVertical}"></c-icon-button>`,
  };

  /** What takes a trigger's focus: a native button, or a csc-ui host's own button. */
  const controlOf = (trigger: HTMLElement): HTMLElement =>
    trigger.shadowRoot?.querySelector<HTMLElement>('[part~="root"]') ?? trigger;

  it.each(Object.entries(TRIGGERS))(
    'Escape from the content returns focus to a %s trigger, ringed',
    async (_, html) => {
      const m = await mount('c-popover', {
        html: `${html}<button class="inside">Inside</button>`,
        props: { heading: 'Settings' },
      });

      const trigger = m.host.querySelector<HTMLElement>('[slot="trigger"]')!;

      const control = controlOf(trigger);

      const inside = m.host.querySelector<HTMLElement>('.inside')!;

      control.focus();
      await userEvent.keyboard('{Enter}');
      await expect
        .poll(() => m.part('panel').matches(':popover-open'))
        .toBe(true);

      // Focus stays on the trigger as the popover opens; Tab reaches the
      // content.
      await userEvent.tab();
      expect(document.activeElement).toBe(inside);

      const focus = vi.spyOn(HTMLElement.prototype, 'focus');

      try {
        await userEvent.keyboard('{Escape}');
        await expect
          .poll(() => m.part('panel').matches(':popover-open'))
          .toBe(false);
        await settle();

        expect(document.activeElement).toBe(trigger);
        expect(trigger.shadowRoot?.activeElement ?? trigger).toBe(control);
        expect(focus.mock.lastCall?.[0]?.focusVisible).toBe(true);
        expect(control.matches(':focus-visible')).toBe(true);
      } finally {
        focus.mockRestore();
        m.unmount();
      }
    },
  );
});

// `open` is two-way: it follows the panel whoever opened or closed it, so a
// popover the user closed opens again when the page sets it once more.
describe('open property', () => {
  it('follows the panel, and a popover the user closed reopens on open = true', async () => {
    const m = await mount('c-popover', {
      html: '<c-button slot="trigger">Settings</c-button><p>Body</p>',
      props: { heading: 'Settings' },
    });

    const host = m.host as { open: boolean } & HTMLElement;

    const panelOpen = (): boolean => m.part('panel').matches(':popover-open');

    await userEvent.click(
      m.host.querySelector('c-button')!.shadowRoot!.querySelector('button')!,
    );
    await expect.poll(panelOpen).toBe(true);
    expect(host.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(panelOpen).toBe(false);
    expect(host.open).toBe(false);

    host.open = true;
    await expect.poll(panelOpen).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => host.open).toBe(false);

    host.open = true;
    await expect.poll(panelOpen).toBe(true);
    m.unmount();
  });
});
