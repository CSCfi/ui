/**
 * The mode cascade in the generated `tokens.css` (ADR-0053). The selectors are
 * a public CSS contract — consumers pin a mode with `data-theme` on any element
 * — and three of the four are load-bearing in ways a reader would not guess:
 * block ORDER decides `<html data-theme="dark">` (equal specificity with
 * `:root`), and the media guard's two `:not()`s are what keep an unknown value
 * falling back to the OS instead of forcing light. A behaviour spec proves the
 * cascade in a browser; this proves the generator still emits it.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('../styles/css/tokens.css', import.meta.url)),
  'utf8',
);

/** Every selector that opens a mode block, in source order. */
const MODE_BLOCKS = [
  ":root,\n[data-theme='light'] {",
  "[data-theme='dark'] {",
  "\t:root:not([data-theme='light']):not([data-theme='dark']) {",
] as const;

describe('tokens.css mode cascade', () => {
  it('emits each mode block exactly once', () => {
    for (const selector of MODE_BLOCKS) {
      expect(css.split(selector)).toHaveLength(2);
    }
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
    expect(css.split('color-scheme: light;')).toHaveLength(2);
    expect(css.split('color-scheme: dark;')).toHaveLength(3);
  });

  it('leaves the mode-invariant roles and the palette at the root', () => {
    expect(css).toContain(':root, :host {');
    expect(css).toMatch(/Mode-invariant roles[^\n]*\*\/\n:root \{/);
  });
});
