/**
 * Emit the semantic-token layer for `@cscfi/csc-ui`.
 *
 * Takes the light/dark role→palette-step maps and produces eight CSS blocks:
 *   1. `:root`                             — mode-invariant roles
 *   2. `:root, [data-theme='light']`       — light is the default/unset mode
 *   3. `[data-theme='dark']`               — explicit dark wins over the OS
 *   4. `@media (prefers-color-scheme: dark)` on a root that pins no mode
 *   5-6. `@container style(--c-mode: …)`   — the inverting scope (ADR-0054)
 *   7-8. `:root[data-theme-invert]` per OS preference — inverting at the root
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
 *
 * THE INVERTING SCOPE (ADR-0054). `data-theme-invert` resolves the roles in the
 * OPPOSITE mode to the one the element sits in — dark on a light page, light on
 * a dark page — so a panel can stay contrary to whatever the user picked. It is
 * a separate attribute rather than a third `data-theme` value precisely so the
 * "only light and dark pin a mode" rule above survives untouched.
 *
 * Every mode block declares `--c-mode` (the keyword `light` or `dark`) beside
 * `color-scheme`, and the two `@container style(--c-mode: …)` blocks key off it.
 * Four non-obvious things hold this together:
 *
 *   - A style query evaluates against the nearest ANCESTOR container, never the
 *     element itself. That is what makes this terminate: the inverting element
 *     reads the `--c-mode` it INHERITED, then declares the opposite ON ITSELF.
 *     No cycle, and the same inheritance-proximity rule as a pinned scope — so
 *     an invert inside an invert is the original mode again, and an invert
 *     inside a `data-theme="dark"` island resolves against the island, not the
 *     document.
 *   - The `:not()`s repeat on the invert selectors so an explicit `data-theme`
 *     on the SAME element wins: pinning beats inverting. On an element they are
 *     wrapped in `:where()` so the block stays (0,1,0) like every other mode
 *     block — see PIN_GUARD for why that matters to consumers.
 *   - `:root` has no ancestor container, so the style query can never match it.
 *     `<html data-theme-invert>` is handled instead by the two
 *     `prefers-color-scheme` blocks, which invert the OS preference. They are
 *     (0,4,0) and so beat both the light block and the (0,3,0) OS block.
 *   - `--c-mode` is emitter-owned. Style queries compare computed values, which
 *     tolerate whitespace and comments but ARE case-sensitive, so nothing should
 *     hand-write this property. It needs no `@property` registration: an element
 *     with no `--c-mode` simply never matches, which is the correct inert
 *     behaviour (and the same thing a browser without style queries does — an
 *     inverting scope degrades to a no-op, never to a half-inverted subtree).
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

/**
 * Repeated on every invert selector so an explicit `data-theme` on the same
 * element wins over `data-theme-invert` — pinning beats inverting. HTML
 * attributes are unordered, so some tiebreak is needed; this is the one that
 * keeps "the element says what mode it is" the stronger statement.
 *
 * Two weights, and the difference is load-bearing:
 *
 *   - On an ELEMENT the guard is wrapped in `:where()`, which matches
 *     identically but contributes no specificity. Without it the block would be
 *     (0,3,0) and a consumer's override — the documented
 *     `:root, [data-theme], [data-theme-invert] { … }`, which is (0,1,0) —
 *     would lose on every inverting scope no matter how late their sheet loads.
 *     Every mode block staying (0,1,0) is what makes "source order decides" the
 *     whole cascade story a consumer has to learn.
 *   - At the ROOT the guard stays unwrapped, because those blocks must
 *     out-specify the (0,3,0) OS-preference block above them. That asymmetry is
 *     inherited from ADR-0053, where the OS block already out-specifies a
 *     consumer override on `:root`.
 */
const PIN_GUARD = ":not([data-theme='light']):not([data-theme='dark'])";

/** The same guard, weightless — for selectors that must stay (0,1,0). */
const PIN_GUARD_WEIGHTLESS = `:where(${PIN_GUARD})`;

module.exports = (light, dark, invariant) => {
  const lightDecls = decls(light, '\t');

  const darkDecls = decls(dark, '\t');

  const lightDeclsNested = decls(light, '\t\t');

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
    ' * last.',
    ' *',
    ' * data-theme-invert opens an INVERTING scope: the opposite of the mode it',
    ' * sits in, keyed off the --c-mode keyword through a style container query',
    ' * (ADR-0054). --c-mode is emitter-owned; do not hand-write it.',
    ' *',
    ' * See utils/createSemanticTheme.cjs for the full cascade rationale.',
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
    '\t--c-mode: light;',
    lightDecls,
    '}',
    '',
    '/* Explicit dark, at the root or in any mode scope (wins over the OS preference). */',
    "[data-theme='dark'] {",
    '\tcolor-scheme: dark;',
    '\t--c-mode: dark;',
    darkDecls,
    '}',
    '',
    '/* OS dark preference, only when the root pins no mode. */',
    '@media (prefers-color-scheme: dark) {',
    `\t:root${PIN_GUARD} {`,
    '\t\tcolor-scheme: dark;',
    '\t\t--c-mode: dark;',
    darkDeclsNested,
    '\t}',
    '}',
    '',
    '/*',
    ' * The inverting scope: the opposite of the mode the element sits in.',
    ' * The style query reads the nearest ANCESTOR container, never the element',
    ' * itself, so the scope declares the opposite ON ITSELF and nesting resolves',
    ' * by inheritance proximity exactly as a pinned scope does (ADR-0054).',
    ' */',
    '@container style(--c-mode: light) {',
    `\t[data-theme-invert]${PIN_GUARD_WEIGHTLESS} {`,
    '\t\tcolor-scheme: dark;',
    '\t\t--c-mode: dark;',
    darkDeclsNested,
    '\t}',
    '}',
    '',
    '@container style(--c-mode: dark) {',
    `\t[data-theme-invert]${PIN_GUARD_WEIGHTLESS} {`,
    '\t\tcolor-scheme: light;',
    '\t\t--c-mode: light;',
    lightDeclsNested,
    '\t}',
    '}',
    '',
    '/*',
    ' * Inverting at the root. :root has no ancestor container, so the style',
    ' * query above can never match it; <html data-theme-invert> inverts the OS',
    ' * preference instead. (0,4,0) beats both the light block and the OS block.',
    ' */',
    '@media (prefers-color-scheme: dark) {',
    `\t:root[data-theme-invert]${PIN_GUARD} {`,
    '\t\tcolor-scheme: light;',
    '\t\t--c-mode: light;',
    lightDeclsNested,
    '\t}',
    '}',
    '',
    '@media (prefers-color-scheme: light) {',
    `\t:root[data-theme-invert]${PIN_GUARD} {`,
    '\t\tcolor-scheme: dark;',
    '\t\t--c-mode: dark;',
    darkDeclsNested,
    '\t}',
    '}',
    '',
  ].join('\n');
};
