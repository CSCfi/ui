/**
 * Conformance suite, kind "mode scope" (CONTEXT.md "Mode scope", ADR-0053):
 * every registered tag paints the same inside a `data-theme` scope as it does
 * when that mode is pinned on the document root. Nothing in a shadow root
 * declares a semantic token — it only reads one — so this should hold for free;
 * the suite exists because the ways to break it are invisible to the token lint
 * (a colour resolved in JS, or CSS that reaches the light DOM like c-table's
 * injected sheet, ADR-0037).
 */
import { afterAll, describe, expect, it } from 'vitest';

import { migratedTags } from '../../index';
import { mount, settled } from '../harness';
import { FIXTURES } from './kinds';
import { normalise } from './paint';

/** Colour properties whose computed value must not depend on where the mode was pinned. */
const PAINTED = [
  'backgroundColor',
  'borderBottomColor',
  'borderTopColor',
  'color',
  'fill',
  'outlineColor',
] as const;

type Reading = Record<string, string>;

const readParts = (host: Element): Reading[] =>
  [...host.shadowRoot!.querySelectorAll('[part]')].map((el) => {
    const computed = getComputedStyle(el);

    return Object.fromEntries(
      PAINTED.map((property) => [property, normalise(computed[property])]),
    );
  });

afterAll(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

describe.each(migratedTags)('%s', (tag) => {
  it('paints the same in a mode scope as under a pinned root', async () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const m = await mount(tag, FIXTURES[tag]);

    // A mode scope re-points tokens and paints nothing, so a `color` resolved
    // OUTSIDE the scope (harness.css puts one on `body`) would inherit in as a
    // literal and read as the outer mode. Opt into paint on the scope exactly
    // as the customization guide tells consumers to (`bg-surface
    // text-on-surface`), in both readings, so the mode's location is the only
    // variable.
    m.stage.style.backgroundColor = 'var(--c-surface)';
    m.stage.style.color = 'var(--c-on-surface)';

    // Flip one live instance rather than comparing two mounts: same node, same
    // generated ids, same transition state — so a difference is the cascade.
    // `settled()`, not `settle()`: components transition their colours, and a
    // zero-delay read returns the mode they are animating away from. A
    // transition-killing sheet does not help — `document.adoptedStyleSheets`
    // never reaches a shadow root, which is where those transitions live.
    m.stage.setAttribute('data-theme', 'dark');
    await settled();

    const inScope = readParts(m.host);

    m.stage.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    await settled();

    const atRoot = readParts(m.host);

    document.documentElement.setAttribute('data-theme', 'light');

    expect(inScope).toHaveLength(atRoot.length);
    expect(inScope).toEqual(atRoot);
  });
});
