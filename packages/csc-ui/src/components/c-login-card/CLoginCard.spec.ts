/**
 * Behaviour spec for c-login-card (CONTEXT.md "Mode scope", ADR-0053): the same
 * defect c-card had. The `root` part paints `bg-surface` and projects the card
 * sections into it, but declared no ink, so a login card pinning its own mode
 * flipped its surface and kept the page's — `<c-login-card data-theme="light">`
 * on a dark page left its body copy in dark-mode ink.
 */
import { describe, expect, it } from 'vitest';

import { mount, roleInMode, setThemeMode, settled } from '../../test/harness';

const CARD =
  '<c-login-card-title>Sign in to My CSC</c-login-card-title>' +
  '<c-login-card-content><p>Access your projects and services.</p></c-login-card-content>';

const inkOf = (el: Element | null): string => getComputedStyle(el!).color;

describe('c-login-card ink', () => {
  it('re-inks its slotted content when the card pins its own mode', async () => {
    setThemeMode('dark');

    const m = await mount('c-login-card', {
      attrs: { 'data-theme': 'light' },
      html: CARD,
    });

    await settled();

    const body = m.host.querySelector('p');

    expect(inkOf(body), 'slotted body copy').toBe(roleInMode('light'));
    expect(inkOf(body)).not.toBe(roleInMode('dark'));
  });

  it('still follows the document mode when the card pins none', async () => {
    setThemeMode('dark');

    const m = await mount('c-login-card', { html: CARD });

    await settled();

    expect(inkOf(m.host.querySelector('p'))).toBe(roleInMode('dark'));
  });
});
