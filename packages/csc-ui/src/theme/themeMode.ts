// The light-or-dark theme mode, resolved the same way tokens.css resolves it.

/** The light-or-dark state that selects which palette the semantic tokens resolve to. */
export type ThemeMode = 'dark' | 'light';

/**
 * Resolve the theme mode currently in effect, mirroring the cascade in
 * `tokens.css`: an explicit `data-theme` on the root wins (any value other
 * than `dark` is light — `:root:not([data-theme])` is what enables the OS
 * fallback); otherwise the OS preference; light where neither is available
 * (server rendering, no `matchMedia`). Re-run on a `data-theme` mutation and
 * on the `(prefers-color-scheme: dark)` media query's `change` event.
 *
 * @param root the element carrying `data-theme` — defaults to `<html>`
 */
export function themeMode(root?: Element | null): ThemeMode {
  const el =
    root ?? (typeof document !== 'undefined' ? document.documentElement : null);

  if (el?.hasAttribute('data-theme')) {
    return el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}
