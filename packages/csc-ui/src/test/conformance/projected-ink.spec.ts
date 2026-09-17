/**
 * Conformance suite, kind "projected ink" (CONTEXT.md "Paired ink", ADR-0053):
 * a component that paints an OPAQUE surface and projects slotted content into
 * it declares the paired `on-` ink on that surface.
 *
 * A mode scope re-points the semantic tokens and paints nothing, so a `color`
 * resolved outside the component inherits in as a literal — and it inherits
 * through the `<slot>`, which is the flat-tree parent of every slotted node.
 * `<c-card data-theme="light">` on a dark page was the instance: the surface
 * flipped, the body copy did not.
 *
 * The probe is the slot itself. `getComputedStyle(slot).color` IS the ink
 * projected content takes, so no tag needs slotted fixture content. Assigned
 * elements are deliberately NOT probed: a `c-button` inside a `c-button-group`
 * reads the foreign ink on its host and anchors its own inside its shadow root,
 * which would read as a leak that is not one.
 *
 * Sibling suite, different property: `mode-scope.spec.ts` asserts a SAMENESS
 * (a scope paints like a pinned root). This asserts INDEPENDENCE, and it holds
 * in a single-mode page too — `body { color: #c00 }` around a `c-card` is the
 * same defect with no `data-theme` anywhere.
 *
 * Known limitations: a ground painted by `background-image` or a pseudo-element
 * reads as transparent and is skipped (c-login-card's artwork); a slot
 * forwarded into a child component (c-select → c-dropdown) misses its ground
 * here and is covered by the child's own slot; and a component that anchors
 * only through `::slotted(*)` would be flagged, which is fair — `::slotted()`
 * reaches assigned elements, never assigned text nodes.
 */
import { describe, expect, it } from 'vitest';

import { migratedTags } from '../../index';
import { mount, settled } from '../harness';
import { FIXTURES, KNOWN_INK_LEAKS } from './kinds';
import { isOpaque, normalise } from './paint';

/** No semantic token is pure sRGB red, so a match is the foreign ink itself. */
const FOREIGN = 'rgb(255, 0, 0)';

/**
 * The nearest opaque ancestor of a slot within its own shadow root, the host
 * included — the box whose paint the projected content reads against. `null`
 * when nothing along the chain is opaque: the page shows through, so inheriting
 * its ink is correct.
 */
const ground = (slot: Element, host: Element): Element | null => {
  for (let el = slot.parentElement; el; el = el.parentElement)
    if (isOpaque(getComputedStyle(el).backgroundColor)) return el;

  return isOpaque(getComputedStyle(host).backgroundColor) ? host : null;
};

describe.each(migratedTags)('%s', (tag) => {
  it('paints its own ink on every opaque surface it projects into', async () => {
    const m = await mount(tag, FIXTURES[tag]);

    // Ink a consumer's page could plausibly hold, set OUTSIDE the host where a
    // mode scope cannot re-point it.
    m.stage.style.color = FOREIGN;
    await settled();

    const leaking = [...m.host.shadowRoot!.querySelectorAll('slot')]
      .filter((slot) => ground(slot, m.host) !== null)
      .filter(
        (slot) =>
          normalise(getComputedStyle(slot).color) === normalise(FOREIGN),
      )
      .map((slot) => slot.getAttribute('name') ?? '(default)');

    if (KNOWN_INK_LEAKS.includes(tag)) {
      expect(
        leaking,
        'deviation fixed — remove the tag from KNOWN_INK_LEAKS',
      ).not.toEqual([]);
    } else {
      expect(
        leaking,
        'slots on an opaque surface inheriting an ink resolved outside the component',
      ).toEqual([]);
    }
  });
});
