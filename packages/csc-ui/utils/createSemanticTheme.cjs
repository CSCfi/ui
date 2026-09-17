/**
 * Emit the semantic-token layer for `@cscfi/csc-ui`.
 *
 * Takes the light/dark role→palette-step maps and produces four CSS blocks:
 *   1. `:root`                             — mode-invariant roles
 *   2. `:root, [data-theme='light']`       — light is the default/unset mode
 *   3. `[data-theme='dark']`               — explicit dark wins over the OS
 *   4. `@media (prefers-color-scheme: dark)` on a root that pins no mode
 *
 * Each semantic CSS variable is namespaced `--c-<role>` (like palette tokens,
 * to avoid clobbering consumer custom properties) and points at a palette token
 * via `var(--c-<step>)`, so a mode change re-themes the whole tree through token
 * inheritance with no per-component work. The matching `@theme inline` map in
 * `src/tailwind.css` exposes them as the per-role color utilities.
 *
 * The mode selectors are deliberately NOT anchored to `:root` (ADR-0053): any
 * element carrying `data-theme` opens a **mode scope**, and everything inside it
 * resolves the roles in that mode. Three things make that cascade work, and none
 * of them is obvious:
 *
 *   - `:root` and `[data-theme='dark']` have the same specificity (0,1,0), so
 *     `<html data-theme="dark">` resolves dark only because the dark block comes
 *     LATER IN SOURCE. Do not reorder these blocks.
 *   - The media selector is (0,3,0) so it beats the light block on `<html>` when
 *     the OS prefers dark; its two `:not()`s make it unmatchable the moment the
 *     root pins a mode. Matching `themeMode()`'s resolution, only the literal
 *     values `light` and `dark` pin a mode — anything else is ignored, so an
 *     unrelated `data-theme` from a consumer's own theming system is inert.
 *   - NESTING resolves by inheritance proximity, not specificity: a mode scope
 *     declares every role ON ITSELF, and an element's own declaration always
 *     beats an inherited one, so the nearest enclosing scope wins at any depth.
 *     A cascade layer cannot change that — which is also why a consumer's
 *     hand-written `:root { --c-surface }` override does not survive into a
 *     scope (they must write `:root, [data-theme]`).
 *
 * `color-scheme` rides along so UA chrome — scrollbars, textarea resize
 * grabbers, autofill, date/time pickers, `::selection` — follows the pinned
 * mode instead of the OS. It is a UA hint, not paint: a mode scope still draws
 * no background of its own.
 */

const { cssColor } = require('../src/theme/ramp.js');

// A role value is normally a palette-step key, referenced via var(--c-<step>).
// A literal color (the fixed logo brand mark and the frozen chart slots, kept
// off the palette so consumer re-seeding cannot recolor them) is emitted as
// oklch() like every palette token (ADR-0041); a functional value (e.g. the
// translucent divider ink's color-mix(), ADR-0036) is emitted verbatim.
const decls = (map, indent) =>
  Object.entries(map)
    .filter(([role]) => !role.startsWith('_'))
    .map(([role, value]) => {
      const resolved = value.startsWith('#')
        ? cssColor(value)
        : value.includes('(')
          ? value
          : `var(--c-${value})`;

      return `${indent}--c-${role}: ${resolved};`;
    })
    .join('\n');

module.exports = (light, dark, invariant) => {
  const lightDecls = decls(light, '\t');

  const darkDecls = decls(dark, '\t');

  const darkDeclsNested = decls(dark, '\t\t');

  const invariantDecls = decls(invariant, '\t');

  return [
    '/*',
    ' * Semantic tokens. Role-named properties that resolve to a',
    ' * different palette step per theme mode; components author against the',
    ' * per-role color utilities the @theme inline map in tailwind.css exposes.',
    ' *',
    ' * The mode selectors are not anchored to :root — any element carrying',
    ' * data-theme="light" or "dark" opens a mode scope for its subtree, and the',
    ' * nearest enclosing scope wins (ADR-0053). Block order is load-bearing:',
    " * :root and [data-theme='dark'] have equal specificity, so dark must stay",
    ' * last. See utils/createSemanticTheme.cjs for the full cascade rationale.',
    ' */',
    '',
    '/* Mode-invariant roles (identical in light and dark). */',
    ':root {',
    invariantDecls,
    '}',
    '',
    '/* Light is the default; any element may open a light mode scope. */',
    ":root,\n[data-theme='light'] {",
    '\tcolor-scheme: light;',
    lightDecls,
    '}',
    '',
    '/* Explicit dark, at the root or in any mode scope (wins over the OS preference). */',
    "[data-theme='dark'] {",
    '\tcolor-scheme: dark;',
    darkDecls,
    '}',
    '',
    '/* OS dark preference, only when the root pins no mode. */',
    '@media (prefers-color-scheme: dark) {',
    "\t:root:not([data-theme='light']):not([data-theme='dark']) {",
    '\t\tcolor-scheme: dark;',
    darkDeclsNested,
    '\t}',
    '}',
    '',
  ].join('\n');
};
