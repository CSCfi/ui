/**
 * Behaviour spec for c-card (CONTEXT.md "Mode scope", ADR-0053): a card that
 * pins its own theme mode re-inks everything it projects. A mode scope
 * re-points the semantic tokens and paints nothing, so a `color` resolved
 * outside it inherits in as a literal — `<c-card data-theme="light">` on a dark
 * page flipped its surface but left the slotted body copy in the document's
 * dark ink, near-invisible on the light card. The card title read correctly
 * throughout because it declares its own ink; the surface did not declare any.
 */
import { describe, expect, it } from 'vitest';

import { mount, roleInMode, setThemeMode, settled } from '../../test/harness';

const CARD =
  '<c-card-title>Project members</c-card-title>' +
  '<c-card-content><p>Manage who has access to this project.</p></c-card-content>' +
  '<c-card-actions><c-button>Save</c-button></c-card-actions>';

const inkOf = (el: Element | null): string => getComputedStyle(el!).color;

describe('c-card ink', () => {
  it('re-inks its slotted content when the card pins its own mode', async () => {
    setThemeMode('dark');

    const m = await mount('c-card', {
      attrs: { 'data-theme': 'light' },
      html: CARD,
    });

    await settled();

    const body = m.host.querySelector('p');

    expect(inkOf(body), 'slotted body copy').toBe(roleInMode('light'));
    expect(inkOf(body)).not.toBe(roleInMode('dark'));

    // The title declares its own ink and always read correctly — the control
    // that shows the surface, not the document, is what the rest was missing.
    expect(
      inkOf(
        m.host
          .querySelector('c-card-title')!
          .shadowRoot!.querySelector('[part~="root"]'),
      ),
      'title, already correct before the fix',
    ).toBe(roleInMode('light'));
  });

  it('still follows the document mode when the card pins none', async () => {
    setThemeMode('dark');

    const m = await mount('c-card', { html: CARD });

    await settled();

    expect(inkOf(m.host.querySelector('p'))).toBe(roleInMode('dark'));
  });
});
