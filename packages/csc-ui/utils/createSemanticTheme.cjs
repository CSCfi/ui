/**
 * Emit the semantic-token layer for `@cscfi/csc-ui`.
 *
 * Takes the light/dark role→palette-step maps and produces three CSS blocks:
 *   1. `:root, :root[data-theme='light']`  — light is the default/unset mode
 *   2. `:root[data-theme='dark']`          — explicit dark wins over the OS
 *   3. `@media (prefers-color-scheme: dark) :root:not([data-theme])`
 *                                           — OS preference when unset
 *
 * Each semantic CSS variable is namespaced `--c-<role>` (like palette tokens,
 * to avoid clobbering consumer custom properties) and points at a palette token
 * via `var(--c-<step>)`, so a mode change re-themes the whole tree through token
 * inheritance with no per-component work. The matching `@theme inline` map in
 * `src/tailwind.css` exposes them as the per-role color utilities.
 */

// A role value is normally a palette-step key, referenced via var(--c-<step>).
// A literal color (e.g. the fixed logo brand mark, kept off the palette so
// consumer re-seeding cannot recolor it) is emitted verbatim.
const decls = (map, indent) =>
  Object.entries(map)
    .filter(([role]) => !role.startsWith('_'))
    .map(([role, value]) => {
      const resolved = value.startsWith('#') ? value : `var(--c-${value})`;
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
    ' */',
    '',
    '/* Mode-invariant roles (identical in light and dark). */',
    ':root {',
    invariantDecls,
    '}',
    '',
    ':root,\n:root[data-theme=\'light\'] {',
    lightDecls,
    '}',
    '',
    '/* Explicit dark mode (wins over the OS preference). */',
    ':root[data-theme=\'dark\'] {',
    darkDecls,
    '}',
    '',
    '/* OS dark preference, only when no explicit data-theme is set. */',
    '@media (prefers-color-scheme: dark) {',
    '\t:root:not([data-theme]) {',
    darkDeclsNested,
    '\t}',
    '}',
    '',
  ].join('\n');
};
