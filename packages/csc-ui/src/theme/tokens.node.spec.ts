/**
 * The mode cascade in the generated `tokens.css` (ADR-0053, ADR-0054). The
 * selectors are a public CSS contract — consumers pin a mode with `data-theme`
 * on any element, or invert one with `data-theme-invert` — and most of them are
 * load-bearing in ways a reader would not guess: block ORDER decides
 * `<html data-theme="dark">` (equal specificity with `:root`), the media guard's
 * two `:not()`s are what keep an unknown value falling back to the OS instead of
 * forcing light, and those same `:not()`s on the invert selectors are what make
 * an explicit pin beat an inversion on the same element. A behaviour spec proves
 * the cascade in a browser; this proves the generator still emits it.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('../styles/css/tokens.css', import.meta.url)),
  'utf8',
);

/** Repeated on every invert selector: an explicit pin must beat an inversion. */
const PIN_GUARD = ":not([data-theme='light']):not([data-theme='dark'])";

/** Every selector that opens a mode block, in source order. */
const MODE_BLOCKS = [
  ":root,\n[data-theme='light'] {",
  "[data-theme='dark'] {",
  `\t:root${PIN_GUARD} {`,
  `\t[data-theme-invert]:where(${PIN_GUARD}) {`,
  `\t:root[data-theme-invert]${PIN_GUARD} {`,
] as const;

/** Blocks that resolve a mode: the five selectors above, two of them twice. */
const MODE_BLOCK_COUNT = 7;

describe('tokens.css mode cascade', () => {
  it('emits each mode block the expected number of times', () => {
    // The three pinned blocks appear once; each invert selector appears twice —
    // once per ambient mode it can sit in.
    const times = [1, 1, 1, 2, 2];

    MODE_BLOCKS.forEach((selector, i) => {
      expect(css.split(selector), selector).toHaveLength(times[i] + 1);
    });
  });

  it('keeps the dark block after the light block', () => {
    // Equal specificity (0,1,0): source order is the only thing that makes an
    // explicit `data-theme="dark"` on the root beat the `:root` light block.
    expect(css.indexOf(MODE_BLOCKS[1])).toBeGreaterThan(
      css.indexOf(MODE_BLOCKS[0]),
    );
  });

  it('scopes the mode blocks to any element, not just the root', () => {
    expect(css).not.toContain(":root[data-theme='light']");
    expect(css).not.toContain(":root[data-theme='dark']");
  });

  it('falls back to the OS preference only while the root pins no mode', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark) {');
    // A bare `:root:not([data-theme])` would send an unrelated value such as
    // `data-theme="auto"` to light instead of the OS preference.
    expect(css).not.toContain(':root:not([data-theme]) {');
  });

  it('pins color-scheme in every mode block so UA chrome follows', () => {
    // Seven blocks resolve a mode: light, dark, the OS fallback, two inverting
    // scopes and two inverting roots. Counting the declarations structurally
    // rather than per-keyword means a future block cannot be added without
    // this number moving deliberately.
    expect(css.match(/^\t+color-scheme: (?:dark|light);$/gm)).toHaveLength(
      MODE_BLOCK_COUNT,
    );
  });

  it('publishes the resolved mode as --c-mode in every mode block', () => {
    // The style query and themeMode() both key off this. A block that declares
    // color-scheme but forgets --c-mode leaves a nested inverting scope reading
    // a stale mode — invisible to every colour assertion, hence this guard.
    // The `^\t+` anchor excludes the `@container style(--c-mode: …)` preludes.
    expect(css.match(/^\t+--c-mode: (?:dark|light);$/gm)).toHaveLength(
      MODE_BLOCK_COUNT,
    );
  });

  it('keys the inverting scope off a style container query', () => {
    expect(css).toContain('@container style(--c-mode: light) {');
    expect(css).toContain('@container style(--c-mode: dark) {');
  });

  it('puts the invert blocks last, and never lets one match a pinned element', () => {
    // An inverting scope must override the light default it would otherwise
    // inherit at equal specificity (0,1,0), so it has to come after it.
    expect(css.indexOf('@container style(')).toBeGreaterThan(
      css.indexOf(MODE_BLOCKS[1]),
    );

    // Every `data-theme-invert` occurrence in a selector carries the guard.
    for (const line of css.split('\n')) {
      if (!line.includes('[data-theme-invert]')) continue;
      if (!line.trimStart().startsWith('[') && !line.includes(':root'))
        continue;

      expect(line, line).toContain(PIN_GUARD);
    }
  });

  it('keeps an inverting scope at the same specificity as every other mode block', () => {
    // (0,1,0), via :where(). At (0,3,0) the block would beat a consumer's
    // documented `:root, [data-theme], [data-theme-invert]` override on every
    // inverting scope, however late their sheet loads — silently, and with
    // nothing in the selector to explain it.
    expect(css).toContain(`\t[data-theme-invert]:where(${PIN_GUARD}) {`);
    expect(css).not.toContain(`\t[data-theme-invert]${PIN_GUARD} {`);
  });

  it('handles an inverting root through the OS preference, which a style query cannot reach', () => {
    // `:root` has no ancestor container, so `@container` can never match it.
    expect(css).toContain('@media (prefers-color-scheme: light) {');
    expect(css).toContain(`:root[data-theme-invert]${PIN_GUARD} {`);
  });

  it('leaves the mode-invariant roles and the palette at the root', () => {
    expect(css).toContain(':root, :host {');
    expect(css).toMatch(/Mode-invariant roles[^\n]*\*\/\n:root \{/);
  });
});
