/**
 * Reduced motion (CONTEXT.md, ADR-0057): with the OS preference set, the
 * shared sheet zeroes every CSS transition the components author, decorative
 * keyframes stop, and scripted motion stays still. Every spec already runs
 * under `reduce`; this one pins what that means and checks that motion comes
 * back when the preference is off.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, settle, withMotion } from './harness';

const ITEMS = ['A', 'B']
  .map(
    (h) =>
      `<c-accordion-item heading="${h}" value="${h.toLowerCase()}"><p>${h}</p></c-accordion-item>`,
  )
  .join('');

const accordionRoot = async () => {
  const m = await mount('c-accordion', { html: ITEMS });

  await settle();

  const item = m.host.querySelector('c-accordion-item')!;

  return item.shadowRoot!.querySelector<HTMLElement>('[part~="root"]')!;
};

describe('reduced motion', () => {
  it('zeroes component transitions, and they return without the preference', async () => {
    const reduced = await accordionRoot();

    expect(getComputedStyle(reduced).transitionDuration).toBe('0s');

    await withMotion(async () => {
      const moving = await accordionRoot();

      expect(getComputedStyle(moving).transitionDuration).toBe('0.3s');
    });
  });

  it('keeps a transition on elements a script awaits with transitionend', async () => {
    const tabs = await mount('c-tabs', {
      html: '<c-tab value="a">A</c-tab><c-tab value="b">B</c-tab>',
      props: { value: 'a' },
    });

    await settle();

    const scroll = tabs.shadow('.c-tabs__scroll');

    expect(getComputedStyle(scroll).transitionDuration).not.toBe('0s');
  });

  it('opens a field panel in place instead of dropping it in', async () => {
    const m = await mount('c-select', {
      html: '<c-option name="One" value="one">One</c-option><c-option name="Two" value="two">Two</c-option>',
      props: { label: 'Pick' },
    });

    await settle();
    await userEvent.click(m.shadow('c-input'));
    await settle();

    const list = m.deep('c-dropdown', 'ul');

    expect(getComputedStyle(list).animationName).toBe('none');
  });

  it('spawns no ripple, and one without the preference', async () => {
    const ripples = async (): Promise<number> => {
      const m = await mount('c-button', { html: 'Save' });

      await settle();
      await userEvent.click(m.shadow('button'));
      await settle();

      const count =
        m.host.shadowRoot!.querySelectorAll('[style*="scale"]').length;

      m.unmount();

      return count;
    };

    expect(await ripples()).toBe(0);

    await withMotion(async () => {
      expect(await ripples()).toBe(1);
    });
  });
});
